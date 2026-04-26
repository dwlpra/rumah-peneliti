"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"

const WalletContext = createContext(null)

const ZERO_G_CHAIN_ID = "0x4105" // 16661
const ZERO_G_CHAIN = {
  chainId: ZERO_G_CHAIN_ID,
  chainName: "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: ["https://evmrpc.0g.ai"],
  blockExplorerUrls: ["https://chainscan.0g.ai"],
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [balance, setBalance] = useState(null)
  const [chainId, setChainId] = useState(null)

  const fetchBalance = async (addr) => {
    try {
      const prov = new ethers.JsonRpcProvider("https://evmrpc.0g.ai")
      const bal = await prov.getBalance(addr)
      setBalance(Number(ethers.formatEther(bal)).toFixed(4))
    } catch (e) {
      setBalance(null)
    }
  }

  const switchNetwork = async () => {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ZERO_G_CHAIN_ID }],
      })
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ZERO_G_CHAIN],
        })
      }
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        const addr = accounts[0] || null
        setAddress(addr)
        if (addr) fetchBalance(addr)
        else setBalance(null)
      })
      window.ethereum.on("chainChanged", (id) => {
        setChainId(id)
        if (address && id === ZERO_G_CHAIN_ID) fetchBalance(address)
      })

      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts[0]) {
            setAddress(accounts[0])
            fetchBalance(accounts[0])
          }
        })
    }
  }, [])

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!")
      return
    }
    const prov = new ethers.BrowserProvider(window.ethereum)
    const accounts = await prov.send("eth_requestAccounts", [])
    const sign = await prov.getSigner()
    setProvider(prov)
    setSigner(sign)
    setAddress(accounts[0])
    fetchBalance(accounts[0])

    const currentChain = await window.ethereum.request({
      method: "eth_chainId",
    })
    setChainId(currentChain)
    if (currentChain !== ZERO_G_CHAIN_ID) {
      await switchNetwork()
    }
  }

  const disconnect = () => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setBalance(null)
    setChainId(null)
  }

  const isCorrectNetwork = chainId === ZERO_G_CHAIN_ID

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        signer,
        connect,
        disconnect,
        balance,
        chainId,
        isCorrectNetwork,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
