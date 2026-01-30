"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FocusModal,
  ProgressTabs,
  Button,
  Text,
  Label,
  Input,
  Select,
  toast,
} from "@medusajs/ui"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { Spinner } from "../../../../ui/components/spinner"
import { medusaSdk } from "../../../../lib/sdk"
import { BookingMonthCalendar } from "../../../../ui/blocks/calendar/booking-month-calendar"
import { BookingResourceDTO, GetBookingResourcesDTO } from "../../../../types/booking-resource"
import { BookingAvailabilityDTO, GetBookingResourceAvailabilityDTO } from "../../../../types/booking-availability"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, format as formatDate } from "date-fns"

type CreateBookingModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

type CustomerDTO = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

type BookingFormData = {
  resourceId: string | null
  startTime: string | null
  endTime: string | null
  selectedCustomerId: string | null
  customer: {
    email: string
    first_name: string
    last_name: string
    phone: string | null
  }
  address: {
    address_1: string
    address_2: string
    city: string
    country_code: string
    province: string
    postal_code: string
  }
}

export const CreateBookingModal = ({
  open,
  onOpenChange,
  onCreated,
}: CreateBookingModalProps) => {
  const [activeTab, setActiveTab] = useState("general")
  const [resources, setResources] = useState<BookingResourceDTO[]>([])
  const [selectedResource, setSelectedResource] = useState<BookingResourceDTO | null>(null)
  const [availability, setAvailability] = useState<BookingAvailabilityDTO[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loadingResources, setLoadingResources] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<CustomerDTO[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [formData, setFormData] = useState<BookingFormData>({
    resourceId: null,
    startTime: null,
    endTime: null,
    selectedCustomerId: null,
    customer: {
      email: "",
      first_name: "",
      last_name: "",
      phone: null,
    },
    address: {
      address_1: "",
      address_2: "",
      city: "",
      country_code: "",
      province: "",
      postal_code: "",
    },
  })
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    resource?: string
    dateRange?: string
    email?: string
    first_name?: string
    last_name?: string
    address_1?: string
    city?: string
    postal_code?: string
    country_code?: string
  }>({})

  // Fetch resources and customers
  useEffect(() => {
    if (open) {
      fetchResources()
      fetchCustomers()
    }
  }, [open])

  // Fetch availability when resource is selected
  useEffect(() => {
    if (formData.resourceId) {
      fetchAvailability()
    }
  }, [formData.resourceId, currentDate])

  const fetchResources = async () => {
    setLoadingResources(true)
    try {
      const response = await medusaSdk.client.fetch<GetBookingResourcesDTO>(
        `/admin/booking-resources`
      )
      // Only show published and bookable resources
      setResources(response.booking_resources.filter(r => r.is_bookable && r.status === "published"))
    } catch (error) {
      console.error("Failed to fetch resources", error)
    } finally {
      setLoadingResources(false)
    }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const response = await medusaSdk.client.fetch<{ customers: CustomerDTO[], count: number }>(
        `/admin/customers?limit=100`
      )
      setCustomers(response.customers || [])
    } catch (error) {
      console.error("Failed to fetch customers", error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleCustomerSelect = async (customerId: string) => {
    if (customerId === "") {
      // Clear selection - allow custom values
      setFormData({
        ...formData,
        selectedCustomerId: null,
        customer: {
          email: "",
          first_name: formData.customer.first_name, // Keep existing values
          last_name: formData.customer.last_name,
          phone: formData.customer.phone,
        },
      })
      return
    }

    // Find and populate only email from customer data
    // First name, last name, and phone remain editable
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData({
        ...formData,
        selectedCustomerId: customerId,
        customer: {
          email: customer.email || "",
          first_name: formData.customer.first_name || customer.first_name || "", // Keep existing or use customer's
          last_name: formData.customer.last_name || customer.last_name || "", // Keep existing or use customer's
          phone: formData.customer.phone || customer.phone || null, // Keep existing or use customer's
        },
      })
    }
  }

  const fetchAvailability = useCallback(async () => {
    if (!formData.resourceId) return

    setLoadingAvailability(true)
    try {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(monthStart)
      const from = startOfWeek(monthStart)
      const to = endOfWeek(monthEnd)

      const queryParams = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        view: "month",
      })

      const result = await medusaSdk.client.fetch<GetBookingResourceAvailabilityDTO>(
        `/admin/booking-resources/${formData.resourceId}/availability?${queryParams.toString()}`
      )
      setAvailability(result.availability)
    } catch (error) {
      console.error("Failed to fetch availability", error)
    } finally {
      setLoadingAvailability(false)
    }
  }, [formData.resourceId, currentDate])

  const handleResourceSelect = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId)
    setSelectedResource(resource || null)
    setFormData({ ...formData, resourceId })
  }

  const handleRangeSelect = (startDate: Date | null, endDate: Date | null) => {
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)

    if (startDate && endDate) {
      // Store as whole days in UTC (start of day UTC for start, end of day UTC for end)
      // Convert local date to UTC date components
      const startYear = startDate.getFullYear()
      const startMonth = startDate.getMonth()
      const startDay = startDate.getDate()
      
      const endYear = endDate.getFullYear()
      const endMonth = endDate.getMonth()
      const endDay = endDate.getDate()
      
      // Create UTC dates (whole days)
      const start = new Date(Date.UTC(startYear, startMonth, startDay, 0, 0, 0, 0))
      const end = new Date(Date.UTC(endYear, endMonth, endDay, 23, 59, 59, 999))

      setFormData({
        ...formData,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      })
    } else if (startDate) {
      // Only start date selected, set as start of day UTC
      const startYear = startDate.getFullYear()
      const startMonth = startDate.getMonth()
      const startDay = startDate.getDate()
      
      const start = new Date(Date.UTC(startYear, startMonth, startDay, 0, 0, 0, 0))
      setFormData({
        ...formData,
        startTime: start.toISOString(),
        endTime: null,
      })
    } else {
      // No dates selected
      setFormData({
        ...formData,
        startTime: null,
        endTime: null,
      })
    }
  }

  const validateGeneralTab = () => {
    const errors: typeof validationErrors = {}
    if (!formData.resourceId) {
      errors.resource = "Please select a resource"
    }
    if (!formData.startTime || !formData.endTime) {
      errors.dateRange = "Please select a date range"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateCustomerTab = () => {
    const errors: typeof validationErrors = {}
    if (!formData.customer.email || formData.customer.email.trim() === "") {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!formData.customer.first_name || formData.customer.first_name.trim() === "") {
      errors.first_name = "First name is required"
    }
    if (!formData.customer.last_name || formData.customer.last_name.trim() === "") {
      errors.last_name = "Last name is required"
    }
    // Address validation
    if (!formData.address.address_1 || formData.address.address_1.trim() === "") {
      errors.address_1 = "Address line 1 is required"
    }
    if (!formData.address.city || formData.address.city.trim() === "") {
      errors.city = "City is required"
    }
    if (!formData.address.country_code || formData.address.country_code.trim() === "") {
      errors.country_code = "Country code is required"
    }
    if (!formData.address.postal_code || formData.address.postal_code.trim() === "") {
      errors.postal_code = "Postal code is required"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (activeTab === "general") {
      if (validateGeneralTab()) {
        setValidationErrors({})
        setActiveTab("customer")
      }
    } else if (activeTab === "customer") {
      if (validateCustomerTab()) {
        setValidationErrors({})
        setActiveTab("confirmation")
      }
    }
  }

  const canProceedFromGeneral = () => {
    return formData.resourceId !== null && formData.startTime !== null && formData.endTime !== null
  }

  const canProceedFromCustomer = () => {
    return (
      formData.customer.email.trim() !== "" &&
      formData.customer.first_name.trim() !== "" &&
      formData.customer.last_name.trim() !== "" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer.email) &&
      formData.address.address_1.trim() !== "" &&
      formData.address.city.trim() !== "" &&
      formData.address.postal_code.trim() !== "" &&
      formData.address.country_code.trim() !== ""
    )
  }

  const handlePrevious = () => {
    if (activeTab === "customer") {
      setActiveTab("general")
    } else if (activeTab === "confirmation") {
      setActiveTab("customer")
    }
  }

  const handleSubmit = async () => {
    if (!formData.resourceId || !formData.startTime || !formData.endTime) {
      return
    }

    setIsSubmitting(true)
    try {
      // Create address objects from form data
      // The workflow will create the customer and handle customer_id
      const baseAddress = {
        first_name: formData.customer.first_name,
        last_name: formData.customer.last_name,
        phone: formData.customer.phone || undefined,
        address_1: formData.address.address_1,
        address_2: formData.address.address_2 || undefined,
        city: formData.address.city,
        province: formData.address.province || undefined,
        postal_code: formData.address.postal_code,
        country_code: formData.address.country_code,
        customer_id: "", // Placeholder - workflow will create customer and set this
      }

      const requestBody = {
        customer: {
          email: formData.customer.email,
          shippingAddress: baseAddress,
          billingAddress: baseAddress,
        },
        bookingResource: {
          id: formData.resourceId,
          startDate: new Date(formData.startTime),
          endDate: new Date(formData.endTime),
        },
        context: {
          unit: "day" as const, // Default to day unit
        },
      }

      const response = await medusaSdk.client.fetch(`/admin/bookings`, {
        method: "POST",
        body: requestBody,
      })

      // Show success toast
      toast.success("Booking created successfully", {
        description: "The booking has been created and the order has been completed.",
      })

      // Reset form
      setFormData({
        resourceId: null,
        startTime: null,
        endTime: null,
        selectedCustomerId: null,
        customer: {
          email: "",
          first_name: "",
          last_name: "",
          phone: null,
        },
        address: {
          address_1: "",
          address_2: "",
          city: "",
          country_code: "",
          province: "",
          postal_code: "",
        },
      })
      setSelectedStartDate(null)
      setSelectedEndDate(null)
      setActiveTab("general")
      setSelectedResource(null)
      setValidationErrors({})

      // Notify parent
      onCreated()

      // Close modal after a brief delay to ensure state updates complete
      setTimeout(() => {
        onOpenChange(false)
      }, 100)
    } catch (error) {
      console.error("Failed to create booking", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking. Please try again."
      toast.error("Failed to create booking", {
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return formatDate(date, "MMMM d, yyyy")
  }

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return "Not set"
    return formatDate(date, "MMMM d, yyyy")
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>Create Booking</FocusModal.Title>
        </FocusModal.Header>
        <FocusModal.Body className="overflow-y-auto">
          <div className="w-full px-4 py-6">
            <ProgressTabs
              value={activeTab}
              onValueChange={(value) => {
                // Prevent tab switching if validation fails
                if (value === "customer" && activeTab === "general") {
                  if (!canProceedFromGeneral()) {
                    validateGeneralTab()
                    return
                  }
                } else if (value === "confirmation" && activeTab === "customer") {
                  if (!canProceedFromCustomer()) {
                    validateCustomerTab()
                    return
                  }
                }
                setActiveTab(value)
              }}
            >
              <div className="border-b border-ui-border-base">
                <ProgressTabs.List>
                  <ProgressTabs.Trigger value="general">General</ProgressTabs.Trigger>
                  <ProgressTabs.Trigger value="customer">Customer</ProgressTabs.Trigger>
                  <ProgressTabs.Trigger value="confirmation">Confirmation</ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>

              <div className="mt-6">
                {/* General Tab */}
                <ProgressTabs.Content value="general">
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="w-full max-w-2xl">
                        <div>
                          <Label htmlFor="resource">Select Resource *</Label>
                          <Text size="small" className="text-ui-fg-subtle mt-1">
                            Only published resources can be booked
                          </Text>
                          {loadingResources ? (
                            <div className="flex justify-center py-4">
                              <Spinner className="animate-spin" />
                            </div>
                          ) : (
                            <>
                              <Select
                                value={formData.resourceId || ""}
                                onValueChange={(value) => {
                                  handleResourceSelect(value)
                                  setValidationErrors({ ...validationErrors, resource: undefined })
                                }}
                              >
                                <Select.Trigger id="resource" className="mt-2">
                                  <Select.Value placeholder="Choose a resource" />
                                </Select.Trigger>
                                <Select.Content>
                                  {resources.map((resource) => (
                                    <Select.Item key={resource.id} value={resource.id}>
                                      {resource.title} {resource.subtitle && `- ${resource.subtitle}`}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select>
                              {validationErrors.resource && (
                                <Text size="small" className="text-ui-fg-error mt-1">
                                  {validationErrors.resource}
                                </Text>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {formData.resourceId && (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-full max-w-2xl">
                            <div>
                              <Label>Select Date Range *</Label>
                              <Text size="small" className="text-ui-fg-subtle mt-1">
                                Click on a date to select the start date, then click another date to select the end date
                              </Text>
                            </div>
                          </div>
                        </div>
                        {loadingAvailability ? (
                          <div className="flex justify-center py-8">
                            <Spinner className="animate-spin" />
                          </div>
                        ) : (
                          <div className="border border-ui-border-base rounded-md p-4">
                            <BookingMonthCalendar
                              availability={availability}
                              date={currentDate}
                              onDateChange={setCurrentDate}
                              onRangeSelect={(start, end) => {
                                handleRangeSelect(start, end)
                                if (start && end) {
                                  setValidationErrors({ ...validationErrors, dateRange: undefined })
                                }
                              }}
                              selectedStartDate={selectedStartDate}
                              selectedEndDate={selectedEndDate}
                            />
                          </div>
                        )}

                        <div className="flex justify-center">
                          <div className="w-full max-w-2xl space-y-2">
                            {selectedStartDate && selectedEndDate && formData.startTime && formData.endTime && (
                              <div className="space-y-2 p-4 bg-ui-bg-subtle rounded-md">
                                <Text size="small" className="font-medium">Selected Date Range</Text>
                                <div className="space-y-1">
                                  <Text size="small">
                                    <strong>Start:</strong> {formatSelectedDate(selectedStartDate)}
                                  </Text>
                                  <Text size="small">
                                    <strong>End:</strong> {formatSelectedDate(selectedEndDate)}
                                  </Text>
                                </div>
                              </div>
                            )}
                            {selectedStartDate && !selectedEndDate && (
                              <div className="space-y-2 p-4 bg-ui-bg-subtle rounded-md">
                                <Text size="small" className="font-medium">Start Date Selected</Text>
                                <Text size="small">
                                  Please select an end date to complete the range
                                </Text>
                              </div>
                            )}
                            {validationErrors.dateRange && (
                              <Text size="small" className="text-ui-fg-error">
                                {validationErrors.dateRange}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ProgressTabs.Content>

                {/* Customer Tab */}
                <ProgressTabs.Content value="customer">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl space-y-4">
                      {/* Customer Selection */}
                      <div>
                        <Label htmlFor="customer-select">Select Customer (Optional)</Label>
                        <Text size="small" className="text-ui-fg-subtle mt-1">
                          Choose an existing customer or enter custom values below
                        </Text>
                        {loadingCustomers ? (
                          <div className="flex justify-center py-4">
                            <Spinner className="animate-spin" />
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 mt-2">
                            <div className="flex-1">
                              <Select
                                value={formData.selectedCustomerId || ""}
                                onValueChange={handleCustomerSelect}
                              >
                                <Select.Trigger id="customer-select">
                                  <Select.Value placeholder="Select a customer or enter custom values" />
                                </Select.Trigger>
                                <Select.Content>
                                  {customers.map((customer) => (
                                    <Select.Item key={customer.id} value={customer.id}>
                                      {customer.email} {customer.first_name && customer.last_name && `(${customer.first_name} ${customer.last_name})`}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select>
                            </div>
                            {formData.selectedCustomerId && (
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => handleCustomerSelect("")}
                                type="button"
                                className="mt-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-ui-border-base pt-4">
                        <Text size="small" className="font-medium mb-4">
                          Customer Information {formData.selectedCustomerId && "(email from selected customer)"}
                        </Text>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.customer.email}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                customer: { ...formData.customer, email: e.target.value },
                              })
                              setValidationErrors({ ...validationErrors, email: undefined })
                            }}
                            className="mt-2"
                            placeholder="customer@example.com"
                            disabled={!!formData.selectedCustomerId}
                          />
                          {validationErrors.email && (
                            <Text size="small" className="text-ui-fg-error mt-1">
                              {validationErrors.email}
                            </Text>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                              id="first_name"
                              value={formData.customer.first_name}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  customer: { ...formData.customer, first_name: e.target.value },
                                })
                                setValidationErrors({ ...validationErrors, first_name: undefined })
                              }}
                              className="mt-2"
                              placeholder="John"
                            />
                            {validationErrors.first_name && (
                              <Text size="small" className="text-ui-fg-error mt-1">
                                {validationErrors.first_name}
                              </Text>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                              id="last_name"
                              value={formData.customer.last_name}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  customer: { ...formData.customer, last_name: e.target.value },
                                })
                                setValidationErrors({ ...validationErrors, last_name: undefined })
                              }}
                              className="mt-2"
                              placeholder="Doe"
                            />
                            {validationErrors.last_name && (
                              <Text size="small" className="text-ui-fg-error mt-1">
                                {validationErrors.last_name}
                              </Text>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.customer.phone || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                customer: { ...formData.customer, phone: e.target.value || null },
                              })
                            }
                            className="mt-2"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="border-t border-ui-border-base pt-4">
                        <Text size="small" className="font-medium mb-4">
                          Address Information
                        </Text>
                        
                        <div className="mt-4">
                          <Label htmlFor="address_1">Address Line 1 *</Label>
                          <Input
                            id="address_1"
                            value={formData.address.address_1}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                address: { ...formData.address, address_1: e.target.value },
                              })
                              setValidationErrors({ ...validationErrors, address_1: undefined })
                            }}
                            className="mt-2"
                            placeholder="123 Main St"
                          />
                          {validationErrors.address_1 && (
                            <Text size="small" className="text-ui-fg-error mt-1">
                              {validationErrors.address_1}
                            </Text>
                          )}
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="address_2">Address Line 2</Label>
                          <Input
                            id="address_2"
                            value={formData.address.address_2}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: { ...formData.address, address_2: e.target.value },
                              })
                            }
                            className="mt-2"
                            placeholder="Apt 4B"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={formData.address.city}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, city: e.target.value },
                                })
                                setValidationErrors({ ...validationErrors, city: undefined })
                              }}
                              className="mt-2"
                              placeholder="New York"
                            />
                            {validationErrors.city && (
                              <Text size="small" className="text-ui-fg-error mt-1">
                                {validationErrors.city}
                              </Text>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="postal_code">Postal Code *</Label>
                            <Input
                              id="postal_code"
                              value={formData.address.postal_code}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, postal_code: e.target.value },
                                })
                                setValidationErrors({ ...validationErrors, postal_code: undefined })
                              }}
                              className="mt-2"
                              placeholder="10001"
                            />
                            {validationErrors.postal_code && (
                              <Text size="small" className="text-ui-fg-error mt-1">
                                {validationErrors.postal_code}
                              </Text>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="province">Province/State</Label>
                            <Input
                              id="province"
                              value={formData.address.province}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, province: e.target.value },
                                })
                              }
                              className="mt-2"
                              placeholder="NY"
                            />
                          </div>

                          <div>
                            <Label htmlFor="country_code">Country Code *</Label>
                            <Input
                              id="country_code"
                              value={formData.address.country_code}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  address: { ...formData.address, country_code: e.target.value },
                                })
                                setValidationErrors({ ...validationErrors, country_code: undefined })
                              }}
                              className="mt-2"
                              placeholder="US"
                            />
                            {validationErrors.country_code && (
                              <Text size="small" className="text-ui-fg-error mt-1">
                                {validationErrors.country_code}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ProgressTabs.Content>

                {/* Confirmation Tab */}
                <ProgressTabs.Content value="confirmation">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl space-y-6">
                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          Resource
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md">
                          <Text className="font-medium">{selectedResource?.title}</Text>
                          {selectedResource?.subtitle && (
                            <Text size="small" className="text-ui-fg-subtle">
                              {selectedResource.subtitle}
                            </Text>
                          )}
                        </div>
                      </div>

                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          Date Range
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md space-y-1">
                          <Text size="small">
                            <strong>Start:</strong> {selectedStartDate ? formatSelectedDate(selectedStartDate) : formatDateOnly(formData.startTime)}
                          </Text>
                          <Text size="small">
                            <strong>End:</strong> {selectedEndDate ? formatSelectedDate(selectedEndDate) : formatDateOnly(formData.endTime)}
                          </Text>
                        </div>
                      </div>

                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          Customer Information
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md space-y-1">
                          {formData.selectedCustomerId && (
                            <Text size="small" className="text-ui-fg-subtle italic mb-2">
                              (Email from selected customer)
                            </Text>
                          )}
                          <Text size="small">
                            <strong>Name:</strong> {formData.customer.first_name}{" "}
                            {formData.customer.last_name}
                          </Text>
                          <Text size="small">
                            <strong>Email:</strong> {formData.customer.email}
                          </Text>
                          {formData.customer.phone && (
                            <Text size="small">
                              <strong>Phone:</strong> {formData.customer.phone}
                            </Text>
                          )}
                        </div>
                      </div>

                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          Address Information
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md space-y-1">
                          <Text size="small">
                            <strong>Address:</strong> {formData.address.address_1}
                            {formData.address.address_2 && `, ${formData.address.address_2}`}
                          </Text>
                          <Text size="small">
                            <strong>City:</strong> {formData.address.city}
                            {formData.address.province && `, ${formData.address.province}`}
                          </Text>
                          <Text size="small">
                            <strong>Postal Code:</strong> {formData.address.postal_code}
                          </Text>
                          <Text size="small">
                            <strong>Country:</strong> {formData.address.country_code}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </ProgressTabs.Content>
              </div>
            </ProgressTabs>
          </div>
        </FocusModal.Body>
        <FocusModal.Footer>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={activeTab === "general"}
            >
              Previous
            </Button>
            {activeTab === "confirmation" ? (
              <Button onClick={handleSubmit} isLoading={isSubmitting} type="button">
                Create Booking
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (activeTab === "general" && !canProceedFromGeneral()) ||
                  (activeTab === "customer" && !canProceedFromCustomer())
                }
              >
                Next
              </Button>
            )}
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}
