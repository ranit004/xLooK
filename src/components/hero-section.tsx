"use client"

import { useState } from "react"
import { Search, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeroSectionProps {
  onUrlCheck: (url: string) => Promise<void>
  isLoading?: boolean
}

export function HeroSection({ onUrlCheck, isLoading = false }: HeroSectionProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    const trimmedUrl = url.trim()
    
    if (!trimmedUrl) {
      setError("Please enter a URL")
      return
    }
    
    if (!validateUrl(trimmedUrl)) {
      setError("Please enter a valid URL (e.g., https://example.com)")
      return
    }
    
    try {
      await onUrlCheck(trimmedUrl)
    } catch (err) {
      setError("Failed to check URL. Please try again.")
    }
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Check if a URL is safe
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Scan any URL for threats using VirusTotal, Google Safe Browsing, and more.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                🔍
              </div>
              <Input
                type="text"
                placeholder="Enter URL to scan (e.g., https://example.com)"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError("")
                }}
                className={`text-lg py-6 pl-10 rounded-xl shadow-lg border-2 ${error ? 'border-red-500' : 'border-border hover:border-primary/50 focus:border-primary'} transition-all duration-200`}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check URL
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </form>
        
        <div className="text-sm text-muted-foreground">
          <p>
            Powered by VirusTotal, Google Safe Browsing, and other security services
          </p>
        </div>
      </div>
    </section>
  )
}
