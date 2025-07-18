"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Clock, AlertTriangle, CheckCircle, Crown, TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface ScanResult {
  id: string
  url: string
  status: 'safe' | 'malicious' | 'warning'
  scannedAt: string
  threats: string[]
  scanTime: number
}

interface UserStats {
  scansToday: number
  scansThisMonth: number
  totalScans: number
  plan: 'free' | 'premium' | 'pro'
  dailyLimit: number
  monthlyLimit: number
}

export function UserDashboard() {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Mock user stats since authentication is removed
      const mockStats: UserStats = {
        scansToday: 5,
        scansThisMonth: 23,
        totalScans: 147,
        plan: 'free',
        dailyLimit: 10,
        monthlyLimit: 100
      }
      setUserStats(mockStats)
      
      // Mock scan history
      const mockHistory: ScanResult[] = [
        {
          id: '1',
          url: 'https://example.com',
          status: 'safe',
          scannedAt: new Date().toISOString(),
          threats: [],
          scanTime: 324
        },
        {
          id: '2', 
          url: 'https://suspicious-site.com',
          status: 'warning',
          scannedAt: new Date(Date.now() - 3600000).toISOString(),
          threats: ['Suspicious redirects'],
          scanTime: 567
        }
      ]
      setScanHistory(mockHistory)
      
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'malicious':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Shield className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'malicious':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'premium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getDailyProgress = () => {
    if (!userStats) return 0
    if (userStats.plan !== 'free') return 0 // Unlimited for premium/pro
    return (userStats.scansToday / userStats.dailyLimit) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Guest User
          </p>
        </div>
        {userStats && (
          <Badge className={getPlanBadgeColor(userStats.plan)}>
            {userStats.plan === 'pro' && <Crown className="h-3 w-3 mr-1" />}
            {userStats.plan.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.scansToday || 0}
              {userStats?.plan === 'free' && userStats?.dailyLimit && (
                <span className="text-sm text-muted-foreground font-normal">
                  /{userStats.dailyLimit}
                </span>
              )}
            </div>
            {userStats?.plan === 'free' && userStats?.dailyLimit && (
              <div className="mt-2">
                <Progress value={getDailyProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {userStats.dailyLimit - userStats.scansToday} scans remaining today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.scansThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              URL scans this month
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalScans || 0}</div>
            <p className="text-xs text-muted-foreground">
              All-time URL scans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Section for Free Users */}
      {userStats?.plan === 'free' && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Get unlimited scans and advanced features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  • Unlimited daily scans
                </p>
                <p className="text-sm text-muted-foreground">
                  • Advanced threat detection
                </p>
                <p className="text-sm text-muted-foreground">
                  • Priority support
                </p>
              </div>
              <Button>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for History and Settings */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Scan History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>
                Your recent URL safety scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scanHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No scans yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start by checking a URL on the home page
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanHistory.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(scan.status)}
                        <div>
                          <p className="font-medium break-all">{scan.url}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(scan.scannedAt), 'PPp')}</span>
                            <span>•</span>
                            <span>{scan.scanTime}ms</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(scan.status)}>
                        {scan.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      guest@example.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {userStats?.plan || 'free'} plan
                    </p>
                  </div>
                  {userStats?.plan === 'free' && (
                    <Button variant="outline" size="sm">
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
