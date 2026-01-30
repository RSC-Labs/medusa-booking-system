"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { StatCard } from "./StatCard"
import { medusaSdk } from "../../../lib/sdk"

export const PendingBookingsStat = () => {
  const [count, setCount] = useState<number | null>(null)
  const [difference, setDifference] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingBookings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await medusaSdk.client.fetch<{
          pending: {
            count: number
            difference: number
          }
        }>(`/admin/bookings/stats?type=pending`)
        
        setCount(response.pending.count)
        setDifference(response.pending.difference)
      } catch (err) {
        console.error("Failed to fetch pending bookings", err)
        setError("Failed to load")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingBookings()
  }, [])

  return (
    <StatCard
      label="Pending Bookings"
      value={count ?? 0}
      change={difference ?? undefined}
      icon={Calendar}
      isLoading={isLoading}
    />
  )
}
