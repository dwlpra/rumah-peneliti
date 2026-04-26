"use client"

import { Wallet, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet"
import { AddressDisplay } from "@/components/shared/address-display"

export function WalletButton() {
  const { address, connect, disconnect, balance } = useWallet()

  if (!address) {
    return (
      <Button onClick={connect} size="sm" className="gap-2">
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <AddressDisplay address={address} className="p-0 text-foreground hover:text-foreground" />
          {balance && (
            <Badge variant="secondary" className="text-xs">
              {balance} 0G
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-mono text-xs">
          {address.slice(0, 10)}...{address.slice(-8)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {balance && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Balance: <span className="font-semibold text-foreground">{balance} 0G</span>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
