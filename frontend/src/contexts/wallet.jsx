"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { ethers } from "ethers"
import { loginWithWallet, logout as authLogout, getStoredToken, getStoredAddress } from "@/lib/auth"
import { useToast } from "@/lib/toast"

const WalletContext = createContext(null)

// Read chain config from env, fallback to 0G Mainnet
const CHAIN_ID_DECIMAL = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "16661", 10)
const CHAIN_ID_HEX = "0x" + CHAIN_ID_DECIMAL.toString(16)
const CHAIN_RPC = process.env.NEXT_PUBLIC_CHAIN_RPC || "https://evmrpc.0g.ai"

const ZERO_G_CHAIN = {
  chainId: CHAIN_ID_HEX,
  chainName: CHAIN_ID_DECIMAL === 16661 ? "0G Mainnet" : "0G Galileo Testnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: [CHAIN_RPC],
  blockExplorerUrls: ["https://chainscan.0g.ai"],
}

export function WalletProvider({ children }) {
  const { addToast } = useToast()
  const [address, setAddress] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [balance, setBalance] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const addressRef = useRef(null)
  const ethereumRef = useRef(null) // track which wallet provider is active

  // Sync auth state: check if stored token matches current address
  const syncAuthState = useCallback((addr) => {
    if (!addr) {
      setIsAuthed(false)
      return
    }
    const token = getStoredToken()
    const storedAddr = getStoredAddress()
    setIsAuthed(
      !!token &&
      !!storedAddr &&
      storedAddr.toLowerCase() === addr.toLowerCase()
    )
  }, [])

  const fetchBalance = useCallback(async (addr) => {
    try {
      const prov = new ethers.JsonRpcProvider(CHAIN_RPC)
      const bal = await prov.getBalance(addr)
      setBalance(Number(ethers.formatEther(bal)).toFixed(4))
    } catch {
      setBalance(null)
    }
  }, [])

  const switchNetwork = useCallback(async () => {
    const ethereum = ethereumRef.current || window.ethereum
    if (!ethereum) return
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAIN_ID_HEX }],
      })
    } catch (e) {
      if (e.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ZERO_G_CHAIN],
        })
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return

    // If user explicitly disconnected this session, skip auto-reconnect
    if (sessionStorage.getItem("wallet_disconnected")) return

    // Use whichever provider was selected, or default window.ethereum
    const ethereum = ethereumRef.current || window.ethereum

    const handleAccountsChanged = (accounts) => {
      const addr = accounts[0] || null
      addressRef.current = addr
      setAddress(addr)
      if (addr) fetchBalance(addr)
      else setBalance(null)
      syncAuthState(addr)
    }

    const handleChainChanged = (id) => {
      setChainId(id)
      if (addressRef.current && id === CHAIN_ID_HEX) fetchBalance(addressRef.current)
    }

    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)

    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts[0]) {
          addressRef.current = accounts[0]
          setAddress(accounts[0])
          fetchBalance(accounts[0])
          syncAuthState(accounts[0])
        }
      })
      .catch(() => {})

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [fetchBalance, syncAuthState])

  const connect = useCallback(async (walletProvider) => {
    const ethereum = walletProvider || window.ethereum
    if (!ethereum) {
      addToast("No wallet detected. Please install one.", "error")
      return
    }
    try {
      // Clear disconnect flag — user is intentionally connecting
      sessionStorage.removeItem("wallet_disconnected")

      // Store the selected provider so event listeners use the right one
      ethereumRef.current = ethereum

      // Step 1: Request wallet connection (MetaMask popup: select account)
      const prov = new ethers.BrowserProvider(ethereum)
      const accounts = await prov.send("eth_requestAccounts", [])
      const sign = await prov.getSigner()
      setProvider(prov)
      setSigner(sign)
      setAddress(accounts[0])
      addressRef.current = accounts[0]
      fetchBalance(accounts[0])

      const currentChain = await ethereum.request({ method: "eth_chainId" })
      setChainId(currentChain)
      if (currentChain !== CHAIN_ID_HEX) {
        await switchNetwork()
      }

      // Step 2: Sign message for authentication (MetaMask popup: sign message)
      try {
        addToast("Please sign the message to verify your identity...", "info")
        await loginWithWallet(accounts[0])
        setIsAuthed(true)
        addToast("Wallet connected & verified!", "success")
      } catch (authErr) {
        // Wallet is connected but auth failed/rejected — still usable for read-only
        setIsAuthed(false)
        addToast("Connected but not verified. Sign the message for full access.", "warning")
      }
    } catch (err) {
      addToast("Wallet connection failed: " + (err.message || "User rejected"), "error")
    }
  }, [fetchBalance, switchNetwork, addToast])

  const disconnect = useCallback(() => {
    sessionStorage.setItem("wallet_disconnected", "1")
    authLogout()
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setBalance(null)
    setChainId(null)
    setIsAuthed(false)
    addressRef.current = null
    ethereumRef.current = null
  }, [])

  const isCorrectNetwork = chainId === CHAIN_ID_HEX

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
        isAuthed,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
