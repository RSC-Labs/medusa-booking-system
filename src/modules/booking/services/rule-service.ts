import {
  ResolvedRules,
  RulesResolutionContext,
  DEFAULT_RULES,
  RulesScope,
} from "../types/rules";
import { BookingRuleType } from "../types/booking";

/**
 * Fetches rules that apply to the given context:
 * - Global: scope === "global" (apply to all resources).
 * - Resource: scope === "resource" AND booking_resource_id === context.bookingResourceId.
 * Model only supports "global" and "resource" (no "booking" scope).
 * Filters by is_active and valid_from/valid_until date range.
 */
export function filterApplicableRules(
  rules: BookingRuleType[],
  context: RulesResolutionContext,
): BookingRuleType[] {
  const now = context.evaluationTime
    ? new Date(context.evaluationTime)
    : new Date();

  return rules.filter((rule) => {
    if (!rule.is_active) return false;
    if (rule.valid_from && new Date(rule.valid_from) > now) return false;
    if (rule.valid_until && new Date(rule.valid_until) < now) return false;

    // Global: always applicable
    if (rule.scope === "global") return true;

    // Resource: only when bookingResourceId matches
    if (rule.scope === "resource") {
      return (
        !!context.bookingResourceId &&
        rule.booking_resource_ids?.some((id) => id === context.bookingResourceId)
      );
    }

    return false;
  });
}

/**
 * Merges applicable rules into a single ResolvedRules.
 * Order: global first, then resource-specific; within each group, ascending priority.
 * Later entries override earlier (higher priority overwrites). Resource overrides global.
 */
function mergeRules(applicable: BookingRuleType[]): ResolvedRules {
  // Sort: global (0) before resource (1), then by priority ascending so higher priority overwrites
  const sorted = [...applicable].sort((a, b) => {
    const scopeOrder = (s: BookingRuleType) => (s.scope === "global" ? 0 : 1);
    if (scopeOrder(a) !== scopeOrder(b)) return scopeOrder(a) - scopeOrder(b);
    return a.priority - b.priority;
  });

  const resolvedFrom: RulesScope[] = [];
  let maxPriority = DEFAULT_RULES._priority;

  let result: ResolvedRules = {
    ...DEFAULT_RULES,
    _resolved_from: resolvedFrom,
    _priority: maxPriority,
  };

  for (const s of sorted) {
    resolvedFrom.push(s.scope);
    if (s.priority > maxPriority) maxPriority = s.priority;

    result = {
      require_payment: s.require_payment,
      reservation_ttl_seconds: s.reservation_ttl_seconds,
      require_confirmation: s.require_confirmation,
      custom_config: s.configuration ?? result.custom_config,
      _resolved_from: [...resolvedFrom],
      _priority: maxPriority,
    };
  }

  result._resolved_from = resolvedFrom;
  result._priority = maxPriority;
  return result;
}

/**
 * Resolves a list of raw booking rules for the given context.
 * 1) Filters to applicable rules (global + optional resource for bookingResourceId).
 * 2) Merges by priority (global then resource; higher priority overrides).
 * If no applicable rules, returns DEFAULT_RULES.
 */
export function resolveRules(
  rules: BookingRuleType[],
  context: RulesResolutionContext,
): ResolvedRules {
  const applicable = filterApplicableRules(rules, context);
  if (applicable.length === 0) return { ...DEFAULT_RULES };
  return mergeRules(applicable);
}
