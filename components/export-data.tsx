"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

export function ExportData() {
  const handleExport = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`/api/export-data?format=${format}`)
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `mood-journal-export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>Download your mood journal data for backup or analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Export all your mood entries, achievements, and profile data in your preferred format.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => handleExport("json")} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <Button onClick={() => handleExport("csv")} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
