"use client"

import { useEffect, useState } from "react"
import { Package } from "lucide-react"
import { StatCard } from "./StatCard"
import { medusaSdk } from "../../../lib/sdk"

export const TotalResourcesStat = () => {
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await medusaSdk.client.fetch<{
          booking_resources: any[]
          count: number
        }>(`/admin/booking-resources`)
        
        setCount(response.count)
      } catch (err) {
        console.error("Failed to fetch resources", err)
        setError("Failed to load")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  return (
    <StatCard
      label="Total Resources"
      value={count ?? 0}
      icon={Package}
      isLoading={isLoading}
    />
  )
}
