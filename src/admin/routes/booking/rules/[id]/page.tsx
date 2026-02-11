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
  CodeBlock,
} from "@medusajs/ui";
import {
  ArrowLeft,
  Adjustments,
  EllipsisHorizontal,
  BuildingsMini,
} from "@medusajs/icons";
import { Spinner } from "../../../../ui/components/spinner";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { medusaSdk } from "../../../../lib/sdk";
import { BookingRuleDTO } from "../../../../types/booking-rules";

type BookingRuleDetailResponse = {
  booking_rule: BookingRuleDTO;
  booking_resources_count: number;
};

const BookingRuleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rule, setRule] = useState<BookingRuleDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [bookingResourcesCount, setBookingResourcesCount] = useState(0);
  useEffect(() => {
    if (id) {
      fetchRule();
    }
  }, [id]);

  const fetchRule = async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const response =
        await medusaSdk.client.fetch<BookingRuleDetailResponse>(
          `/admin/booking-rules/${id}`,
        );
      setRule(response.booking_rule);
      setBookingResourcesCount(response.booking_resources_count);
    } catch (err) {
      console.error("Failed to fetch booking rule", err);
      setError("Failed to load rule");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRule = async () => {
    if (!id) return;

    setIsDeleting(true);
    setError(null);
    try {
      await medusaSdk.client.fetch(`/admin/booking-rules/${id}`, {
        method: "DELETE",
      });
      navigate("/booking/rules");
    } catch (err) {
      console.error("Failed to delete rule", err);
      setError("Failed to delete rule");
      setShowDeletePrompt(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="animate-spin" />
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="transparent"
            className="p-2"
            onClick={() => navigate("/booking/rules")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Heading>Rule</Heading>
            <Text className="text-ui-fg-subtle">
              {error || "Rule not found"}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  const hasConfig =
    rule.configuration != null &&
    Object.keys(rule.configuration).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="transparent"
            className="p-2"
            onClick={() => navigate("/booking/rules")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Heading>Rule details</Heading>
            <Text className="text-ui-fg-subtle">
              {rule.name || rule.id}
            </Text>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="secondary">
              <EllipsisHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              className="text-ui-fg-error"
              onClick={() => setShowDeletePrompt(true)}
            >
              Delete rule
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      <Prompt open={showDeletePrompt} onOpenChange={setShowDeletePrompt}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete rule</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete this rule? This action cannot be
              undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel disabled={isDeleting}>Cancel</Prompt.Cancel>
            <Prompt.Action
              onClick={deleteRule}
              disabled={isDeleting}
              className="bg-ui-tag-red-bg text-ui-tag-red-text hover:bg-ui-tag-red-bg-hover"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-y-4">
          {/* Summary */}
          <Container>
            <div className="flex items-center justify-between p-6">
              <div>
                <Heading level="h2">Summary</Heading>
                <Text className="text-ui-fg-subtle">
                  {rule.description || "No description"}
                </Text>
              </div>
              <Badge color={rule.is_active ? "green" : "red"}>
                {rule.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-t border-ui-border-base">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-bg-subtle border">
                  <Adjustments className="h-5 w-5 text-ui-fg-subtle" />
                </div>
                <div>
                  <Text className="text-ui-fg-subtle">Scope</Text>
                  <Badge
                    size="small"
                    color={rule.scope === "global" ? "blue" : "green"}
                    className="mt-1"
                  >
                    {rule.scope}
                  </Badge>
                </div>
              </div>
              {(
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-bg-subtle border">
                    <BuildingsMini className="h-5 w-5 text-ui-fg-subtle" />
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle">Affected resources</Text>
                    <Text
                      className="font-medium text-ui-fg-interactive"
                    >
                      {bookingResourcesCount}
                    </Text>
                  </div>
                </div>
                )}
            </div>
          </Container>

          {/* Configuration */}
          <Container className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-ui-border-base">
              <Heading level="h2">Configuration</Heading>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Text className="text-ui-fg-subtle">Require payment</Text>
                <Badge
                  size="small"
                  color={rule.require_payment ? "green" : "grey"}
                >
                  {rule.require_payment ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-ui-fg-subtle">Require confirmation</Text>
                <Badge
                  size="small"
                  color={rule.require_confirmation ? "orange" : "grey"}
                >
                  {rule.require_confirmation ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-ui-fg-subtle">Reservation TTL (s)</Text>
                <Text>{rule.reservation_ttl_seconds}</Text>
              </div>
              {hasConfig && (
                <div>
                  <Text className="text-ui-fg-subtle block mb-2">
                    Custom configuration
                  </Text>
                  <CodeBlock
                    snippets={[
                      {
                        label: "JSON",
                        language: "json",
                        code: JSON.stringify(rule.configuration, null, 2),
                        hideLineNumbers: true,
                      },
                    ]}
                  >
                    <CodeBlock.Header hideLabels />
                    <CodeBlock.Body />
                  </CodeBlock>
                </div>
              )}
            </div>
          </Container>

          {/* Priority & validity */}
          <Container className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-ui-border-base">
              <Heading level="h2">Priority & validity</Heading>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Text className="text-ui-fg-subtle">Priority</Text>
                <Text>{rule.priority}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-ui-fg-subtle">Valid from</Text>
                <Text>{formatDateTime(rule.valid_from)}</Text>
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-ui-fg-subtle">Valid until</Text>
                <Text>{formatDateTime(rule.valid_until)}</Text>
              </div>
            </div>
          </Container>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-y-4">
          <Container className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-ui-border-base">
              <Heading level="h2">Details</Heading>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <Text className="text-ui-fg-subtle text-sm">ID</Text>
                <Text className="font-mono text-xs break-all">
                  {rule.id}
                </Text>
              </div>
              {rule.created_at && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Created</Text>
                  <Text className="text-sm">
                    {formatDateTime(rule.created_at)}
                  </Text>
                </div>
              )}
              {rule.updated_at && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Updated</Text>
                  <Text className="text-sm">
                    {formatDateTime(rule.updated_at)}
                  </Text>
                </div>
              )}
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default BookingRuleDetailPage;

export const config = defineRouteConfig({
  label: "Rule details",
});
