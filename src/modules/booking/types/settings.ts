export type SettingsScope = "global" | "resource" | "booking"

export interface ResolvedSettings {
  // Payment
  require_payment: boolean
  
  // Reservation
  reservation_ttl_seconds: number
  
  // Confirmation
  require_confirmation: boolean
  
  // Extension
  custom_config: Record<string, any> | null
  
  // Metadata
  _resolved_from: SettingsScope[]
  _priority: number
}

export interface SettingsResolutionContext {
  bookingResourceId?: string
  bookingId?: string
  evaluationTime?: Date
}

export const DEFAULT_SETTINGS: ResolvedSettings = {
  require_payment: true,
  
  reservation_ttl_seconds: 3600,
  
  require_confirmation: false,
  
  custom_config: null,
  
  _resolved_from: [],
  _priority: -1
}