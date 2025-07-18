"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Globe } from "lucide-react"

interface RedirectChainProps {
  url: string
  steps?: string[]
}

export function RedirectChain({ url, steps = [] }: RedirectChainProps) {
  const redirectSteps = steps.length > 0 ? steps : [url]
  
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Redirect Path</h4>
      <div className="flex flex-col space-y-2">
        {redirectSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center space-x-2 flex-1">
              <div className="flex-shrink-0">
                {index === 0 ? (
                  <Globe className="w-4 h-4 text-blue-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <span className="text-sm font-mono text-muted-foreground truncate">
                {step}
              </span>
            </div>
            {index < redirectSteps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
      {redirectSteps.length === 1 && (
        <p className="text-xs text-muted-foreground">
          Direct connection - no redirects detected
        </p>
      )}
    </div>
  )
}
