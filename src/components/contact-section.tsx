"use client"

import { Mail, Twitter, Phone, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ContactSection() {
  return (
    <section id="support" className="py-24 px-4 bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions or need support? We're here to help you secure your digital journey.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm shadow-xl border-2 border-border/80 hover:border-border hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary mb-4 mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">
                Contact Information
              </CardTitle>
              <CardDescription className="text-sm mb-4 text-muted-foreground">
                Reach out to us through any of these channels
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/20 text-blue-500">
                    <Twitter className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1">Follow us on X</h4>
                    <Link 
                      href="https://x.com/Ranit_bro" 
                      target="_blank" 
                      className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium hover:underline"
                    >
                      @Ranit_bro
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 text-green-500">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1">Email Support</h4>
                    <a 
                      href="mailto:ranit1697@gmail.com" 
                      className="text-green-500 hover:text-green-600 transition-colors duration-200 text-sm font-medium hover:underline"
                    >
                      ranit1697@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/20 text-purple-500">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-base mb-1">Response Time</h4>
                  <p className="text-muted-foreground text-sm">Usually within 24 hours</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border/50">
                <h4 className="font-semibold text-lg mb-4 text-center">Need immediate help?</h4>
                <Link href="https://x.com/Ranit_bro" target="_blank" className="block">
                  <Button 
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Twitter className="w-5 h-5 mr-2" />
                    Message on X
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer Note */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Built & Designed by Ranit</span>
          </div>
        </div>
      </div>
    </section>
  )
}
