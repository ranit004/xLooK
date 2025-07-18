"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ResultsDashboard } from "@/components/results-dashboard"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { UrlChecker } from "@/components/url-checker"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { ContactSection } from "@/components/contact-section"
import { FaqSection } from "@/components/faq-section"

interface Result {
  id: string
  title: string
  description: string
  status: 'safe' | 'warning' | 'danger'
  value?: string
  category?: 'security' | 'info' | 'technical'
  details?: string
}

// Convert backend response to dashboard format
const convertBackendResponseToDashboard = (data: any, url: string): Result[] => {
  const results: Result[] = []
  
  // Overall Safety
  results.push({
    id: 'overall',
    title: 'Overall Safety',
    description: data.verdict === 'SAFE' ? 'No threats detected by security scanners' : 'Threats detected by security scanners',
    status: data.verdict === 'SAFE' ? 'safe' : 'danger',
    value: data.verdict,
    category: 'security',
    details: `Based on VirusTotal and Google Safe Browsing analysis`
  })
  
  // VirusTotal Results
  if (data.virusTotalData) {
    const vt = data.virusTotalData
    const hasThreats = (vt.malicious > 0 || vt.phishing > 0 || vt.suspicious > 0)
    results.push({
      id: 'virustotal',
      title: 'VirusTotal Scan',
      description: hasThreats 
        ? `${vt.malicious + vt.phishing + vt.suspicious} threats detected`
        : `Clean - ${vt.harmless} security vendors flagged this URL as safe`,
      status: hasThreats ? 'danger' : 'safe',
      value: hasThreats ? `${vt.malicious + vt.phishing + vt.suspicious} threats` : 'Clean',
      category: 'security',
      details: `Malicious: ${vt.malicious}, Phishing: ${vt.phishing}, Suspicious: ${vt.suspicious}, Harmless: ${vt.harmless}`
    })
  }
  
  // Google Safe Browsing Results
  if (data.googleSafeBrowsingData) {
    const gsb = data.googleSafeBrowsingData
    const hasThreats = gsb.matches && gsb.matches.length > 0
    results.push({
      id: 'safebrowsing',
      title: 'Google Safe Browsing',
      description: hasThreats ? 'Threats detected' : 'No threats detected',
      status: hasThreats ? 'danger' : 'safe',
      value: hasThreats ? 'Threats Found' : 'Clean',
      category: 'security',
      details: hasThreats 
        ? `Threat types: ${gsb.matches.map((m: any) => m.threatType).join(', ')}`
        : 'No malware or phishing detected'
    })
  }
  
  return results
}

export default function Home() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [checkedUrl, setCheckedUrl] = useState<string>('')
  const [showAllSections, setShowAllSections] = useState(true)

  const handleUrlCheck = async (url: string) => {
    setLoading(true)
    setResults([])
    setCheckedUrl(url)
    
    try {
      const response = await fetch('/api/check-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        // Handle quota limit reached (429 error)
        if (response.status === 429) {
          const errorData = await response.json()
          if (errorData.limitReached) {
            alert(errorData.message || 'You have reached the maximum number of URL checks. Please sign up for unlimited checks.')
            window.location.href = '/login'
            return
          }
        }
        throw new Error('Failed to check URL')
      }
      
      const data = await response.json()
      // If the response has a 'results' property, use it directly
      // Otherwise, convert from the backend format
      const convertedResults = data.results || convertBackendResponseToDashboard(data, url)
      setResults(convertedResults)
    } catch (error) {
      console.error('Error checking URL:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClearResults = () => {
      setResults([])
      setCheckedUrl('')
    }

    window.addEventListener('clearResults', handleClearResults)
    return () => window.removeEventListener('clearResults', handleClearResults)
  }, [])
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection onUrlCheck={handleUrlCheck} isLoading={loading} />
      {loading && <LoadingSkeleton />}
      {!loading && results.length > 0 && (
        <ResultsDashboard results={results} url={checkedUrl} />
      )}
      {!loading && results.length === 0 && (
        <>
          <FeaturesSection />
          <PricingSection />
          <FaqSection />
          <ContactSection />
        </>
      )}
    </div>
  )
}
