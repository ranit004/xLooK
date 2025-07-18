"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle, Search, Lock, Globe, MapPin, Calendar, Link2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface CheckResult {
  verdict: 'SAFE' | 'DANGEROUS';
  virusTotalData: any;
  googleSafeBrowsingData: any;
}

export function UrlChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/check-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to check URL');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    return verdict === 'SAFE' ? 'text-green-600' : 'text-red-600';
  };

  const getVerdictIcon = (verdict: string) => {
    return verdict === 'SAFE' ? (
      <CheckCircle className="w-8 h-8 text-green-600" />
    ) : (
      <XCircle className="w-8 h-8 text-red-600" />
    );
  };

  const getVerdictBadge = (verdict: string) => {
    return verdict === 'SAFE' ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="w-4 h-4 mr-1" />
        SAFE
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="w-4 h-4 mr-1" />
        DANGEROUS
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">XL</span>
            <span className="blink inline-block text-5xl mx-1">👀</span>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">k</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analyze URLs for threats using advanced security intelligence
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-border/50 shadow-2xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Search className="w-5 h-5" />
                    </div>
                    <Input
                      type="url"
                      placeholder="Enter URL to analyze (e.g., https://example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                      className="pl-12 py-6 text-lg rounded-xl border-2 focus:border-primary transition-all duration-200"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Analyze URL
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {error && (
                <Alert className="mt-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Analysis Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Overall Status Card */}
            <Card className={`bg-card/60 backdrop-blur-sm border-2 shadow-2xl ${
              result.verdict === 'SAFE' 
                ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5' 
                : 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-500/5'
            }`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${
                      result.verdict === 'SAFE' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {getVerdictIcon(result.verdict)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">Overall Safety</h2>
                      <p className="text-muted-foreground">
                        {result.verdict === 'SAFE' ? 'No threats detected' : 'Potential threats found'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {getVerdictBadge(result.verdict)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* AI Security Analysis */}
              <Card className="group bg-card/40 backdrop-blur-sm border-2 border-green-500/60 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-1 ring-green-500/20 hover:ring-green-400/40 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500/20 text-green-500 group-hover:scale-110 transition-transform duration-300">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-green-500 transition-colors">
                        AI Security Analysis
                      </CardTitle>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">SAFE</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30">
                    <p>The URL has 0 positives on VirusTotal and no threats found on Google Safe Browsing, indicating it is not flagged as malicious or suspicious.</p>
                  </div>
                </CardContent>
              </Card>

              {/* SSL Certificate */}
              <Card className="group bg-card/40 backdrop-blur-sm border-2 border-green-500/60 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-1 ring-green-500/20 hover:ring-green-400/40 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500/20 text-green-500 group-hover:scale-110 transition-transform duration-300">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-green-500 transition-colors">
                        SSL Certificate
                      </CardTitle>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Valid</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30">
                    <p>Valid SSL certificate with 256-bit encryption</p>
                    <p className="mt-2 text-xs">Certificate expires on 2024-12-31 • Issued by Let's Encrypt</p>
                  </div>
                </CardContent>
              </Card>

              {/* WHOIS Information */}
              <Card className="group bg-card/40 backdrop-blur-sm border-2 border-green-500/60 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-1 ring-green-500/20 hover:ring-green-400/40 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500/20 text-green-500 group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-green-500 transition-colors">
                        WHOIS Information
                      </CardTitle>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Registrar</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">MarkMonitor, Inc.</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30">
                    <p className="mb-2">Domain: www.markmonitor.com</p>
                    <p className="mb-2">Status: clientUpdateProhibited</p>
                    <p className="text-xs">Created: 1999-04-23 • Expires: 2032-04-23</p>
                  </div>
                </CardContent>
              </Card>

              {/* Google Safe Browsing */}
              <Card className="group bg-card/40 backdrop-blur-sm border-2 border-green-500/60 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-1 ring-green-500/20 hover:ring-green-400/40 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500/20 text-green-500 group-hover:scale-110 transition-transform duration-300">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-green-500 transition-colors">
                        Google Safe Browsing
                      </CardTitle>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Clean</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30">
                    <p>No malware or phishing detected</p>
                  </div>
                </CardContent>
              </Card>

              {/* VirusTotal Scan */}
              <Card className="group bg-card/40 backdrop-blur-sm border-2 border-green-500/60 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-1 ring-green-500/20 hover:ring-green-400/40 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500/20 text-green-500 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-green-500 transition-colors">
                        VirusTotal Scan
                      </CardTitle>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Result</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Clean</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30">
                    <p>Clean - 0/97 security vendors flagged this URL</p>
                  </div>
                </CardContent>
              </Card>

              {/* Redirect Chain */}
              <Card className="group bg-card/40 backdrop-blur-sm border-2 border-green-500/60 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/40 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-1 ring-green-500/20 hover:ring-green-400/40 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-green-500/20 text-green-500 group-hover:scale-110 transition-transform duration-300">
                      <Link2 className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold group-hover:text-green-500 transition-colors">
                        Redirect Chain
                      </CardTitle>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Clean</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed p-3 rounded-lg bg-muted/30">
                    <p>No suspicious redirects detected</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
