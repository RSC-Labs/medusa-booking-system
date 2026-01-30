# Medusa Booking System

A comprehensive booking system plugin for MedusaJS that enables you to define resources, configure availability rules, set up pricing, and manage bookings through both admin and storefront interfaces.

## Introduction

The Medusa Booking System Plugin extends your Medusa e-commerce platform with powerful booking capabilities. Whether you're managing hotel rooms, equipment rentals, appointment scheduling, or any time-based resource, this plugin provides the tools you need to:

- **Define Resources**: Create bookable resources with custom types and configurations
- **Configure Availability**: Set up flexible availability rules with priority-based scheduling
- **Manage Pricing**: Configure dynamic pricing based on dates, quantities, and custom rules
- **Handle Bookings**: Process bookings through carts, orders, and allocations
- **Admin Dashboard**: Manage all aspects of your booking system through an intuitive admin interface

## Features

### Core Capabilities

- **Resource Management**: Create and manage bookable resources with product integration
- **Availability Rules**: Define complex availability patterns with priority-based rule system
- **Pricing Configuration**: Set up flexible pricing models with multiple price points
- **Booking Workflows**: Complete booking flow from cart to order creation
- **Resource Allocations**: Track and manage time-based resource allocations
- **Status Management**: Control resource visibility with draft/published status
- **Admin Interface**: Full-featured admin dashboard for managing bookings and resources

### Resource Types

Resources can be configured with different types (e.g., "room", "equipment", "appointment") and support:

- Custom pricing units (hourly, daily, weekly, etc.)
- Bookable/non-bookable status
- Product integration for seamless e-commerce experience

### Availability System

The availability system supports:

- Multiple availability rules per resource
- Priority-based rule evaluation
- Available/unavailable effects
- Date range validity
- Custom rule configurations
- Active/inactive rule states

### Pricing System

Flexible pricing configuration:

- Multiple pricing configurations per resource
- Currency-based pricing
- Product variant integration

## Installation

### Prerequisites

- Node.js >= 20
- MedusaJS v2.7.0 or higher
- PostgreSQL database

### Step 1: Add the Package

Add the booking system plugin to your Medusa application:

```bash
npm install @rsc-labs/medusa-booking-system
```

Or if using yarn:

```bash
yarn add @rsc-labs/medusa-booking-system
```

### Step 2: Configure the Plugin

Add the plugin to your Medusa configuration. In your `medusa-config.ts` or `medusa-config.js`:

```typescript
import { defineConfig } from "@medusajs/framework";

export default defineConfig({
  // ... your existing config
  modules: [
    // ... your existing modules
    {
      resolve: "@rsc-labs/medusa-booking-system",
      options: {},
    },
  ],
});
```

### Step 3: Generate Migrations

Generate the database migrations for the booking module:

```bash
npx medusa db:generate bookingModule
```

### Step 4: Run Migrations

Apply the migrations to your database:

```bash
npx medusa db:migrate
```

## API Reference

The plugin provides two sets of API endpoints:

### Store APIs (Public)

Public-facing endpoints for customers to browse and book resources.

#### Booking Resources

- `GET /store/booking-resources` - List all available booking resources
- `GET /store/booking-resources/[id]` - Get a specific booking resource
- `GET /store/booking-resources/[id]/availability` - Get availability information
- `POST /store/booking-resources/[id]/hold` - Hold a resource for a time period

#### Booking Carts

- `POST /store/booking-carts` - Create a new booking cart
- `GET /store/booking-carts/[id]` - Get cart with booking line items
- `POST /store/booking-carts/[id]` - Update cart customer information
- `POST /store/booking-carts/[id]/items` - Add booking item to cart
- `DELETE /store/booking-carts/[id]/items/[itemId]` - Remove item from cart
- `POST /store/booking-carts/[id]/complete` - Complete booking cart (creates order)

### Admin APIs (Authenticated)

Administrative endpoints for managing the booking system.

#### Booking Resources

- `GET /admin/booking-resources` - List all booking resources
- `POST /admin/booking-resources` - Create a new booking resource
- `GET /admin/booking-resources/[id]` - Get booking resource details
- `POST /admin/booking-resources/[id]` - Update booking resource
- `DELETE /admin/booking-resources/[id]` - Delete booking resource
- `GET /admin/booking-resources/[id]/availability` - Get availability for date range
- `POST /admin/booking-resources/[id]/status` - Update resource status (published/draft)

#### Availability Rules

