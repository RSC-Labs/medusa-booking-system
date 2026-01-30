"use client"

import { useEffect, useState } from "react"
import { Container, Heading, Button, Table, Badge, Text } from "@medusajs/ui"
import { Spinner } from "../../../ui/components/spinner"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { medusaSdk } from "../../../lib/sdk"

type BookingWithOrder = {
  id: string
  booking_number: string
  order_id: string | null
  start_time: string | null
  end_time: string | null
  status: "pending" | "confirmed" | "completed" | "cancelled"
  order: {
    id: string
    display_id: number
    customer: {
      id: string
      email: string
      first_name: string | null
      last_name: string | null
    } | null
    total: number
    currency_code: string
  } | null
}

type BookingsResponse = {
  bookings: BookingWithOrder[]
  count: number
  offset: number
  limit: number
}

export const RecentBookingsTable = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<BookingWithOrder[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBookings = async (skip: number = 0) => {
    setIsLoading(true)
    try {
      const response = await medusaSdk.client.fetch<BookingsResponse>(
        `/admin/bookings?skip=${skip}&take=${limit}`
      )
      setBookings(response.bookings)
      setCount(response.count)
      setOffset(response.offset)
    } catch (error) {
      console.error("Failed to fetch bookings", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings(0)
  }, [])

  const handlePrevious = () => {
    if (offset > 0) {
      fetchBookings(Math.max(0, offset - limit))
    }
  }

  const handleNext = () => {
    if (offset + limit < count) {
      fetchBookings(offset + limit)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString()
  }

  const formatCustomerName = (order: BookingWithOrder["order"]) => {
    if (!order?.customer) return "Guest"
    const { first_name, last_name, email } = order.customer
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim()
    }
    return email
  }

  const formatAmount = (order: BookingWithOrder["order"]) => {
    if (!order) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency_code.toUpperCase(),
    }).format(order.total / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "green"
      case "pending":
        return "orange"
      case "completed":
        return "blue"
      case "cancelled":
        return "red"
      default:
        return "grey"
    }
  }

  return (
    <Container className="col-span-2 p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
        <Heading level="h2">Recent Bookings</Heading>
        <Button 
          variant="transparent" 
          className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          onClick={() => navigate("/booking/bookings")}
        >
          View All <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Booking #</Table.HeaderCell>
            <Table.HeaderCell>Order ID</Table.HeaderCell>
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell>Start Date</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              <Table.Cell colSpan={6} className="text-center py-8">
                <div className="flex justify-center">
                  <Spinner className="animate-spin" />
                </div>
              </Table.Cell>
            </Table.Row>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <Table.Row 
                key={booking.id}
                className="cursor-pointer hover:bg-ui-bg-base-hover"
                onClick={() => navigate(`/booking/bookings/${booking.id}`)}
              >
                <Table.Cell className="font-medium">
                  {booking.booking_number || booking.id}
                </Table.Cell>
                <Table.Cell>
                  {booking.order?.display_id ? `#${booking.order.display_id}` : "-"}
                </Table.Cell>
                <Table.Cell>{formatCustomerName(booking.order)}</Table.Cell>
                <Table.Cell>{formatDate(booking.start_time)}</Table.Cell>
                <Table.Cell>
                  <Badge color={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-right">
                  {formatAmount(booking.order)}
                </Table.Cell>
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell colSpan={6} className="text-center py-8 text-ui-fg-subtle">
                No bookings found
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
      {!isLoading && count > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base">
          <Text className="text-ui-fg-subtle text-sm">
            Showing {offset + 1}-{Math.min(offset + limit, count)} of {count} bookings
          </Text>
          <div className="flex gap-x-2">
            <Button 
              variant="secondary" 
              size="small" 
              disabled={offset === 0}
              onClick={handlePrevious}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              size="small" 
              disabled={offset + limit >= count}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}
