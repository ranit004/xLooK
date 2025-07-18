"use client"

import { Shield, Loader2 } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "../contexts/AuthContext"
import { UserMenu } from "./auth/UserMenu"
import { Button } from "./ui/button"
import Link from "next/link"

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();

  const scrollToSection = (sectionId: string) => {
    // Clear any existing results to show all sections
    const event = new CustomEvent('clearResults');
    window.dispatchEvent(event);
    
    // Wait a bit for the sections to render, then scroll
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If section doesn't exist, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo and Brand - Left */}
        <div className="flex-1">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity w-fit ml-4 cursor-pointer">
            <span className="text-2xl font-bold flex items-center">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">XL</span>
              <span className="blink inline-block text-2xl mx-0.5">👀</span>
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">k</span>
            </span>
          </Link>
        </div>
        
        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center">
          <button onClick={() => scrollToSection('home')} className="hover:opacity-80 transition-opacity cursor-pointer">Home</button>
          <button onClick={() => scrollToSection('features')} className="hover:opacity-80 transition-opacity cursor-pointer">Features</button>
          <button onClick={() => scrollToSection('pricing')} className="hover:opacity-80 transition-opacity cursor-pointer">Pricing</button>
          <button onClick={() => scrollToSection('faq')} className="hover:opacity-80 transition-opacity cursor-pointer">FAQ</button>
          <button onClick={() => scrollToSection('support')} className="hover:opacity-80 transition-opacity cursor-pointer">Support</button>
        </nav>
        
        {/* Right Side Actions */}
        <div className="flex items-center flex-1 justify-end">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <ThemeToggle className="h-10 w-10" />
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ThemeToggle className="h-10 w-10" />
                  <Link href="/login">
                    <Button variant="ghost" size="default" className="text-base hover:bg-primary/10 cursor-pointer h-10">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
