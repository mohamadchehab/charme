import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/sidebar-component";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Charme Chat",
  description: "The integration-focused AI chat tool that lets you do just about anything.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full `}
      >
  <ThemeProvider

            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
  <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className=" flex justify-between m-4 ">
          <SidebarTrigger className="cursor-pointer" />
          <div className="flex items-center gap-2">
            <Link href="/integrations" >
            <Button variant={'outline'} className="cursor-pointer">Integrations</Button>
            </Link>
 
            <ModeToggle />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
    </ThemeProvider>
      </body>
    </html>
  );
}
