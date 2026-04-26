"use client"

import { Lock, Loader2, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Paywall({ priceEth, address, onUnlock, paying, isFree }) {
  if (isFree) return null

  return (
    <div className="relative mt-8 rounded-lg overflow-hidden">
      {/* Blurred preview of content */}
      <div
        className="blur-[6px] pointer-events-none select-none opacity-40 max-h-[300px] overflow-hidden"
        aria-hidden="true"
      >
        <div className="space-y-4 p-8">
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-4/5 bg-muted rounded" />
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background flex items-center justify-center p-6">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">This article requires payment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Purchase access to read the full curated article
              </p>
            </div>

            <div>
              <span className="text-3xl font-bold text-primary">{priceEth}</span>
              <span className="text-lg text-muted-foreground ml-1.5">0G</span>
            </div>

            <Button
              onClick={onUnlock}
              disabled={paying}
              className="w-full"
              size="lg"
            >
              {paying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : !address ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Unlock for {priceEth} 0G
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Secured by 0G blockchain smart contract
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
