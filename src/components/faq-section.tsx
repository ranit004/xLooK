"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const faqData: FaqItem[] = [
  {
    question: "How accurate are the URL security checks?",
    answer: "It uses multiple security databases including VirusTotal and Google Safe Browsing to provide comprehensive threat detection. We analyze URLs against millions of known malicious sites and use real-time scanning to ensure high accuracy."
  },
  {
    question: "What types of threats can you detect?",
    answer: "It detects various threats including malware, phishing sites, suspicious downloads, scam websites, and potentially harmful content. Our multi-layered approach combines reputation-based filtering with behavioral analysis."
  },
  {
    question: "How many URL checks do I get for free?",
    answer: "Free users get 3 URL checks. For unlimited checks create an account."
  },
  {
    question: "Is my data kept private when checking URLs?",
    answer: "Yes, it takes privacy seriously. It doesn't store the URLs you check or any personal browsing data. All checks are processed securely and results are not logged or shared with third parties."
  },
  {
    question: "How fast are the security checks?",
    answer: "Most URL checks complete within 2-5 seconds. Processing time may vary depending on the URL complexity and current server load, but it strives to provide results as quickly as possible."
  },
  {
    question: "Can I check URLs in bulk?",
    answer: "Bulk URL checking is available for the users who have a valid account. You can upload a list of URLs and get comprehensive security reports for all of them at once."
  },
  {
    question: "What should I do if a URL is flagged as dangerous?",
    answer: "If a URL is flagged as dangerous, avoid clicking on it. The threat details will show you what type of risk was detected. You can also report false positives if you believe a URL was incorrectly flagged."
  }
  
]

export function FaqSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about URL security checking
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
