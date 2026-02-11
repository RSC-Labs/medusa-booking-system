"use client";

import { useState, useEffect } from "react";
import {
  FocusModal,
  ProgressTabs,
  Button,
  Text,
  Label,
  Input,
  Select,
  toast,
  Switch,
  Textarea,
  Checkbox,
} from "@medusajs/ui";
import { Spinner } from "@medusajs/icons";
import { medusaSdk } from "../../../../lib/sdk";
import {
  BookingResourceDTO,
  GetBookingResourcesDTO,
} from "../../../../types/booking-resource";

type CreateRuleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

type FormData = {
  name: string;
  description: string;
  scope: "global" | "resource";
  booking_resource_ids: string[];
  require_payment: boolean;
  require_confirmation: boolean;
  reservation_ttl_seconds: number;
  is_active: boolean;
  custom_config_json: string;
  priority: number;
  valid_from: string;
  valid_until: string;
};

const defaultFormData: FormData = {
  name: "",
  description: "",
  scope: "global",
  booking_resource_ids: [],
  require_payment: true,
  require_confirmation: false,
  reservation_ttl_seconds: 300,
  is_active: true,
  custom_config_json: "",
  priority: 0,
  valid_from: "",
  valid_until: "",
};

const STEPS = ["general", "configuration", "dates", "summary"] as const;
type Step = (typeof STEPS)[number];

