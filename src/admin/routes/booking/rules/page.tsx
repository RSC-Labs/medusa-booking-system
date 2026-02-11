"use client";

import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Badge,
  Button,
  CodeBlock,
  Container,
  Heading,
  Input,
  Label,
  Table,
  Text,
  Tabs,
  Select,
  FocusModal,
} from "@medusajs/ui";
import { Plus, Spinner, Adjustments, Eye } from "@medusajs/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { medusaSdk } from "../../../lib/sdk";
import {
  BookingRuleDTO,
  GetBookingRulesDTO,
  ResolvedRulesDTO,
} from "../../../types/booking-rules";
import {
  BookingResourceDTO,
  GetBookingResourcesDTO,
} from "../../../types/booking-resource";
import { CreateRuleModal } from "./components/CreateRuleModal";

function countApplicableRules(
  rules: BookingRuleDTO[],
  resourceId: string,
): number {
  const now = new Date();
  return rules.filter((r) => {
    if (!r.is_active) return false;
    if (r.valid_from && new Date(r.valid_from) > now) return false;
    if (r.valid_until && new Date(r.valid_until) < now) return false;
    if (r.scope === "global") return true;
    if (
      r.scope === "resource" &&
      r.booking_resource_ids?.some((id) => id === resourceId)
    )
      return true;
    return false;
  }).length;
}

export const config = defineRouteConfig({
  label: "Rules",
  icon: Adjustments,
});

