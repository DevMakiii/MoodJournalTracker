"use client"

import { Suspense } from "react"
import { GlobalLoading } from "./global-loading"
import { LoadingErrorBoundary } from "./loading-error-boundary"

interface LoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showGlobalLoader?: boolean
}

export function LoadingWrapper({ 
  children, 
  fallback,
  showGlobalLoader = true 
}: LoadingWrapperProps) {
  const defaultFallback = showGlobalLoader ? <GlobalLoading /> : null

  return (
    <LoadingErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </LoadingErrorBoundary>
  )
}