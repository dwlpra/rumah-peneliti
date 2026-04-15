"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAddress(accounts[0] || null);
      });
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const prov = new ethers.BrowserProvider(window.ethereum);
    const accounts = await prov.send("eth_requestAccounts", []);
    const sign = await prov.getSigner();
    setProvider(prov);
    setSigner(sign);
    setAddress(accounts[0]);
  };

  const disconnect = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
  };

  return (
    <WalletContext.Provider value={{ address, provider, signer, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
