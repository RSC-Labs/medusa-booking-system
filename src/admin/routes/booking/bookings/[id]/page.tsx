"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Button,
  Badge,
  Text,
  DropdownMenu,
  Prompt,
} from "@medusajs/ui";
import {
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  User,
  Package,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { medusaSdk } from "../../../../lib/sdk";
import { Spinner } from "../../../../ui/components/spinner";

type BookingDetail = {
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
      phone: string | null;
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
  metadata?: Record<string, any>;
  created_at?: string;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
};

type BookingResponse = {
  booking: BookingDetail;
};

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await medusaSdk.client.fetch<BookingResponse>(
        `/admin/bookings/${id}`,
      );
      setBooking(response.booking);
    } catch (error) {
      console.error("Failed to fetch booking", error);
      setError("Failed to load booking details");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!id) return;

    setIsCancelling(true);
    setError(null);
    try {
      await medusaSdk.client.fetch(`/admin/bookings/${id}/cancel`, {
        method: "POST",
      });
      // Refresh booking data after successful cancellation
      await fetchBooking();
    } catch (error) {
      console.error("Failed to cancel booking", error);
      setError("Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge color="green">Confirmed</Badge>;
      case "pending":
        return <Badge color="orange">Pending</Badge>;
      case "cancelled":
        return <Badge color="red">Cancelled</Badge>;
      case "completed":
        return <Badge color="blue">Completed</Badge>;
      default:
        return <Badge color="grey">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (
    amount: number | undefined,
    currency: string | undefined,
  ) => {
    if (!amount || !currency) return "-";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getResourceInfo = () => {
    if (
      !booking?.booking_line_items ||
      booking.booking_line_items.length === 0
    ) {
      return null;
    }
    const firstLineItem = booking.booking_line_items[0];
    const resource =
      firstLineItem.booking_resource_allocation?.booking_resource;
    if (resource) {
      return {
        id: resource.id,
        title: resource.title,
        resource_type: resource.resource_type || "Resource",
      };
    }
    return null;
  };

  const buildTimeline = () => {
    if (!booking) return [];

    const timeline: Array<{
      time: string;
      message: string;
      type: "event" | "payment";
    }> = [];

    if (booking.created_at) {
      timeline.push({
        time: booking.created_at,
        message: "Booking created.",
        type: "event",
      });
    }

    if (booking.confirmed_at) {
      timeline.push({
        time: booking.confirmed_at,
        message: "Booking confirmed.",
        type: "event",
      });
    }

    if (booking.order && booking.order.total > 0) {
      const paymentTime =
        booking.confirmed_at || booking.created_at || new Date().toISOString();
      timeline.push({
        time: paymentTime,
        message: `Payment of ${formatCurrency(booking.order.total, booking.order.currency_code)} confirmed for order #${booking.order.display_id}.`,
        type: "payment",
      });
    }

    if (booking.completed_at) {
      timeline.push({
        time: booking.completed_at,
        message: "Booking completed.",
        type: "event",
      });
    }

    if (booking.cancelled_at) {
      timeline.push({
        time: booking.cancelled_at,
        message: "Booking cancelled.",
        type: "event",
      });
    }

    // Sort by time, most recent first
    return timeline.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="transparent"
            className="p-2"
            onClick={() => navigate("/booking/bookings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Heading>Booking Details</Heading>
            <Text className="text-ui-fg-subtle">
              {error || "Booking not found"}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  const resource = getResourceInfo();
  const timeline = buildTimeline();
  const customer = booking.order?.customer;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="transparent"
            className="p-2"
            onClick={() => navigate("/booking/bookings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Heading>Booking Details</Heading>
            <Text className="text-ui-fg-subtle">
              {booking.booking_number || booking.id}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {booking.status !== "cancelled" && (
            <Prompt>
              <Prompt.Trigger asChild>
                <Button variant="danger">Cancel Booking</Button>
              </Prompt.Trigger>
              <Prompt.Content>
                <Prompt.Header>
                  <Prompt.Title>Cancel Booking</Prompt.Title>
                  <Prompt.Description>
                    Are you sure you want to cancel this booking? This action
                    cannot be undone.
                  </Prompt.Description>
                </Prompt.Header>
                <Prompt.Footer>
                  <Prompt.Cancel disabled={isCancelling}>Cancel</Prompt.Cancel>
                  <Prompt.Action
                    onClick={cancelBooking}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Confirm"}
                  </Prompt.Action>
                </Prompt.Footer>
              </Prompt.Content>
            </Prompt>
          )}
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="secondary">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item className="text-ui-fg-error">
                Delete Booking
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-y-4">
          <Container>
            <div className="flex items-center justify-between p-6">
              <div>
                <Heading level="h2">Summary</Heading>
                <Text className="text-ui-fg-subtle">
                  {formatDate(booking.start_time)} -{" "}
                  {formatDate(booking.end_time)}
                </Text>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-t">
              {resource && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle border">
                    <Package className="h-5 w-5 text-ui-fg-subtle" />
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle">Resource</Text>
                    <Text
                      className="font-medium text-ui-fg-interactive hover:underline cursor-pointer"
                      onClick={() =>
                        navigate(`/booking/resources/${resource.id}`)
                      }
                    >
                      {resource.title}
                    </Text>
                    <Text className="text-ui-fg-subtle">
                      {resource.resource_type}
                    </Text>
                  </div>
                </div>
              )}
              {customer && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle border">
                    <User className="h-5 w-5 text-ui-fg-subtle" />
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle">Customer</Text>
                    <Text
                      className="font-medium text-ui-fg-interactive hover:underline cursor-pointer"
                      onClick={() => navigate(`/customers/${customer.id}`)}
                    >
                      {customer.first_name || ""} {customer.last_name || ""}
                    </Text>
                    <Text className="text-ui-fg-subtle">{customer.email}</Text>
                  </div>
                </div>
              )}
              {booking.order && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-subtle border">
                    <DollarSign className="h-5 w-5 text-ui-fg-subtle" />
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle">Payment</Text>
                    <Text className="font-medium">
                      {formatCurrency(
                        booking.order.total,
                        booking.order.currency_code,
                      )}
                    </Text>
                    {booking.order && (
                      <Text
                        className="text-ui-fg-subtle text-ui-fg-interactive hover:underline cursor-pointer"
                        onClick={() => {
                          if (booking.order) {
                            navigate(`/orders/${booking.order.id}`);
                          }
                        }}
                      >
                        Order #{booking.order.display_id}
                      </Text>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Container>

          {/* Booking Line Items Card */}
          {booking.booking_line_items &&
            booking.booking_line_items.length > 0 && (
              <Container>
                <div className="p-6">
                  <Heading level="h2" className="mb-4">
                    Booking Line Items
                  </Heading>
                  <div className="space-y-3">
                    {booking.booking_line_items.map((lineItem) => (
                      <div
                        key={lineItem.id}
                        className="flex items-start justify-between p-4 bg-ui-bg-subtle rounded-md border border-ui-border-base"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Text className="font-medium text-sm">
                              {lineItem.booking_resource_allocation
                                ?.booking_resource?.title || "Unknown Resource"}
                            </Text>
                            {lineItem.booking_resource_allocation
                              ?.booking_resource?.resource_type && (
                              <Badge size="small">
                                {
                                  lineItem.booking_resource_allocation
                                    .booking_resource.resource_type
                                }
                              </Badge>
                            )}
                          </div>
                          {lineItem.booking_resource_allocation
                            ?.booking_resource?.subtitle && (
                            <Text className="text-xs text-ui-fg-subtle mb-3">
                              {
                                lineItem.booking_resource_allocation
                                  .booking_resource.subtitle
                              }
                            </Text>
                          )}
                          <div className="flex flex-col gap-1 text-xs text-ui-fg-subtle">
                            <span>
                              <strong>Line Item:</strong>{" "}
                              {formatDate(lineItem.start_time)} -{" "}
                              {formatDate(lineItem.end_time)}
                            </span>
                            {lineItem.booking_resource_allocation && (
                              <>
                                <span>
                                  <strong>Allocation:</strong>{" "}
                                  {formatDate(
                                    lineItem.booking_resource_allocation
                                      .start_time,
                                  )}{" "}
                                  -{" "}
                                  {formatDate(
                                    lineItem.booking_resource_allocation
                                      .end_time,
                                  )}
                                </span>
                                {lineItem.booking_resource_allocation
                                  .status && (
                                  <span>
                                    <strong>Status:</strong>{" "}
                                    {
                                      lineItem.booking_resource_allocation
                                        .status
                                    }
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Container>
            )}

          <Container className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <Heading level="h2">Notes</Heading>
            </div>
            <div className="p-6">
              <Text>
                {booking.metadata?.notes || "No notes for this booking."}
              </Text>
            </div>
          </Container>
        </div>

        <div className="flex flex-col gap-y-4">
          <Container className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <Heading level="h2">Timeline</Heading>
            </div>
            <div className="p-6">
              {timeline.length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {timeline.map((event, eventIdx) => (
                      <li key={event.time}>
                        <div className="relative pb-8">
                          {eventIdx !== timeline.length - 1 ? (
                            <span
                              className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-ui-border-base"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-ui-bg-subtle flex items-center justify-center ring-8 ring-ui-bg-base">
                                {event.type === "payment" ? (
                                  <CheckCircle className="h-5 w-5 text-ui-fg-interactive" />
                                ) : (
                                  <Calendar className="h-5 w-5 text-ui-fg-subtle" />
                                )}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm text-ui-fg-base">
                                  {event.message}
                                </p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-ui-fg-subtle">
                                <time dateTime={event.time}>
                                  {new Date(event.time).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Text className="text-ui-fg-subtle">
                  No timeline events available.
                </Text>
              )}
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;

export const config = defineRouteConfig({
  label: "Booking Details",
});