const BookingRulesPage = () => {
  const [rules, setRules] = useState<BookingRuleDTO[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [configModalRule, setConfigModalRule] = useState<BookingRuleDTO | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [resources, setResources] = useState<BookingResourceDTO[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  const [testResourceId, setTestResourceId] = useState<string>("__global__");
  const [testDateTime, setTestDateTime] = useState<string>("");
  const [resolvedRules, setResolvedRules] = useState<ResolvedRulesDTO | null>(
    null,
  );
  const [testEvaluateLoading, setTestEvaluateLoading] = useState(false);

  const navigate = useNavigate();

  const evaluateRules = async () => {
    if (!testDateTime.trim()) return;
    setTestEvaluateLoading(true);
    setResolvedRules(null);
    try {
      const params = new URLSearchParams({
        evaluation_time: new Date(testDateTime).toISOString(),
      });
      if (testResourceId && testResourceId !== "__global__") {
        params.set("booking_resource_id", testResourceId);
      }
      const response = await medusaSdk.client.fetch<{
        resolved_rules: ResolvedRulesDTO;
      }>(`/admin/booking-rules/evaluate?${params.toString()}`);
      setResolvedRules(response.resolved_rules ?? null);
    } catch (error) {
      console.error("Failed to evaluate rules", error);
    } finally {
      setTestEvaluateLoading(false);
    }
  };

  const [totalResourcesCount, setTotalResourcesCount] = useState<number | null>(
    null,
  );

  const fetchRules = async () => {
    setRulesLoading(true);
    try {
      const response = await medusaSdk.client.fetch<GetBookingRulesDTO>(
        "/admin/booking-rules",
      );
      setRules(response.booking_rules ?? []);
      setTotalResourcesCount(response.booking_resources_count ?? null);
    } catch (error) {
      console.error("Failed to fetch booking rules", error);
    } finally {
      setRulesLoading(false);
    }
  };

  const fetchResources = async () => {
    setResourcesLoading(true);
    try {
      const response = await medusaSdk.client.fetch<GetBookingResourcesDTO>(
        "/admin/booking-resources",
      );
      setResources(response.booking_resources ?? []);
    } catch (error) {
      console.error("Failed to fetch booking resources", error);
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading>Booking Rules</Heading>
        </div>
      </div>

      <CreateRuleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={fetchRules}
      />

      <Tabs defaultValue="rules">
        <Tabs.List>
          <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
          <Tabs.Trigger value="resources">Resources</Tabs.Trigger>
          <Tabs.Trigger value="test">Test</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="rules" className="pt-4">
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
              <Text className="text-ui-fg-subtle">
                Global and resource-specific booking rules.
              </Text>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus />
                Add rule
              </Button>
            </div>
            <Container className="p-0 overflow-hidden">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Scope</Table.HeaderCell>
                    <Table.HeaderCell>Affected resources</Table.HeaderCell>
                    <Table.HeaderCell>Priority</Table.HeaderCell>
                    <Table.HeaderCell>Active</Table.HeaderCell>
                    <Table.HeaderCell>Valid from</Table.HeaderCell>
                    <Table.HeaderCell>Valid until</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rulesLoading ? (
                    <Table.Row>
                      <Table.Cell
                        {...({ colSpan: 8 } as Record<string, unknown>)}
                        className="text-center py-8"
                      >
                        <div className="flex justify-center">
                          <Spinner className="animate-spin" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : rules.length > 0 ? (
                    rules.map((rule) => (
                      <Table.Row
                        key={rule.id}
                        className="cursor-pointer hover:bg-ui-bg-base-hover"
                        onClick={() => navigate(`/booking/rules/${rule.id}`)}
                      >
                        <Table.Cell className="font-medium">
                          {rule.name ?? "—"}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            size="small"
                            color={rule.scope === "global" ? "blue" : "green"}
                          >
                            {rule.scope}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {rule.scope === "global"
                            ? totalResourcesCount ?? "—"
                            : rule.booking_resource_ids?.length ?? 0}
                        </Table.Cell>
                        <Table.Cell>{rule.priority}</Table.Cell>
                        <Table.Cell>
                          <Badge
                            size="small"
                            color={rule.is_active ? "green" : "red"}
                          >
                            {rule.is_active ? "Yes" : "No"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell className="text-ui-fg-subtle text-xs">
                          {rule.valid_from
                            ? new Date(rule.valid_from).toLocaleString()
                            : "—"}
                        </Table.Cell>
                        <Table.Cell className="text-ui-fg-subtle text-xs">
                          {rule.valid_until
                            ? new Date(rule.valid_until).toLocaleString()
                            : "—"}
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="transparent"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfigModalRule(rule);
                            }}
                          >
                            <Eye />
                            View configuration
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell
                        {...({ colSpan: 8 } as Record<string, unknown>)}
                        className="text-center py-8 text-ui-fg-subtle"
                      >
                        No rules yet. Add a global or resource-specific rule to
                        get started.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
              {!rulesLoading && rules.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base">
                  <Text className="text-ui-fg-subtle text-sm">
                    Showing {rules.length} rule
                    {rules.length !== 1 ? "s" : ""}
                  </Text>
                </div>
              )}
            </Container>

            <FocusModal
              open={configModalRule != null}
              onOpenChange={(open) => !open && setConfigModalRule(null)}
            >
              <FocusModal.Content>
                <FocusModal.Header>
                  <Heading>Configuration</Heading>
                </FocusModal.Header>
                <FocusModal.Body>
                  {configModalRule && (
                    <div className="flex flex-col items-center gap-y-8 pt-6">
                      <div className="w-full max-w-md flex flex-col gap-y-8">
                        <dl className="flex flex-col gap-y-5 text-sm">
                          <div className="flex items-center gap-3">
                            <dt className="text-ui-fg-subtle min-w-[160px]">
                              Require payment
                            </dt>
                            <dd>
                              <Badge
                                size="small"
                                color={
                                  configModalRule.require_payment
                                    ? "green"
                                    : "grey"
                                }
                              >
                                {configModalRule.require_payment ? "Yes" : "No"}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex items-center gap-3">
                            <dt className="text-ui-fg-subtle min-w-[160px]">
                              Require confirmation
                            </dt>
                            <dd>
                              <Badge
                                size="small"
                                color={
                                  configModalRule.require_confirmation
                                    ? "orange"
                                    : "grey"
                                }
                              >
                                {configModalRule.require_confirmation
                                  ? "Yes"
                                  : "No"}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex items-center gap-3">
                            <dt className="text-ui-fg-subtle min-w-[160px]">
                              Reservation TTL (s)
                            </dt>
                            <dd>{configModalRule.reservation_ttl_seconds}</dd>
                          </div>
                        </dl>
                        <div className="flex flex-col gap-3">
                          <Text className="text-ui-fg-subtle text-sm">
                            Custom configuration
                          </Text>
                          <CodeBlock
                            snippets={[
                              {
                                label: "JSON",
                                language: "json",
                                code:
                                  configModalRule.configuration != null &&
                                  Object.keys(configModalRule.configuration)
                                    .length > 0
                                    ? JSON.stringify(
                                        configModalRule.configuration,
                                        null,
                                        2,
                                      )
                                    : "{}",
                                hideLineNumbers: true,
                              },
                            ]}
                          >
                            <CodeBlock.Header hideLabels={true} />
                            <CodeBlock.Body />
                          </CodeBlock>
                        </div>
                      </div>
                    </div>
                  )}
                </FocusModal.Body>
                <FocusModal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setConfigModalRule(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      if (configModalRule) {
                        setConfigModalRule(null);
                        navigate(`/booking/rules/${configModalRule.id}`);
                      }
                    }}
                  >
                    Go to rule
                  </Button>
                </FocusModal.Footer>
              </FocusModal.Content>
            </FocusModal>
          </div>
        </Tabs.Content>

        <Tabs.Content value="resources" className="pt-4">
          <div className="flex flex-col gap-y-4">
            <Text className="text-ui-fg-subtle">
              Resources with how many booking rules apply to each
            </Text>
            <Container className="p-0 overflow-hidden">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Published</Table.HeaderCell>
                    <Table.HeaderCell>Rules applied</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {resourcesLoading ? (
                    <Table.Row>
                      <Table.Cell
                        className="text-center py-8"
                        {...({ colSpan: 4 } as Record<string, unknown>)}
                      >
                        <div className="flex justify-center">
                          <Spinner className="animate-spin" />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : resources.length > 0 ? (
                    resources.map((resource) => {
                      const applicableCount = countApplicableRules(
                        rules,
                        resource.id,
                      );
                      return (
                        <Table.Row
                          key={resource.id}
                          className="cursor-pointer hover:bg-ui-bg-base-hover"
                          onClick={() =>
                            navigate(`/booking/resources/${resource.id}`)
                          }
                        >
                          <Table.Cell className="font-medium">
                            {resource.title || resource.id}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="small"
                              color={
                                resource.status === "published"
                                  ? "green"
                                  : "grey"
                              }
                            >
                              {resource.status === "published" ? "Yes" : "No"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{applicableCount}</Table.Cell>
                          <Table.Cell>
                            <Button
                              variant="transparent"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/booking/resources/${resource.id}`);
                              }}
                            >
                              View
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  ) : (
                    <Table.Row>
                      <Table.Cell
                        className="text-center py-8 text-ui-fg-subtle"
                        {...({ colSpan: 4 } as Record<string, unknown>)}
                      >
                        No resources found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
              {!resourcesLoading && resources.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-ui-border-base">
                  <Text className="text-ui-fg-subtle text-sm">
                    Showing {resources.length} resource
                    {resources.length !== 1 ? "s" : ""}
                  </Text>
                </div>
              )}
            </Container>
          </div>
        </Tabs.Content>

        <Tabs.Content value="test" className="pt-4">
          <div className="flex flex-col gap-y-6 max-w-2xl">
            <Text className="text-ui-fg-subtle">
              Evaluate which rules apply at a given date/time, for a resource
              or globally
            </Text>
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="test-resource">Resource</Label>
                <Select
                  value={testResourceId}
                  onValueChange={setTestResourceId}
                >
                  <Select.Trigger id="test-resource">
                    <Select.Value placeholder="Select resource (or Global)" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="__global__">
                      Global (no resource)
                    </Select.Item>
                    {resources.map((r) => (
                      <Select.Item key={r.id} value={r.id}>
                        {r.title || r.id}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="test-datetime">Date & time</Label>
                <Input
                  id="test-datetime"
                  type="datetime-local"
                  value={testDateTime}
                  onChange={(e) => setTestDateTime(e.target.value)}
                />
              </div>
              <Button
                onClick={evaluateRules}
                disabled={!testDateTime.trim() || testEvaluateLoading}
              >
                {testEvaluateLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                    Evaluate
                  </>
                ) : (
                  "Evaluate settings"
                )}
              </Button>
            </div>
            {resolvedRules && (
              <Container className="p-4">
                <Heading level="h3" className="mb-3">
                  Applied rules
                </Heading>
                <dl className="flex flex-col gap-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ui-fg-subtle">Require payment</dt>
                    <dd>
                      <Badge
                        size="small"
                        color={resolvedRules.require_payment ? "green" : "grey"}
                      >
                        {resolvedRules.require_payment ? "Yes" : "No"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ui-fg-subtle">Require confirmation</dt>
                    <dd>
                      <Badge
                        size="small"
                        color={
                          resolvedRules.require_confirmation ? "orange" : "grey"
                        }
                      >
                        {resolvedRules.require_confirmation ? "Yes" : "No"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ui-fg-subtle">
                      Reservation TTL (seconds)
                    </dt>
                    <dd>{resolvedRules.reservation_ttl_seconds}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ui-fg-subtle">Resolved from</dt>
                    <dd>
                      {resolvedRules._resolved_from?.length
                        ? resolvedRules._resolved_from.join(", ")
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ui-fg-subtle">Priority</dt>
                    <dd>{resolvedRules._priority}</dd>
                  </div>
                  {resolvedRules.custom_config != null &&
                    Object.keys(resolvedRules.custom_config).length > 0 && (
                      <div className="flex flex-col gap-1">
                        <dt className="text-ui-fg-subtle">Custom config</dt>
                        <dd className="font-mono text-xs bg-ui-bg-subtle p-2 rounded">
                          <pre>
                            {JSON.stringify(
                              resolvedRules.custom_config,
                              null,
                              2,
                            )}
                          </pre>
                        </dd>
                      </div>
                    )}
                </dl>
              </Container>
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
};

export default BookingRulesPage;
