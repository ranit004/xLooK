"use client"

import { Shield, Search, RefreshCw, Globe, Zap, Lock, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Shield,
    title: "SSL Certificate Check",
    description: "Verify SSL certificates, encryption strength, and certificate validity to ensure secure connections.",
    color: "text-green-500"
  },
  {
    icon: Search,
    title: "WHOIS Lookup",
    description: "Get detailed domain registration information including owner details, creation date, and expiration.",
    color: "text-blue-500"
  },
  {
    icon: RefreshCw,
    title: "Redirect Chains",
    description: "Track and analyze URL redirections to detect malicious redirects and suspicious chains.",
    color: "text-purple-500"
  },
  {
    icon: Globe,
    title: "Geolocation Detection",
    description: "Identify server location, hosting provider, and geographic information for better analysis.",
    color: "text-orange-500"
  },
  {
    icon: Zap,
    title: "Threat Scoring",
    description: "AI-powered risk assessment with comprehensive threat scoring based on multiple security databases.",
    color: "text-red-500"
  },
  {
    icon: Lock,
    title: "Real-time Protection",
    description: "Access to latest threat intelligence and real-time updates from security vendors worldwide.",
    color: "text-cyan-500"
  },
  {
    icon: Clock,
    title: "Historical Analysis",
    description: "View historical scan results and track reputation changes over time for better insights.",
    color: "text-indigo-500"
  },
  {
    icon: CheckCircle,
    title: "Batch Scanning",
    description: "Scan multiple URLs simultaneously with bulk upload functionality for enterprise users.",
    color: "text-emerald-500"
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Comprehensive URL Analysis
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced security scanning with multiple threat detection engines and comprehensive analysis tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm hover:scale-105 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-4xl font-bold text-primary mb-2">10M+</div>
            <div className="text-muted-foreground">URLs Scanned</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="text-4xl font-bold text-green-500 mb-2">99.9%</div>
            <div className="text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="text-4xl font-bold text-blue-500 mb-2">&lt; 2s</div>
            <div className="text-muted-foreground">Average Scan Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
