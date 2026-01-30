"use client"

import { useState, useEffect } from "react"
import {
  FocusModal,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Switch,
  Text,
  Heading,
  toast,
  Drawer,
  Table,
  IconButton,
} from "@medusajs/ui"
import { Plus, Trash } from "@medusajs/icons"
import { medusaSdk } from "../../../lib/sdk"

export function CreateResourceModal({
  open,
  onOpenChange,
  onCreated,
  onManageTypes,
  lastTypeUpdate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
  onManageTypes: () => void
  lastTypeUpdate?: number
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [types, setTypes] = useState<any[]>([])

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    resource_type: "",
    is_bookable: true,
    handle: "",
  })

  useEffect(() => {
    if (open) {
      medusaSdk.client.fetch(`/admin/product-types`)
        .then((res: any) => setTypes(res.product_types))
        .catch((err) => console.error(err))
    }
  }, [open, lastTypeUpdate])

  const isFormValid = formData.title.trim() !== "" && formData.resource_type !== ""

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("Title is required")
      return
    }

    if (!formData.resource_type) {
      toast.error("Type is required")
      return
    }

    setIsSubmitting(true)
    try {
      await medusaSdk.client.fetch(
        `/admin/booking-resources`,
        {
          method: "POST",
          body: {
            booking_resource: {
              title: formData.title,
              subtitle: formData.subtitle,
              description: formData.description,
              resource_type: formData.resource_type,
              is_bookable: formData.is_bookable,
              handle: formData.handle,
            },
            booking_resource_product_details: {
              handle: formData.handle || undefined,
            },
          },
        }
      )

      toast.success("Resource created")
      onCreated()
      onOpenChange(false)
      setFormData({
        title: "",
        subtitle: "",
        description: "",
        resource_type: "",
        is_bookable: true,
        handle: "",
      })
    } catch (e) {
      toast.error(`Failed to create resource. ${(e as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
            <Button onClick={handleCreate} isLoading={isSubmitting} disabled={!isFormValid || isSubmitting}>Create Resource</Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16 overflow-y-auto">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <Heading>Create Resource</Heading>
            <div className="flex flex-col gap-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title <span className="text-ui-fg-destructive">*</span></Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type <span className="text-ui-fg-destructive">*</span></Label>
                  <Select
                    value={formData.resource_type}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        resource_type: v,
                      })
                    }
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select type" />
                    </Select.Trigger>
                    <Select.Content>
                      {types.map((t) => (
                        <Select.Item key={t.id} value={t.value}>
                          {t.value}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                  <div className="flex justify-start">
                    <button
                      className="text-xs text-ui-fg-interactive hover:underline bg-transparent border-none cursor-pointer p-0"
                      onClick={onManageTypes}
                      type="button"
                    >
                      Manage types
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subtitle: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Handle</Label>
                <Input
                  value={formData.handle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      handle: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between border border-ui-border-base p-3 rounded-md">
                <div>
                  <Label>Bookable</Label>
                  <Text size="small" className="text-ui-fg-subtle">
                    Can this resource be booked?
                  </Text>
                </div>
                <Switch
                  checked={formData.is_bookable}
                  onCheckedChange={(v) =>
                    setFormData({
                      ...formData,
                      is_bookable: v,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

export function ResourceTypesDrawer({
  open,
  onOpenChange,
  onTypeChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onTypeChange?: () => void
}) {
  const [types, setTypes] = useState<any[]>([])
  const [newType, setNewType] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchTypes = async () => {
    setLoading(true)
    try {
      const res: any = await medusaSdk.client.fetch(`/admin/product-types`)
      setTypes(res.product_types)
    } catch {
      toast.error("Failed to fetch types")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchTypes()
  }, [open])

  const createType = async () => {
    if (!newType) return
    try {
      await medusaSdk.client.fetch(`/admin/product-types`, {
        method: "POST",
        body: { value: newType }
      })
      toast.success("Type created")
      setNewType("")
      fetchTypes()
      onTypeChange?.()
    } catch {
      toast.error("Failed to create type")
    }
  }

  const deleteType = async (id: string) => {
    try {
      await medusaSdk.client.fetch(`/admin/product-types/${id}`, {
        method: "DELETE"
      })
      toast.success("Type deleted")
      fetchTypes()
      onTypeChange?.()
    } catch {
      toast.error("Type is in use or cannot be deleted")
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Resource Types</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4 space-y-4">
          <Text size="small" className="text-ui-fg-subtle">
            Define reusable categories for resources.
          </Text>
          <div className="flex gap-2">
            <Input
              placeholder="New type name"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />
            <Button variant="secondary" onClick={createType}>
              <Plus />
            </Button>
          </div>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell className="w-[80px]" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {types.map((t) => (
                <Table.Row key={t.id}>
                  <Table.Cell>{t.value}</Table.Cell>
                  <Table.Cell className="text-right">
                    <IconButton
                      variant="transparent"
                      onClick={() => deleteType(t.id)}
                    >
                      <Trash />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
              {!types.length && !loading && (
                <Table.Row>
                  <Table.Cell
                    className="text-center text-ui-fg-subtle"
                  >
                    No types defined
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  )
}
