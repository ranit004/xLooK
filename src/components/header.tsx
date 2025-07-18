"use client"

import { Shield, Loader2, Menu, X } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "../contexts/AuthContext"
import { UserMenu } from "./auth/UserMenu"
import { Button } from "./ui/button"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold flex items-center">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">XL</span>
            <span className="blink inline-block text-2xl">👀</span>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">k</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
            )}
          </nav>
          
          {/* Authentication Section */}
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="sm" className="text-sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
            <div className="h-6 w-px bg-border" />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t bg-background">
            <Link
              href="/"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            
            <div className="pt-4 pb-3 border-t">
              {isLoading ? (
                <div className="flex items-center px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <>
                  {isAuthenticated ? (
                    <div className="px-3 py-2">
                      <UserMenu />
                    </div>
                  ) : (
                    <div className="px-3 py-2 space-y-2">
                      <Link href="/login" className="block">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/login" className="block">
                        <Button size="sm" className="w-full">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
              <div className="px-3 py-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
