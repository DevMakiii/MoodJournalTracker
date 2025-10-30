import { Skeleton } from "@/components/ui/skeleton"

export function MoodEntrySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2 text-center">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Mood selector skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 mx-auto" />
        <div className="flex justify-center gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Notes skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-8 w-8 rounded-md"
            style={{ 
              animationDelay: `${i * 0.05}s`,
              animation: "pulse 2s infinite"
            }} 
          />
        ))}
      </div>
    </div>
  )
}

export function MoodHistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-32" />
      
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-32" />
      
      <div className="h-64 w-full">
        {/* Mock chart with bars */}
        <div className="flex items-end justify-center space-x-2 h-full">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="w-8 rounded-t-md"
              style={{ 
                height: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`
              }} 
            />
          ))}
        </div>
      </div>
      
      {/* Legend skeleton */}
      <div className="flex justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <MoodEntrySkeleton />
          </div>
          
          <div className="bg-card rounded-lg p-6 border">
            <MoodHistorySkeleton />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 border">
            <CalendarSkeleton />
          </div>
          
          <div className="bg-card rounded-lg p-6 border">
            <ChartSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}