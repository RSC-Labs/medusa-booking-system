"use client"

import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
import { StatCard } from "./StatCard"
import { medusaSdk } from "../../../lib/sdk"

export const PastBookingsStat = () => {
  const [count, setCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPastBookings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await medusaSdk.client.fetch<{
          past: {
            count: number
          }
        }>(`/admin/bookings/stats?type=past`)
        
        setCount(response.past.count)
      } catch (err) {
        console.error("Failed to fetch past bookings", err)
        setError("Failed to load")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPastBookings()
  }, [])

  return (
    <StatCard
      label="Past Bookings"
      value={count ?? 0}
      icon={Calendar}
      isLoading={isLoading}
    />
  )
}
