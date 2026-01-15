import type { Metadata } from 'next'
import { Provider } from "@/components/ui/provider" // Chakra-ui

export const metadata: Metadata = {
  title: 'Starknet-Session',
  description: 'Demo of Starknet session',
  icons: {
    icon: "./favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider>
            {children}
        </Provider>
      </body>
    </html>
  )
}
