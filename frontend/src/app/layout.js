import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme"
import { LanguageProvider } from "@/contexts/language"
import { WalletProvider } from "@/contexts/wallet"
import { ToastProvider } from "@/lib/toast"
import { TopLoadingBar } from "@/components/shared/top-loading-bar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "RumahPeneliti — Decentralized Research Platform",
  description:
    "AI-powered academic research platform with blockchain verification and micropayments on 0G Network",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <TopLoadingBar />
            <LanguageProvider>
              <WalletProvider>
                <main className="min-h-screen flex flex-col">
                  {children}
                </main>
              </WalletProvider>
            </LanguageProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
