import './globals.css';
import { LanguageProvider } from '@/LanguageContext';
import { ThemeProvider } from '@/ThemeContext';
import { WalletProvider } from '@/lib/wallet';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>RumahPeneliti.com — Decentralized Research Platform</title>
        <meta name="description" content="Decentralized journal platform with AI curation and blockchain micropayments" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#080812" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
