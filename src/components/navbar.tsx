"use client"

import { Loader2 } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "../contexts/AuthContext"
import { UserMenu } from "./auth/UserMenu"
import { Button } from "./ui/button"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const scrollToSection = (sectionId: string) => {
    if (pathname === "/") {
      // Already on home — clear results then scroll
      const event = new CustomEvent("clearResults")
      window.dispatchEvent(event)
      setTimeout(() => {
        const element = document.getElementById(sectionId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }, 100)
    } else {
      // Navigate home with the section hash; clearResults fires on home mount via hash
      router.push(`/#${sectionId}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="container flex h-16 items-center px-4 md:px-6">

        {/* Logo — Left */}
        <div className="flex-1">
          <Link href="/" className="flex items-center gap-0.5 w-fit hover:opacity-90 transition-opacity group">
            <span className="text-2xl font-extrabold tracking-tight leading-none text-white">
              <span>XL</span>
              <span className="inline-block mx-0.5 blink select-none" aria-hidden="true">👀</span>
              <span>k</span>
            </span>
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-1 flex-1 justify-center">
          {[
            { label: "Home", id: "home" },
            { label: "Features", id: "features" },
            { label: "Pricing", id: "pricing" },
            { label: "FAQ", id: "faq" },
            { label: "Support", id: "support" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-all duration-150 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm hidden sm:inline">Loading...</span>
            </div>
          ) : (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <ThemeToggle className="h-9 w-9" />
                  <UserMenu />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ThemeToggle className="h-9 w-9" />
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-medium border-border/60 hover:bg-accent hover:border-primary/40 transition-all duration-150"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-sm transition-all duration-150"
                    >
                      Sign Up
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
