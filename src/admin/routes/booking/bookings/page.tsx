"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Table, Button, Badge, Text } from "@medusajs/ui";
import { Spinner } from "../../../ui/components/spinner";
import {
  BookOpenText,
  Plus,
  Search,
  Funnel,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { medusaSdk } from "../../../lib/sdk";
import { CreateBookingModal } from "./components/CreateBookingModal";

type BookingWithOrder = {
  id: string;
  booking_number: string;
  order_id: string | null;
  start_time: string | null;
  end_time: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  order: {
    id: string;
    display_id: number;
    customer: {
      id: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
    } | null;
    total: number;
    currency_code: string;
  } | null;
  booking_line_items?: Array<{
    id: string;
    start_time: string;
    end_time: string;
    metadata?: Record<string, any>;
    booking_resource_allocation?: {
      id: string;
      start_time: string;
      end_time: string;
      status: string;
      booking_resource?: {
        id: string;
        title: string;
        resource_type: string;
        subtitle?: string | null;
      };
    };
  }>;
};

type BookingsResponse = {
  bookings: BookingWithOrder[];
  count: number;
  offset: number;
  limit: number;
};

const BookingsOverviewPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithOrder[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBookings = async (skip: number = 0) => {
    setIsLoading(true);
    try {
      const response = await medusaSdk.client.fetch<BookingsResponse>(
        `/admin/bookings?skip=${skip}&take=${limit}`,
      );
      setBookings(response.bookings);
      setCount(response.count);
      setOffset(response.offset);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(0);
  }, []);

  const handlePrevious = () => {
    if (offset > 0) {
      fetchBookings(Math.max(0, offset - limit));
    }
  };

  const handleNext = () => {
    if (offset + limit < count) {
      fetchBookings(offset + limit);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCustomerName = (order: BookingWithOrder["order"]) => {
    if (!order?.customer) return "Guest";
    const { first_name, last_name, email } = order.customer;
    if (first_name || last_name) {
      return `${first_name || ""} ${last_name || ""}`.trim();
    }
    return email;
  };

  const formatAmount = (order: BookingWithOrder["order"]) => {
    if (!order) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: order.currency_code.toUpperCase(),
    }).format(order.total);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "orange";
      case "completed":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "grey";
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading>Bookings</Heading>
          <Text className="text-ui-fg-subtle">
            Manage all bookings and reservations.
          </Text>
        </div>
        <div className="flex gap-x-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <Container className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <div className="flex items-center gap-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-ui-fg-muted" />
              <input
                placeholder="Search bookings..."
                className="pl-8 h-8 w-64 rounded-md border border-ui-border-base bg-ui-bg-base text-sm focus:outline-none focus:border-ui-border-interactive"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="small">
              <Funnel className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Booking ID</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Resource</Table.HeaderCell>
              <Table.HeaderCell>Start Date</Table.HeaderCell>
              <Table.HeaderCell>End Date</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Amount</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell
                  className="text-center py-8"
                  {...({ colSpan: 8 } as any)}
                >
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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {formatCustomerName(booking.order)}
                      </span>
                      {booking.order?.customer?.email && (
                        <span className="text-xs text-ui-fg-subtle">
                          {booking.order.customer.email}
                        </span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-ui-fg-subtle">
                    {booking.booking_line_items &&
                    booking.booking_line_items.length > 0
                      ? booking.booking_line_items
                          .map(
                            (item) =>
                              item.booking_resource_allocation?.booking_resource
                                ?.title,
                          )
                          .filter(Boolean)
                          .join(", ") || "-"
                      : "-"}
                  </Table.Cell>
                  <Table.Cell>{formatDateTime(booking.start_time)}</Table.Cell>
                  <Table.Cell>{formatDateTime(booking.end_time)}</Table.Cell>
                  <Table.Cell>
                    <Badge color={getStatusColor(booking.status)} size="small">
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {formatAmount(booking.order)}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu action
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4 text-ui-fg-muted" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  className="text-center py-8 text-ui-fg-subtle"
                  {...({ colSpan: 8 } as any)}
                >
                  No bookings found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>

        {!isLoading && count > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base">
            <Text className="text-ui-fg-subtle text-sm">
              Showing {offset + 1}-{Math.min(offset + limit, count)} of {count}{" "}
              bookings
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

      <CreateBookingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreated={() => {
          fetchBookings(offset);
        }}
      />
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Bookings",
  icon: BookOpenText,
});

export default BookingsOverviewPage;
