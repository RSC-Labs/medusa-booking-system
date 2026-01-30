"use client"

import { Container, Heading, Text } from "@medusajs/ui"
import { Spinner } from "@medusajs/icons"
import { LucideIcon } from "lucide-react"

type StatCardProps = {
  label: string
  value: string | number
  change?: string | number
  icon: LucideIcon
  isLoading?: boolean
}

export const StatCard = ({ label, value, change, icon: Icon, isLoading }: StatCardProps) => {
  return (
    <Container className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-ui-fg-subtle text-sm font-medium">
            {label}
          </Text>
          <Heading level="h2" className="mt-2 text-2xl font-bold">
            {isLoading ? (
              <Spinner className="animate-spin h-5 w-5" />
            ) : (
              value
            )}
          </Heading>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg-base shadow-sm border border-ui-border-base">
          <Icon className="h-5 w-5 text-ui-fg-subtle" />
        </div>
      </div>
      {change !== undefined && !isLoading && (
        <div className="mt-4 flex items-center text-xs text-ui-fg-subtle">
          <span className={`font-medium ${
            typeof change === 'number' 
              ? change >= 0 
                ? 'text-ui-fg-interactive' 
                : 'text-red-500'
              : 'text-ui-fg-interactive'
          }`}>
            {typeof change === 'number' ? (change >= 0 ? '+' : '') : ''}{change}
          </span>
          <span className="ml-1">from last month</span>
        </div>
      )}
    </Container>
  )
}
