"use client"

import { 
  Container, 
  Heading, 
  Text, 
  Button, 
  Input, 
  Label, 
  Textarea, 
  Switch, 
  Badge, 
  Select,
  toast,
  Toaster,
  Prompt,
} from "@medusajs/ui"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Pencil, Save, X, Plus, Trash2, LayoutGrid, CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { medusaSdk } from "../../../../lib/sdk"
import { MonthCalendar } from "../../../../ui/blocks/calendar/month-calendar"
import { WeekCalendar } from "../../../../ui/blocks/calendar//week-calendar"
import { BookingResourcePricingConfigDTO, BookingResourcePricingDTO, GetBookingResourceDTO, BookingResourcePricingConfigUnit, UpdateBookingResourceDTO, UpdateBookingResourcePricingDTO } from "../../../../types/booking-resource"
import { BookingAvailabilityDTO, GetBookingResourceAvailabilityDTO } from "../../../../types/booking-availability"
import { CalendarView } from "../../../../ui/blocks/calendar/calendar.types"
import { getDefaultCalendarView } from "../../../../ui/blocks/calendar/calendar.utils"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import { AdminStoreCurrency } from "@medusajs/framework/types"

type FormUpdateBookingResource = UpdateBookingResourceDTO["booking_resource"]

type FormUpdatePricing = {
  config: BookingResourcePricingConfigDTO,
  pricing: BookingResourcePricingDTO[]
}