export const CreateRuleModal = ({
  open,
  onOpenChange,
  onCreated,
}: CreateRuleModalProps) => {
  const [activeTab, setActiveTab] = useState<Step>("general");
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [resources, setResources] = useState<BookingResourceDTO[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    scope?: string;
    resource?: string;
    custom_config?: string;
  }>({});

  useEffect(() => {
    if (open) {
      fetchResources();
    }
  }, [open]);

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const response = await medusaSdk.client.fetch<GetBookingResourcesDTO>(
        "/admin/booking-resources"
      );
      setResources(response.booking_resources ?? []);
    } catch (error) {
      console.error("Failed to fetch resources", error);
    } finally {
      setLoadingResources(false);
    }
  };

  const validateGeneral = (): boolean => {
    const errors: typeof validationErrors = {};
    if (!formData.name?.trim()) errors.name = "Name is required";
    if (!formData.scope) errors.scope = "Scope is required";
    if (
      formData.scope === "resource" &&
      (!formData.booking_resource_ids?.length)
    ) {
      errors.resource = "At least one resource is required when scope is resource";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateConfiguration = (): boolean => {
    const errors: typeof validationErrors = {};
    if (formData.custom_config_json.trim()) {
      try {
        JSON.parse(formData.custom_config_json);
      } catch {
        errors.custom_config = "Invalid JSON";
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceedFromGeneral = (): boolean => {
    if (!formData.name?.trim() || !formData.scope) return false;
    if (formData.scope === "resource") {
      return Array.isArray(formData.booking_resource_ids) && formData.booking_resource_ids.length > 0;
    }
    return true;
  };

  const canProceedFromConfiguration = (): boolean => {
    if (!formData.custom_config_json.trim()) return true;
    try {
      JSON.parse(formData.custom_config_json);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (activeTab === "general") {
      if (!validateGeneral()) return;
      setValidationErrors({});
      setActiveTab("configuration");
    } else if (activeTab === "configuration") {
      if (!validateConfiguration()) return;
      setValidationErrors({});
      setActiveTab("dates");
    } else if (activeTab === "dates") {
      setActiveTab("summary");
    }
  };

  const handlePrevious = () => {
    if (activeTab === "configuration") setActiveTab("general");
    else if (activeTab === "dates") setActiveTab("configuration");
    else if (activeTab === "summary") setActiveTab("dates");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let configuration: Record<string, unknown> | null = null;
      if (formData.custom_config_json.trim()) {
        try {
          configuration = JSON.parse(formData.custom_config_json) as Record<string, unknown>;
        } catch {
          setValidationErrors({ custom_config: "Invalid JSON" });
          setIsSubmitting(false);
          return;
        }
      }

      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        scope: formData.scope,
        booking_resource_ids:
          formData.scope === "resource" ? formData.booking_resource_ids : null,
        require_payment: formData.require_payment,
        require_confirmation: formData.require_confirmation,
        reservation_ttl_seconds: formData.reservation_ttl_seconds,
        priority: formData.priority,
        is_active: formData.is_active,
        configuration,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      };

      await medusaSdk.client.fetch("/admin/booking-rules", {
        method: "POST",
        body,
      });

      toast.success("Rule created", {
        description: "The booking setting has been created.",
      });

      setFormData(defaultFormData);
      setValidationErrors({});
      setActiveTab("general");
      onCreated();
      setTimeout(() => onOpenChange(false), 100);
    } catch (error) {
      console.error("Failed to create rule", error);
      const message =
        error instanceof Error ? error.message : "Failed to create rule. Please try again.";
      toast.error("Failed to create rule", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormData(defaultFormData);
      setValidationErrors({});
      setActiveTab("general");
    }
    onOpenChange(next);
  };

  const formatDateTime = (s: string) => {
    if (!s?.trim()) return "—";
    try {
      return new Date(s).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return s;
    }
  };

  const selectedIds = new Set(formData.booking_resource_ids ?? []);
  const toggleResource = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      booking_resource_ids: prev.booking_resource_ids.includes(id)
        ? prev.booking_resource_ids.filter((x) => x !== id)
        : [...prev.booking_resource_ids, id],
    }));
    setValidationErrors((e) => ({ ...e, resource: undefined }));
  };
  const selectAllResources = () => {
    setFormData((prev) => ({
      ...prev,
      booking_resource_ids: resources.map((r) => r.id),
    }));
    setValidationErrors((e) => ({ ...e, resource: undefined }));
  };
  const clearAllResources = () => {
    setFormData((prev) => ({ ...prev, booking_resource_ids: [] }));
    setValidationErrors((e) => ({ ...e, resource: undefined }));
  };

  return (
    <FocusModal open={open} onOpenChange={handleOpenChange}>
      <FocusModal.Content>
        <FocusModal.Header>
          <FocusModal.Title>Add booking rule</FocusModal.Title>
        </FocusModal.Header>
        <FocusModal.Body className="overflow-y-auto">
          <div className="w-full px-4 py-6">
            <ProgressTabs
              value={activeTab}
              onValueChange={(value) => {
                const v = value as Step;
                if (v === "configuration" && activeTab === "general") {
                  if (!canProceedFromGeneral()) {
                    validateGeneral();
                    return;
                  }
                } else if (v === "dates" && activeTab === "configuration") {
                  if (!canProceedFromConfiguration()) {
                    validateConfiguration();
                    return;
                  }
                }
                setActiveTab(v);
              }}
            >
              <div className="border-b border-ui-border-base">
                <ProgressTabs.List>
                  <ProgressTabs.Trigger value="general">General</ProgressTabs.Trigger>
                  <ProgressTabs.Trigger value="configuration">Configuration</ProgressTabs.Trigger>
                  <ProgressTabs.Trigger value="dates">Priority & dates</ProgressTabs.Trigger>
                  <ProgressTabs.Trigger value="summary">Summary</ProgressTabs.Trigger>
                </ProgressTabs.List>
              </div>

              <div className="mt-6">
                {/* Step 1: General */}
                <ProgressTabs.Content value="general">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl space-y-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            setValidationErrors((e) => ({ ...e, name: undefined }));
                          }}
                          placeholder="e.g. Global default"
                          className="mt-2"
                        />
                        {validationErrors.name && (
                          <Text size="small" className="text-ui-fg-error mt-1">
                            {validationErrors.name}
                          </Text>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Optional description"
                          className="mt-2"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="scope">Scope *</Label>
                        <Select
                          value={formData.scope}
                          onValueChange={(value: "global" | "resource") => {
                            setFormData({
                              ...formData,
                              scope: value,
                              booking_resource_ids:
                                value === "global" ? [] : formData.booking_resource_ids,
                            });
                            setValidationErrors((e) => ({
                              ...e,
                              scope: undefined,
                              resource: undefined,
                            }));
                          }}
                        >
                          <Select.Trigger id="scope" className="mt-2">
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="global">Global</Select.Item>
                            <Select.Item value="resource">Resource</Select.Item>
                          </Select.Content>
                        </Select>
                        <Text size="small" className="text-ui-fg-subtle mt-1">
                          Global applies to all resources; Resource applies to a specific one.
                        </Text>
                      </div>

                      {formData.scope === "resource" && (
                        <div>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <Label htmlFor="resource">Resources *</Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={selectAllResources}
                                disabled={loadingResources || resources.length === 0}
                              >
                                Select all
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                onClick={clearAllResources}
                                disabled={loadingResources || selectedIds.size === 0}
                              >
                                Clear all
                              </Button>
                            </div>
                          </div>
                          {loadingResources ? (
                            <div className="flex items-center gap-2 mt-2 text-ui-fg-subtle">
                              <Spinner className="animate-spin" />
                              <Text size="small">Loading resources…</Text>
                            </div>
                          ) : (
                            <>
                              <div
                                id="resource"
                                className="mt-2 max-h-48 overflow-y-auto rounded-md border border-ui-border-base p-2 space-y-2"
                              >
                                {resources.length === 0 ? (
                                  <Text size="small" className="text-ui-fg-subtle">
                                    No resources available.
                                  </Text>
                                ) : (
                                  resources.map((r) => (
                                    <label
                                      key={r.id}
                                      className="flex items-center gap-2 cursor-pointer hover:bg-ui-bg-subtle-hover rounded px-2 py-1.5"
                                    >
                                      <Checkbox
                                        checked={selectedIds.has(r.id)}
                                        onCheckedChange={() => toggleResource(r.id)}
                                      />
                                      <Text size="small">{r.title ?? r.id}</Text>
                                    </label>
                                  ))
                                )}
                              </div>
                              <Text size="small" className="text-ui-fg-subtle mt-1">
                                {selectedIds.size} resource{selectedIds.size !== 1 ? "s" : ""} selected
                              </Text>
                              {validationErrors.resource && (
                                <Text size="small" className="text-ui-fg-error mt-1">
                                  {validationErrors.resource}
                                </Text>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ProgressTabs.Content>

                {/* Step 2: Configuration */}
                <ProgressTabs.Content value="configuration">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require_payment">Require payment</Label>
                        <Switch
                          id="require_payment"
                          checked={formData.require_payment}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, require_payment: !!checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="require_confirmation">Require confirmation</Label>
                        <Switch
                          id="require_confirmation"
                          checked={formData.require_confirmation}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, require_confirmation: !!checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="is_active">Active</Label>
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_active: !!checked })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="reservation_ttl_seconds">Reservation TTL (seconds)</Label>
                        <Input
                          id="reservation_ttl_seconds"
                          type="number"
                          min={1}
                          value={formData.reservation_ttl_seconds}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reservation_ttl_seconds: parseInt(e.target.value, 10) || 300,
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom_config">Custom configuration (JSON)</Label>
                        <Textarea
                          id="custom_config"
                          value={formData.custom_config_json}
                          onChange={(e) => {
                            setFormData({ ...formData, custom_config_json: e.target.value });
                            setValidationErrors((e) => ({ ...e, custom_config: undefined }));
                          }}
                          placeholder='{"key": "value"}'
                          className="mt-2 font-mono text-xs"
                          rows={4}
                        />
                        {validationErrors.custom_config && (
                          <Text size="small" className="text-ui-fg-error mt-1">
                            {validationErrors.custom_config}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                </ProgressTabs.Content>

                {/* Step 3: Priority & dates */}
                <ProgressTabs.Content value="dates">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl space-y-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valid_from">Valid from</Label>
                        <Input
                          id="valid_from"
                          type="datetime-local"
                          value={formData.valid_from}
                          onChange={(e) =>
                            setFormData({ ...formData, valid_from: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valid_until">Valid until</Label>
                        <Input
                          id="valid_until"
                          type="datetime-local"
                          value={formData.valid_until}
                          onChange={(e) =>
                            setFormData({ ...formData, valid_until: e.target.value })
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                </ProgressTabs.Content>

                {/* Step 4: Summary */}
                <ProgressTabs.Content value="summary">
                  <div className="flex justify-center">
                    <div className="w-full max-w-2xl space-y-6">
                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          General
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md space-y-1">
                          <Text size="small">
                            <strong>Name:</strong> {formData.name || "—"}
                          </Text>
                          <Text size="small">
                            <strong>Description:</strong>{" "}
                            {formData.description.trim() || "—"}
                          </Text>
                          <Text size="small">
                            <strong>Scope:</strong> {formData.scope}
                          </Text>
                          {formData.scope === "resource" && (
                            <Text size="small">
                              <strong>Resources:</strong>{" "}
                              {formData.booking_resource_ids?.length ?? 0} selected
                            </Text>
                          )}
                        </div>
                      </div>
                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          Configuration
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md space-y-1">
                          <Text size="small">
                            <strong>Require payment:</strong>{" "}
                            {formData.require_payment ? "Yes" : "No"}
                          </Text>
                          <Text size="small">
                            <strong>Require confirmation:</strong>{" "}
                            {formData.require_confirmation ? "Yes" : "No"}
                          </Text>
                          <Text size="small">
                            <strong>Active:</strong> {formData.is_active ? "Yes" : "No"}
                          </Text>
                          <Text size="small">
                            <strong>Reservation TTL (s):</strong>{" "}
                            {formData.reservation_ttl_seconds}
                          </Text>
                          {formData.custom_config_json.trim() && (
                            <Text size="small">
                              <strong>Custom config:</strong>{" "}
                              <pre className="mt-1 text-xs overflow-auto max-h-24">
                                {formData.custom_config_json}
                              </pre>
                            </Text>
                          )}
                        </div>
                      </div>
                      <div>
                        <Text size="small" className="font-medium text-ui-fg-subtle mb-2">
                          Priority & dates
                        </Text>
                        <div className="p-4 bg-ui-bg-subtle rounded-md space-y-1">
                          <Text size="small">
                            <strong>Priority:</strong> {formData.priority}
                          </Text>
                          <Text size="small">
                            <strong>Valid from:</strong> {formatDateTime(formData.valid_from)}
                          </Text>
                          <Text size="small">
                            <strong>Valid until:</strong> {formatDateTime(formData.valid_until)}
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
            {activeTab === "summary" ? (
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                Create rule
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (activeTab === "general" && !canProceedFromGeneral()) ||
                  (activeTab === "configuration" && !canProceedFromConfiguration())
                }
              >
                Next
              </Button>
            )}
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  );
};
