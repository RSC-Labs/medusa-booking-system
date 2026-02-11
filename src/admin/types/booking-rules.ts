export type BookingRuleDTO = {
  id: string;
  name: string;
  description: string | null;
  scope: "global" | "resource";
  booking_resource_ids: string[] | null;
  require_payment: boolean;
  require_confirmation: boolean;
  reservation_ttl_seconds: number;
  configuration: Record<string, unknown> | null;
  priority: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at?: string;
  updated_at?: string;
};

export type GetBookingRulesDTO = {
  booking_rules: BookingRuleDTO[];
  /** Total count of booking resources (for "affected resources" when scope is global). */
  booking_resources_count?: number;
};

export type ResolvedRulesDTO = {
  require_payment: boolean;
  reservation_ttl_seconds: number;
  require_confirmation: boolean;
  custom_config: Record<string, unknown> | null;
  _resolved_from: string[];
  _priority: number;
};
