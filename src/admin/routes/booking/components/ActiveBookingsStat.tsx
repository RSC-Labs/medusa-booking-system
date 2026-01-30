"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { StatCard } from "./StatCard"
import { medusaSdk } from "../../../lib/sdk"

export const ActiveBookingsStat = () => {
  const [count, setCount] = useState<number | null>(null)
  const [difference, setDifference] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActiveBookings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await medusaSdk.client.fetch<{
          active: {
            count: number
            difference: number
          }
        }>(`/admin/bookings/stats?type=active`)
        
        setCount(response.active.count)
        setDifference(response.active.difference)
      } catch (err) {
        console.error("Failed to fetch active bookings", err)
        setError("Failed to load")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveBookings()
  }, [])

  return (
    <StatCard
      label="Active Bookings"
      value={count ?? 0}
      change={difference ?? undefined}
      icon={Calendar}
      isLoading={isLoading}
    />
  )
}
