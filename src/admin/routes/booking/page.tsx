"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button } from "@medusajs/ui"
import { Calendar as CalendarIcon } from "@medusajs/icons"
import { Users, CreditCard, Package, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ActiveBookingsStat } from "./components/ActiveBookingsStat"
import { UpcomingBookingsStat } from "./components/UpcomingBookingsStat"
import { PastBookingsStat } from "./components/PastBookingsStat"
import { PendingBookingsStat } from "./components/PendingBookingsStat"
import { RecentBookingsTable } from "./components/RecentBookingsTable"
import { CreateBookingModal } from "./bookings/components/CreateBookingModal"
import { CreateResourceModal, ResourceTypesDrawer } from "./components/CreateResourceModal"

const BookingOverviewPage = () => {
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateResourceModalOpen, setIsCreateResourceModalOpen] = useState(false)
  const [isTypesOpen, setIsTypesOpen] = useState(false)
  const [lastTypeUpdate, setLastTypeUpdate] = useState(Date.now())

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading>Booking Overview</Heading>
          <Text className="text-ui-fg-subtle">
            Welcome to your booking management dashboard.
          </Text>
        </div>
        <div className="flex gap-x-2">
            <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Booking
            </Button>
            <Button onClick={() => setIsCreateResourceModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Resource
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActiveBookingsStat />
        <UpcomingBookingsStat />
        <PastBookingsStat />
        <PendingBookingsStat />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RecentBookingsTable />

        <Container className="p-0 overflow-hidden">
             <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
                <Heading level="h2">Quick Actions</Heading>
             </div>
             <div className="p-6 flex flex-col gap-3">
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate("/booking/resources")}>
                    <Package className="mr-2 h-4 w-4" />
                    Manage Resources
                </Button>
                 <Button variant="secondary" className="w-full justify-start" onClick={() => navigate("/orders")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Orders
                </Button>
                 <Button variant="secondary" className="w-full justify-start" onClick={() => navigate("/customers")}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Customers
                </Button>
             </div>
        </Container>
      </div>

      <CreateBookingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreated={() => {
          // Optionally refresh data or navigate
        }}
      />

      <CreateResourceModal
        open={isCreateResourceModalOpen}
        onOpenChange={setIsCreateResourceModalOpen}
        onCreated={() => {
          // Optionally refresh data or navigate
        }}
        onManageTypes={() => setIsTypesOpen(true)}
        lastTypeUpdate={lastTypeUpdate}
      />

      <ResourceTypesDrawer
        open={isTypesOpen}
        onOpenChange={setIsTypesOpen}
        onTypeChange={() => setLastTypeUpdate(Date.now())}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Booking",
  icon: CalendarIcon,
})

export default BookingOverviewPage