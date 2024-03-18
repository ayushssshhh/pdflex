import { cn, constructMetadata } from '@/lib/util'
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import "simplebar-react/dist/simplebar.min.css"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
 
import  { ourFileRouter } from "@/app/api/uploadthing/core";


import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='light'>

      <Providers>
        <body className={cn(
          'min-h-screen font-sans antialiased grainy',
          inter.className
        )}>

          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <Toaster />
          <Navbar />
          {children}
          <Footer />
        </body>
      </Providers>

    </html>
  )
}
