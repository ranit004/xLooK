"use client"

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-4 bg-gradient-to-br from-background/50 via-background to-background/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-8">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              It's free — pass it forward
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              No subscriptions, no hidden fees. Just pure URL safety checking for everyone.
            </p>
            <div className="mt-6 flex justify-center space-x-2">
              <span className="text-2xl animate-pulse">💝</span>
              <span className="text-2xl animate-bounce">🔒</span>
              <span className="text-2xl animate-pulse">🌟</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