- `GET /admin/booking-resources/[id]/availability-rules` - List availability rules
- `POST /admin/booking-resources/[id]/availability-rules` - Create availability rule
- `GET /admin/booking-resources/[id]/availability-rules/[ruleId]` - Get specific rule
- `POST /admin/booking-resources/[id]/availability-rules/[ruleId]` - Update rule
- `DELETE /admin/booking-resources/[id]/availability-rules/[ruleId]` - Delete rule

#### Pricing

- `POST /admin/booking-resources/[id]/pricing` - Create pricing configuration
- `POST /admin/booking-resources/[id]/pricing/[priceConfigId]` - Update pricing
- `DELETE /admin/booking-resources/[id]/pricing/[priceConfigId]` - Delete pricing

#### Bookings

- `GET /admin/bookings` - List all bookings
- `POST /admin/bookings` - Create a booking
- `GET /admin/bookings/[id]` - Get booking details
- `POST /admin/bookings/[id]/cancel` - Cancel a booking
- `GET /admin/bookings/stats` - Get booking statistics

For detailed API documentation including request/response schemas, see the [Swagger/OpenAPI specification](./src/api/swagger.yaml).

## Complete Scenario Walkthrough

This example demonstrates the complete flow from creating a resource to booking it on the storefront.

### Step 1: Create a Booking Resource

Create a new bookable resource (e.g., a conference room):

```bash
curl -X POST http://localhost:9000/admin/booking-resources \
  -H "Content-Type: application/json" \
  -d '{
    "booking_resource": {
      "resource_type": "conference_room",
      "title": "Executive Conference Room",
      "subtitle": "Capacity: 20 people",
      "description": "A spacious conference room with AV equipment",
      "is_bookable": true,
      "pricing_unit": "hour",
      "pricing_unit_value": 1
    }
  }'
```

Response includes the created resource with an ID (e.g., `br_01HXXX...`).

### Step 2: Create Availability Rules

Set up when the resource is available:

```bash
curl -X POST http://localhost:9000/admin/booking-resources/br_01HXXX.../availability-rules \
  -H "Content-Type: application/json" \
  -d '{
    "rule_type": "weekly",
    "name": "Business Hours",
    "effect": "available",
    "priority": 1,
    "configuration": {
      "days": [1, 2, 3, 4, 5], // Monday to Friday
      "start_time": "09:00",
      "end_time": "17:00"
    },
    "is_active": true
  }'
```

### Step 3: Create Pricing Configuration

Set up pricing for the resource:

```bash
curl -X POST http://localhost:9000/admin/booking-resources/br_01HXXX.../pricing \
  -H "Content-Type: application/json" \
  -d '{
    "booking_resource_pricing_config": {
      "name": "Standard Hourly Rate"
    },
    "booking_resource_pricing": [
      {
        "currency_code": "usd",
        "amount": 5000, // $50.00 per hour
        "min_quantity": 1,
        "max_quantity": 1
      }
    ]
  }'
```

### Step 4: Publish the Resource

Make the resource available on the storefront:

```bash
curl -X POST http://localhost:9000/admin/booking-resources/br_01HXXX.../status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'
```

### Step 5: Check Availability (Storefront)

Customers can check availability:

```bash
curl "http://localhost:9000/store/booking-resources/br_01HXXX.../availability?startDate=2026-02-15&endDate=2026-02-20"
```

### Step 6: Create Booking Cart (Storefront)

Customer creates a booking cart:

```bash
curl -X POST http://localhost:9000/store/booking-carts \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": "reg_xxx"
  }'
```

### Step 7: Add Booking to Cart (Storefront)

Customer adds the booking to their cart:

```bash
curl -X POST http://localhost:9000/store/booking-carts/[cartId]/items \
  -H "Content-Type: application/json" \
  -d '{
    "booking_resource_id": "br_01HXXX...",
    "start_date": "2026-02-15T10:00:00Z",
    "end_date": "2026-02-15T14:00:00Z"
  }'
```

This creates a temporary allocation (hold) on the resource.

### Step 8: Complete Booking (Storefront)

Customer completes the booking, which creates an order and confirms the booking:

```bash
curl -X POST http://localhost:9000/store/booking-carts/[cartId]/complete
```

The booking is now confirmed, and the resource allocation is finalized.

## License

MIT

## Author

RSC Labs (https://rsoftcon.com)

## Repository

https://github.com/RSC-Labs/medusa-booking-system
