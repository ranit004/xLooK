"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  ShieldAlert,
  Lock,
  Globe,
  Calendar,
  MapPin,
  Link,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Result {
  id: string
  title: string
  description: string
  status: 'safe' | 'warning' | 'danger'
  value?: string
  category?: 'security' | 'info' | 'technical'
  details?: string
}

interface ResultsDashboardProps {
  results: Result[]
  url: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    case 'warning':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    case 'danger':
      return 'text-red-500 bg-red-500/10 border-red-500/20'
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
  }
}

const getStatusIcon = (status: string, size = 'w-5 h-5') => {
  switch (status) {
    case 'safe':
      return <CheckCircle className={`${size} text-green-600`} />
    case 'warning':
      return <AlertTriangle className={`${size} text-yellow-600`} />
    case 'danger':
      return <XCircle className={`${size} text-red-600`} />
    default:
      return <Info className={`${size} text-gray-600`} />
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'security':
      return <Shield className="w-4 h-4" />
    case 'info':
      return <Info className="w-4 h-4" />
    case 'technical':
      return <Link className="w-4 h-4" />
    default:
      return <Search className="w-4 h-4" />
  }
}

const getCardIcon = (id: string) => {
  switch (id) {
    case 'overall':
      return <ShieldCheck className="w-6 h-6" />
    case 'ssl':
      return <Lock className="w-6 h-6" />
    case 'whois':
      return <Calendar className="w-6 h-6" />
    case 'geolocation':
      return <MapPin className="w-6 h-6" />
    case 'redirects':
      return <Link className="w-6 h-6" />
    case 'domain-age':
      return <Calendar className="w-6 h-6" />
    default:
      return <Globe className="w-6 h-6" />
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

// Individual Result Card Component with modern design
function ResultCard({ result }: { result: Result }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <Card className="group h-full bg-card/40 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-600 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getStatusColor(result.status)} transition-colors duration-300`}>
              {getCardIcon(result.id)}
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {result.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(result.status, 'w-4 h-4')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {result.value && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge 
                variant={result.status === 'safe' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}
                className="font-medium"
              >
                {result.value}
              </Badge>
            </div>
          )}
          
          {result.details && (
            <div className="text-xs text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30 border border-border/20">
              <p>{result.details}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ResultsDashboard({ results, url }: ResultsDashboardProps) {
  if (results.length === 0) {
    return null
  }

  const overallResult = results.find(r => r.id === 'overall')
  const otherResults = results.filter(r => r.id !== 'overall')

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Security Report</h2>
          <p className="text-lg text-muted-foreground mb-1">Detailed analysis and status of your URL's safety</p>
          <p className="text-muted-foreground">
            Analysis results for <span className="font-mono text-foreground break-all whitespace-normal">{url}</span>
          </p>
        </motion.div>

        {/* Overall Safety Card */}
        {overallResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className={`border-2 ${getStatusColor(overallResult.status)}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${getStatusColor(overallResult.status)}`}>
                    {overallResult.status === 'safe' ? (
                      <ShieldCheck className="w-12 h-12 text-green-600" />
                    ) : overallResult.status === 'warning' ? (
                      <ShieldAlert className="w-12 h-12 text-yellow-600" />
                    ) : (
                      <ShieldX className="w-12 h-12 text-red-600" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-2xl">{overallResult.title}</CardTitle>
                <p className="text-muted-foreground">{overallResult.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <Badge 
                  variant={overallResult.status === 'safe' ? 'default' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {overallResult.value}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {overallResult.details}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {otherResults.map((result) => (
            <motion.div
              key={result.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ResultCard result={result} />
            </motion.div>
          ))}
        </motion.div>

        {/* Summary Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
            <CheckCircle className="w-4 h-4" />
            Analysis completed at {new Date().toLocaleString()}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
