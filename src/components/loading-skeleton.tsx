"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingSkeleton() {
  return (
    <section className="py-12 px-4 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="h-8 bg-muted rounded-lg w-64 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-muted rounded-lg w-96 mx-auto animate-pulse" />
        </motion.div>

        {/* Overall Safety Card Skeleton */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-muted animate-pulse">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="h-8 bg-muted rounded-lg w-48 mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-72 mx-auto animate-pulse" />
            </CardHeader>
            <CardContent className="text-center">
              <div className="h-10 bg-muted rounded-lg w-24 mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded-lg w-64 mx-auto animate-pulse" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                      <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                    </div>
                    <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 bg-muted rounded w-full animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                      <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                      <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                    </div>
                    <div className="h-px bg-muted my-2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="h-8 bg-muted rounded-full w-64 mx-auto animate-pulse" />
        </motion.div>
      </div>
    </section>
  )
}
