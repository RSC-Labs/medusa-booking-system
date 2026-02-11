export type RulesScope = "global" | "resource" | "booking"

export interface ResolvedRules {
  // Payment
  require_payment: boolean
  
  // Reservation
  reservation_ttl_seconds: number
  
  // Confirmation
  require_confirmation: boolean
  
  // Extension
  custom_config: Record<string, any> | null
  
  // Metadata
  _resolved_from: RulesScope[]
  _priority: number
}

export interface RulesResolutionContext {
  bookingResourceId?: string
  bookingId?: string
  evaluationTime?: Date
}

export const DEFAULT_RULES: ResolvedRules = {
  require_payment: true,
  
  reservation_ttl_seconds: 3600,
  
  require_confirmation: false,
  
  custom_config: null,
  
  _resolved_from: [],
  _priority: -1
}