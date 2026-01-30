"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { StatCard } from "./StatCard"
import { medusaSdk } from "../../../lib/sdk"

export const UpcomingBookingsStat = () => {
  const [count, setCount] = useState<number | null>(null)
  const [difference, setDifference] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await medusaSdk.client.fetch<{
          upcoming: {
            count: number
            difference: number
          }
        }>(`/admin/bookings/stats?type=upcoming`)
        
        setCount(response.upcoming.count)
        setDifference(response.upcoming.difference)
      } catch (err) {
        console.error("Failed to fetch upcoming bookings", err)
        setError("Failed to load")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpcomingBookings()
  }, [])

  return (
    <StatCard
      label="Upcoming Bookings"
      value={count ?? 0}
      change={difference ?? undefined}
      icon={Calendar}
      isLoading={isLoading}
    />
  )
}