export default function ResourceDetailPage() {
  const { id } = useParams()
  const resourceId = id

  const navigate = useNavigate()

  const [data, setData] = useState<GetBookingResourceDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [currencies, setCurrencies] = useState<AdminStoreCurrency[]>([])

  const [availability, setAvailability] = useState<BookingAvailabilityDTO[]>([])
  // Edit states
  const [isEditingResource, setIsEditingResource] = useState(false)
  const [resourceForm, setResourceForm] = useState<FormUpdateBookingResource>()
  
  const [isEditingPricing, setIsEditingPricing] = useState(false)
  const [pricingForm, setPricingForm] = useState<FormUpdatePricing[]>([])

  // Rule states
  const [editingRule, setEditingRule] = useState<any>(null)
  const [isNewRule, setIsNewRule] = useState(false)

  const [calendarView, setCalendarView] = useState<CalendarView>("month")
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (data?.booking_resource) {
      setCalendarView(getDefaultCalendarView(data))
    }
  }, [data])

  useEffect(() => {
    const fetchData = async () => {
      const { stores } = await medusaSdk.admin.store.list()
      const store = stores[0]
      setCurrencies(store.supported_currencies)
    }
    fetchData()
  }, [])

  const fetchResource = async () => {
    if (!data) setLoading(true)  // Remove this condition
    try {
      const result = await medusaSdk.client.fetch<GetBookingResourceDTO>(`/admin/booking-resources/${resourceId}`)
      setData(result)
    } catch (error) {
      console.error("Failed to fetch resource:", error)
    } finally {
      setLoading(false)
    }
  }



  const fetchAvailability = useCallback(async () => {
    if (!resourceId) return

    try {
      let from: Date, to: Date
      
      if (calendarView === "month") {
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(monthStart)
        from = startOfWeek(monthStart)
        to = endOfWeek(monthEnd)
      } else {
        from = startOfWeek(currentDate, { weekStartsOn: 0 })
        to = endOfWeek(currentDate, { weekStartsOn: 0 })
      }

      const queryParams = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        view: calendarView
      })

      const result = await medusaSdk.client.fetch<GetBookingResourceAvailabilityDTO>(`/admin/booking-resources/${resourceId}/availability?${queryParams.toString()}`)
      setAvailability(result.availability)
    } catch (error) {
      console.error("Failed to fetch availability:", error)
      toast.error("Failed to fetch availability")
    }
  }, [resourceId, currentDate, calendarView, toast])

  useEffect(() => {
    if (resourceId) {
      fetchResource()
    }
  }, [resourceId])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const handleEditResource = () => {
    if (data && data.booking_resource) {
      setResourceForm({
        id: data.booking_resource.id,
        title: data.booking_resource.title,
        subtitle: data.booking_resource.subtitle,
        description: data.booking_resource.description,
        is_bookable: data.booking_resource.is_bookable,
        resource_type: data.booking_resource.resource_type
      })
      setIsEditingResource(true)
    }
  }

  const handleSaveResource = async () => {
    try {
      await medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}`, {
        method: "POST",
        body: {
          booking_resource: {
            ...resourceForm,
          },
        },
      })
      toast.success("Resource Information saved")
      await fetchResource()
      await fetchAvailability()
      setIsEditingResource(false)
    } catch (error) {
      console.error("Failed to update resource:", error)
      toast.error("Failed to update resource")
    }
  }

  const handleEditPricing = () => {
    if (data && data.booking_resource_pricing_configs) {
      // Deep copy to avoid mutating state directly
      const configs: UpdateBookingResourcePricingDTO[] = JSON.parse(JSON.stringify(data.booking_resource_pricing_configs));
      
      const enrichedConfigs = configs.map((config: UpdateBookingResourcePricingDTO) => {
        const existingPrices = config.pricing || []
        const enrichedPrices = currencies.map((currency) => {
          const existing = existingPrices.find((p: BookingResourcePricingDTO) => p.currency_code === currency.currency_code)
          if (existing) return existing
          return {
            currency_code: currency.currency_code,
            amount: 0
          }
        })
        return {
          ...config,
          pricing: enrichedPrices
        }
      })

      setPricingForm(enrichedConfigs)
      setIsEditingPricing(true)
    }
  }

  const handleAddPricing = () => {
    const newConfig: UpdateBookingResourcePricingDTO = {
      config: {
        id: `temp_${Date.now()}`,
        unit_value: 1,
        unit: BookingResourcePricingConfigUnit.day,
      },
      pricing: currencies.map(c => ({
        currency_code: c.currency_code,
        amount: 0
      }))
    }
    
    setPricingForm([...pricingForm, newConfig as any])
  }

  const handleSavePricing = async () => {
    try {
      await Promise.all(pricingForm.map((configItem) => {
        const priceConfigId = configItem.config.id
        if (priceConfigId.startsWith("temp_")) {
          return medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}/pricing`, {
            method: "POST",
            body: { ...configItem, booking_resource_pricing_config: { ...configItem.config, id: undefined }, booking_resource_pricing: configItem.pricing }
          })
        }
        return medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}/pricing/${priceConfigId}`, {
          method: "POST",
          body: configItem
        })
      }))
      await fetchResource()
      await fetchAvailability()

      toast.success("Pricing configuration saved")

      setIsEditingPricing(false)
    } catch (error) {
      console.error("Failed to update pricing:", error)
      toast.error("Failed to save pricing configuration")
    }
  }

  const updatePricingConfig = (index: number, field: string, value: any) => {
    setPricingForm(
      pricingForm.map((item, i) =>
        i === index
          ? { ...item, config: { ...item.config, [field]: value } }
          : item
      )
    )
  }

  const updatePricingAmount = (configIndex: number, priceIndex: number, value: any) => {
    setPricingForm(
      pricingForm.map((configItem, cIndex) =>
        cIndex === configIndex
          ? {
              ...configItem,
              pricing: configItem.pricing.map((price, pIndex) =>
                pIndex === priceIndex
                  ? { ...price, amount: Number(value) }
                  : price
              ),
            }
          : configItem
      )
    )
  }

  const handleDeletePricing = async (index: number) => {
    const configToDelete = pricingForm[index]
    const priceConfigId = configToDelete.config.id

    if (priceConfigId.startsWith("temp_")) {
      const newPricing = [...pricingForm]
      newPricing.splice(index, 1)
      setPricingForm(newPricing)
      return
    }

    try {
      await medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}/pricing/${priceConfigId}`, {
        method: "DELETE",
      })
      toast.success("Pricing configuration deleted")
      const newPricing = [...pricingForm]
      newPricing.splice(index, 1)
      setPricingForm(newPricing)
      await fetchResource()
      await fetchAvailability()
    } catch (error) {
      console.error("Failed to delete pricing:", error)
      toast.error("Failed to delete pricing configuration")
    }
  }

  const handleEditRule = (rule: any) => {
    const fromDate = rule.valid_from ? new Date(rule.valid_from) : null
    const untilDate = rule.valid_until ? new Date(rule.valid_until) : null
    
    // Auto-detect mode from stored timestamps
    const isFullDay = fromDate && untilDate && 
      fromDate.getHours() === 0 && fromDate.getMinutes() === 0 &&
      untilDate.getHours() === 0 && untilDate.getMinutes() === 0 &&
      untilDate.getTime() === fromDate.getTime() + 24 * 60 * 60 * 1000

    setEditingRule({
      ...rule,
      mode: isFullDay ? 'full_days' : 'specific_times',
      configuration: JSON.stringify(rule.configuration || {}, null, 2),
      valid_from: rule.valid_from ? 
        (isFullDay ? new Date(rule.valid_from).toISOString().slice(0, 10) :
        new Date(rule.valid_from).toISOString().slice(0, 16)) : "",
      valid_until: rule.valid_until ? 
        (isFullDay ? new Date(rule.valid_until).toISOString().slice(0, 10) :
        new Date(rule.valid_until).toISOString().slice(0, 16)) : "",
    })
    setIsNewRule(false)
  }

  const handleAddRule = () => {
    setEditingRule({
      name: "",
      rule_type: "custom",
      effect: "available",
      priority: 0,
      is_active: true,
      configuration: "{}",
      valid_from: "",
      valid_until: "",
    })
    setIsNewRule(true)
  }

  const handleSaveRule = async () => {
    try {
      let normalizedFrom = editingRule.valid_from
      let normalizedUntil = editingRule.valid_until

      // Frontend normalizes based on mode before sending
      if (editingRule.mode === 'full_days') {
        if (editingRule.valid_from) {
          const fromDate = new Date(editingRule.valid_from)
          fromDate.setUTCHours(0, 0, 0, 0)
          normalizedFrom = fromDate.toISOString()
        }
        
        if (editingRule.valid_until) {
          const untilDate = new Date(editingRule.valid_until)
          untilDate.setDate(untilDate.getUTCDate() + 1) // Exclusive end
          untilDate.setUTCHours(0, 0, 0, 0)
          normalizedUntil = untilDate.toISOString()
        }
      }

      const payload = {
        ...editingRule,
        configuration: JSON.parse(editingRule.configuration || '{}'),
        valid_from: normalizedFrom || null,
        valid_until: normalizedUntil || null,
        priority: Number(editingRule.priority),
        booking_resource_id: resourceId,
      }

      const url = isNewRule 
        ? `/admin/booking-resources/${resourceId}/availability-rules` 
        : `/admin/booking-resources/${resourceId}/availability-rules/${editingRule.id}`

      await medusaSdk.client.fetch(url, {
        method: "POST",
        body: payload,
      })
      await fetchResource()
      await fetchAvailability()
      setEditingRule(null)
      toast.success("Rule saved successfully")
    } catch (error) {
      console.error("Failed to save rule:", error)
      toast.error("Failed to save rule. Please check inputs.")
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      await medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}/availability-rules/${id}`, {
        method: "DELETE",
      })
      await fetchResource()
      await fetchAvailability()
      toast.success("Rule deleted successfully")
    } catch (error) {
      console.error("Failed to delete rule:", error)
      toast.error("Failed to delete rule")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ui-fg-muted" />
      </div>
    )
  }

  if (!data || !data.booking_resource) {
    return <div>Resource not found</div>
  }

  const { booking_resource, booking_resource_pricing_configs, booking_resource_availability_rules } = data

  const handlePublish = async () => {
    try {
      await medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}/status`, {
        method: "POST",
        body: {
         status: "published"
        },
      })
      toast.success("Booking Resource published successfully")
      await fetchResource()
      await fetchAvailability()
      setIsEditingPricing(false)
    } catch (error) {
      console.error("Failed to publish Booking Resource:", error)
      toast.error("Failed to publish Booking Resource")
    }
  }

  const handleUnpublish = async () => {
    try {
      await medusaSdk.client.fetch(`/admin/booking-resources/${resourceId}/status`, {
        method: "POST",
        body: {
         status: "draft"
        },
      })
      toast.success("Booking Resource unpublished successfully")
      await fetchResource()
      await fetchAvailability()
      setIsEditingPricing(false)
    } catch (error) {
      console.error("Failed to unpublish Booking Resource:", error)
      toast.error("Failed to unpublish Booking Resource")
    }
  }

  const todos: string[] = []
  if (!booking_resource.is_bookable) {
    todos.push("Booking resource must be bookable")
  }
  if (!booking_resource_pricing_configs || booking_resource_pricing_configs.length === 0) {
    todos.push("Booking resource must have at least one pricing config")
  }
  const isReadyToPublish = todos.length === 0

  const isPublished = booking_resource.status === "published"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="transparent"
          className="p-2"
          onClick={() => navigate("/booking/resources")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <Heading level="h1" className="text-3xl font-bold tracking-tight">
            Resource Details
          </Heading>
          <Text className="text-ui-fg-subtle">
            View and manage resource {booking_resource.id}
          </Text>
        </div>
      </div>

      {!isPublished && <Container className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Heading level="h2">Publishing Requirements</Heading>
            {isReadyToPublish ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-ui-fg-interactive" />
                <Text className="text-ui-fg-subtle">All requirements met. Ready to publish.</Text>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-ui-fg-error" />
                  <Text className="text-ui-fg-subtle">The following items need to be completed before publishing:</Text>
                </div>
                <ul className="list-disc list-inside pl-6 text-sm text-ui-fg-subtle">
                  {todos.map((todo, index) => (
                    <li key={index}>{todo}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button disabled={!isReadyToPublish} onClick={handlePublish}>Publish</Button>
        </div>
      </Container>
      }

      {isPublished && <Container className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Heading level="h2">Status</Heading>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-ui-fg-interactive" />
                <Text className="text-ui-fg-subtle">Your resource is published.</Text>
              </div>
          </div>
          <Button onClick={handleUnpublish}>Unpublish</Button>
        </div>
      </Container>
      }

      <div className="grid gap-4 md:grid-cols-2">
        <Container className="p-0 overflow-hidden">
          <div className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-ui-border-base">
            <div className="flex flex-col space-y-1.5">
              <Heading level="h2">Resource Information</Heading>
              <Text className="text-ui-fg-subtle">Details about this resource</Text>
            </div>
            {!isEditingResource ? (
              <Button variant="secondary" size="small" onClick={handleEditResource}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <Button variant="secondary" size="small" onClick={() => setIsEditingResource(false)}>
                    Cancel
                  </Button>
                  <Button size="small" onClick={handleSaveResource}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4 p-6">
            <div>
              <Text className="text-sm text-ui-fg-subtle">Resource ID</Text>
              <Text className="font-medium">{booking_resource.id}</Text>
            </div>
            
            {isEditingResource ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={resourceForm?.title || ""} 
                    onChange={(e) => setResourceForm({...resourceForm!, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input 
                    id="subtitle" 
                    value={resourceForm?.subtitle || ""} 
                    onChange={(e) => setResourceForm({...resourceForm!, subtitle: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={resourceForm?.description || ""} 
                    onChange={(e) => setResourceForm({...resourceForm!, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input 
                    disabled
                    value={booking_resource.resource_type + " (Not editable)"}
                  />
                </div>
                <div className="flex items-center justify-between border border-ui-border-base p-3 rounded-md">
                  <Label htmlFor="is_bookable">Bookable</Label>
                  <Switch 
                    id="is_bookable" 
                    checked={resourceForm?.is_bookable} 
                    onCheckedChange={(checked) => setResourceForm({...resourceForm!, is_bookable: checked})}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Text className="text-sm text-ui-fg-subtle">Title</Text>
                  <Text className="font-medium">{booking_resource.title}</Text>
                </div>
                <div>
                  <Text className="text-sm text-ui-fg-subtle">Subtitle</Text>
                  <Text className="font-medium">{booking_resource.subtitle || "-"}</Text>
                </div>
                <div>
                  <Text className="text-sm text-ui-fg-subtle">Description</Text>
                  <Text className="font-medium whitespace-pre-wrap">{booking_resource.description || "-"}</Text>
                </div>
                <div>
                  <Text className="text-sm text-ui-fg-subtle">Type</Text>
                  <Badge color="grey">{booking_resource.resource_type}</Badge>
                </div>
                <div>
                  <Text className="text-sm text-ui-fg-subtle">Bookable</Text>
                  <Badge color={booking_resource.is_bookable ? "green" : "grey"}>
                    {booking_resource.is_bookable ? "Yes" : "No"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </Container>

        <Container className="p-0 overflow-hidden">
          <div className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-ui-border-base">
            <div className="flex flex-col space-y-1.5">
              <Heading level="h2">Pricing Configurations</Heading>
              <Text className="text-ui-fg-subtle">Available pricing options</Text>
            </div>
            {!isEditingPricing ? (
              <Button variant="secondary" size="small" onClick={handleEditPricing}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="secondary" size="small" onClick={() => setIsEditingPricing(false)}>
                  Cancel
                </Button>
                <Button size="small" onClick={handleSavePricing}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4 p-6">
            {isEditingPricing ? (
              <div className="space-y-6">
                {pricingForm.map((configItem: UpdateBookingResourcePricingDTO, index: number) => (
                  <div key={index} className="border border-ui-border-base p-3 rounded-md space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="space-y-1">
                        <Label className="text-xs">Value</Label>
                        <Input 
                          type="number" 
                          value={configItem.config.unit_value} 
                          onChange={(e) => updatePricingConfig(index, "unit_value", Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit</Label>
                        <Select
                          value={configItem.config.unit}
                          onValueChange={(value) => updatePricingConfig(index, "unit", value)}
                        >
                          <Select.Trigger className="h-8">
                            <Select.Value placeholder="Select unit" />
                          </Select.Trigger>
                          <Select.Content>
                            {Object.values(BookingResourcePricingConfigUnit).map((unit) => (
                              <Select.Item key={unit} value={unit}>
                                {unit.charAt(0).toUpperCase() + unit.slice(1)}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </div>
                      </div>
                      <Prompt>
                        <Prompt.Trigger asChild>
                          <Button variant="transparent" size="small" className="text-ui-fg-error">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Prompt.Trigger>
                        <Prompt.Content>
                          <Prompt.Header>
                            <Prompt.Title>Delete Pricing</Prompt.Title>
                            <Prompt.Description>Are you sure you want to delete this pricing configuration? This action cannot be undone.</Prompt.Description>
                          </Prompt.Header>
                          <Prompt.Footer>
                            <Prompt.Cancel>Cancel</Prompt.Cancel>
                            <Prompt.Action onClick={() => handleDeletePricing(index)}>Delete</Prompt.Action>
                          </Prompt.Footer>
                        </Prompt.Content>
                      </Prompt>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-ui-fg-subtle">Prices</Label>
                      {configItem.pricing.map((price: BookingResourcePricingDTO, pIndex: number) => (
                        <div key={pIndex} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-12">{price.currency_code.toUpperCase()}</span>
                          <Input 
                            type="number" 
                            value={price.amount} 
                            onChange={(e) => updatePricingAmount(index, pIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="secondary" className="w-full" onClick={handleAddPricing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </div>
            ) : (
              <>
                {booking_resource_pricing_configs && booking_resource_pricing_configs.length > 0 ? (
                  booking_resource_pricing_configs.map((configItem: any, index: number) => (
                    <div key={index} className="border-b border-ui-border-base pb-2 last:border-0 last:pb-0">
                      <Text className="font-medium">
                        {configItem.config.unit_value} {configItem.config.unit}
                      </Text>
                      <div className="flex flex-col gap-1 mt-1">
                        {configItem.pricing.map((price: any, pIndex: number) => (
                          <span key={pIndex} className="text-sm text-ui-fg-subtle">
                            {price.amount} {price.currency_code.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <Text className="text-sm text-ui-fg-subtle">No pricing configurations available</Text>
                )}
              </>
            )}
          </div>
        </Container>

        <Container className="md:col-span-2 p-0 overflow-hidden">
          <div className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-ui-border-base">
            <div className="flex flex-col space-y-1.5">
              <Heading level="h2">Availability Rules</Heading>
              <Text className="text-ui-fg-subtle">Manage availability rules for this resource</Text>
            </div>
            {!editingRule && (
              <Button size="small" onClick={handleAddRule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            )}
          </div>
          <div className="space-y-4 p-6">
            {editingRule ? (
              <div className="space-y-4 border border-ui-border-base p-4 rounded-md">
                <div className="flex items-center space-x-3 p-3 border border-ui-border-base rounded-lg bg-ui-bg-subtle">
                  <Switch 
                    id="rule-mode"
                    checked={editingRule.mode === 'full_days'}
                    onCheckedChange={(checked) => {
                      const newMode = checked ? 'full_days' : 'specific_times'
                      setEditingRule({
                        ...editingRule,
                        mode: newMode,
                        valid_from: '',
                        valid_until: ''
                      })
                    }}
                  />
                  <Label htmlFor="rule-mode" className="text-sm font-medium flex items-center gap-2">
                    {editingRule.mode === 'full_days' ? '📅 Day Mode' : '⏰ Time Mode'}
                    <span className="text-xs font-normal text-ui-fg-subtle">
                      {editingRule.mode === 'full_days' 
                        ? '(Automatically blocks 00:00-23:59 each day)'
                        : '(Specific hours/minutes)'
                      }
                    </span>
                  </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input 
                      value={editingRule.name} 
                      onChange={(e) => setEditingRule({...editingRule, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input 
                      value={editingRule.rule_type} 
                      onChange={(e) => setEditingRule({...editingRule, rule_type: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Effect</Label>
                    <Select
                      value={editingRule.effect}
                      onValueChange={(value) => setEditingRule({...editingRule, effect: value})}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select effect" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="available">Available</Select.Item>
                        <Select.Item value="unavailable">Unavailable</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Input 
                      type="number"
                      value={editingRule.priority} 
                      onChange={(e) => setEditingRule({...editingRule, priority: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                    <Input 
                      type={editingRule.mode === 'full_days' ? "date" : "datetime-local"}
                      value={editingRule.valid_from} 
                      onChange={(e) => setEditingRule({...editingRule, valid_from: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input 
                      type={editingRule.mode === 'full_days' ? "date" : "datetime-local"}
                      value={editingRule.valid_until} 
                      onChange={(e) => setEditingRule({...editingRule, valid_until: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Configuration (JSON)</Label>
                  <Textarea 
                    className="font-mono text-xs"
                    rows={5}
                    value={editingRule.configuration} 
                    onChange={(e) => setEditingRule({...editingRule, configuration: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between border border-ui-border-base p-3 rounded-md">
                  <Label>Active</Label>
                  <Switch 
                    checked={editingRule.is_active} 
                    onCheckedChange={(checked) => setEditingRule({...editingRule, is_active: checked})}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="transparent" onClick={() => setEditingRule(null)}>Cancel</Button>
                  <Button onClick={handleSaveRule}>Save Rule</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {booking_resource_availability_rules && booking_resource_availability_rules.length > 0 ? (
                  booking_resource_availability_rules.map((rule: any) => (
                    <div key={rule.id} className="flex items-center justify-between border border-ui-border-base p-4 rounded-md">
                      <div>
                        <div className="flex items-center gap-2">
                          <Text className="font-medium">{rule.name}</Text>
                          <Badge color={rule.is_active ? "green" : "grey"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge color="grey">{rule.effect}</Badge>
                        </div>
                        <Text className="text-sm text-ui-fg-subtle mt-1">
                          Priority: {rule.priority} | Type: {rule.rule_type}
                        </Text>
                        <Text className="text-xs text-ui-fg-subtle mt-1">
                          {rule.valid_from ? new Date(rule.valid_from).toLocaleDateString() : "Anytime"} - {rule.valid_until ? new Date(rule.valid_until).toLocaleDateString() : "Forever"}
                        </Text>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="transparent" className="p-2" onClick={() => handleEditRule(rule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Prompt>
                          <Prompt.Trigger asChild>
                            <Button variant="transparent" className="p-2 text-ui-fg-error">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Prompt.Trigger>
                          <Prompt.Content>
                            <Prompt.Header>
                              <Prompt.Title>Delete Rule</Prompt.Title>
                              <Prompt.Description>Are you sure you want to delete this availability rule? This action cannot be undone.</Prompt.Description>
                            </Prompt.Header>
                            <Prompt.Footer>
                              <Prompt.Cancel>Cancel</Prompt.Cancel>
                              <Prompt.Action onClick={() => handleDeleteRule(rule.id)}>Delete</Prompt.Action>
                            </Prompt.Footer>
                          </Prompt.Content>
                        </Prompt>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text className="text-sm text-ui-fg-subtle">No availability rules defined.</Text>
                )}
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-ui-border-base">
          <div className="flex flex-col space-y-1.5">
            <Heading level="h2">Resource Calendar</Heading>
            <Text className="text-ui-fg-subtle">View availability for this resource</Text>
          </div>
          <div className="flex items-center bg-ui-bg-subtle p-1 rounded-lg border border-ui-border-base">
            <Button
              variant={calendarView === "month" ? "secondary" : "transparent"}
              size="small"
              onClick={() => setCalendarView("month")}
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Month
            </Button>
            <Button
              variant={calendarView === "week" ? "secondary" : "transparent"}
              size="small"
              onClick={() => setCalendarView("week")}
              className="gap-2"
              disabled
            >
              <LayoutGrid className="h-4 w-4" />
              Week
            </Button>
          </div>
        </div>
        <div className="p-6">
          {calendarView === "month" ? (
            <MonthCalendar 
              availability={availability} 
              date={currentDate}
              onDateChange={setCurrentDate}
            /> 
          ) : (
            <WeekCalendar 
              availability={availability} 
              date={currentDate}
              onDateChange={setCurrentDate}
            />
          )}
        </div>
      </Container>

      <Toaster />
    </div>
  )
}
