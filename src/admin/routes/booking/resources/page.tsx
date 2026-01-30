// /home/szymkiew/medusa-development/medusa-app-2/src/admin/routes/booking/resources/page.tsx

"use client";
 
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { 
  Badge, 
  Button, 
  Container, 
  Heading, 
  Table, 
  Text
} from "@medusajs/ui";
import { Plus, Spinner, MagnifyingGlass, Funnel } from "@medusajs/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { medusaSdk } from "../../../lib/sdk";
import { BookingResourceDTO, GetBookingResourcesDTO } from "../../../types/booking-resource";
import { CreateResourceModal, ResourceTypesDrawer } from "../components/CreateResourceModal";

 export const config = defineRouteConfig({
   label: "Resources",
 })

 const BookingResourcesPage = () => {
  const [resources, setResources] = useState<BookingResourceDTO[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isTypesOpen, setIsTypesOpen] = useState(false)
  const [lastTypeUpdate, setLastTypeUpdate] = useState(Date.now())
  
  const navigate = useNavigate()

  const fetchResources = async () => {
    setLoading(true)
    try {
      const response = await medusaSdk.client.fetch<GetBookingResourcesDTO>(`/admin/booking-resources`)
      setResources(response.booking_resources)
      setCount(response.count)
    } catch (error) {
      console.error("Failed to fetch booking resources", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading>Resources</Heading>
          <Text className="text-ui-fg-subtle">
            Manage your bookable items, spaces, equipment, and services.
          </Text>
        </div>
        <div className="flex gap-x-2">
          <Button variant="secondary" onClick={() => setIsTypesOpen(true)}>
            Manage Resource Types
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus />
            Add Resource
          </Button>
        </div>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <div className="flex items-center gap-x-2">
            <div className="relative">
              <MagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-fg-muted" />
              <input
                placeholder="Search resources..."
                className="pl-8 h-8 w-64 rounded-md border border-ui-border-base bg-ui-bg-base text-sm focus:outline-none focus:border-ui-border-interactive"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="small">
              <Funnel />
              Filter
            </Button>
          </div>
        </div>
        
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Bookable</Table.HeaderCell>
              <Table.HeaderCell>Subtitle</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? (
              <Table.Row>
                <Table.Cell className="text-center py-4">
                  <div className="flex justify-center">
                    <Spinner className="animate-spin" />
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : resources.length > 0 ? (
              resources.map((resource) => (
                <Table.Row 
                  key={resource.id} 
                  className="cursor-pointer hover:bg-ui-bg-base-hover"
                  onClick={() => navigate(`/booking/resources/${resource.id}`)}
                >
                  <Table.Cell className="font-medium">{resource.id}</Table.Cell>
                  <Table.Cell>{resource.title}</Table.Cell>
                  <Table.Cell>
                    <Badge size="small">{resource.resource_type}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {resource.status ? (
                      <Badge size="small">{resource.status}</Badge>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={resource.is_bookable ? "green" : "grey"} size="small">
                      {resource.is_bookable ? "Yes" : "No"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{resource.subtitle || "-"}</Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell className="text-center py-4 text-ui-fg-subtle">
                  No resources found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
        <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base">
          <Text className="text-ui-fg-subtle text-sm">Showing {resources.length} results</Text>
          <div className="flex gap-x-2">
            <Button variant="secondary" size="small" disabled>Previous</Button>
            <Button variant="secondary" size="small" disabled>Next</Button>
          </div>
        </div>
      </Container>

      <CreateResourceModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={fetchResources}
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

export default BookingResourcesPage
