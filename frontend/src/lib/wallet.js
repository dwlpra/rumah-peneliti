"use client";
import { createContext, useContext, useState } from "react";
const WalletContext = createContext(null);
export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const connect = async () => { if (window.ethereum) { const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }); setAddress(accounts[0]); } };
  const disconnect = () => { setAddress(null); };
  return <WalletContext.Provider value={{ address, connect, disconnect }}>{children}</WalletContext.Provider>;
}
export const useWallet = () => useContext(WalletContext);
