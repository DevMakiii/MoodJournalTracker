import { GlobalLoading } from "@/components/loading/global-loading"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <GlobalLoading type="wave" message="Loading page..." />
    </div>
  )
}