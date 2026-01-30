# Custom API Routes

An API Route is a REST API endpoint.

An API Route is created in a TypeScript or JavaScript file under the `/src/api` directory of your Medusa application. The file’s name must be `route.ts` or `route.js`.

> Learn more about API Routes in [this documentation](https://docs.medusajs.com/learn/fundamentals/api-routes)

For example, to create a `GET` API Route at `/store/hello-world`, create the file `src/api/store/hello-world/route.ts` with the following content:

```ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({
    message: "Hello world!",
  });
}
```

## Supported HTTP methods

The file based routing supports the following HTTP methods:

- GET
- POST
- PUT
- PATCH
- DELETE
- OPTIONS
- HEAD

You can define a handler for each of these methods by exporting a function with the name of the method in the paths `route.ts` file.

For example:

```ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  // Handle GET requests
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // Handle POST requests
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  // Handle PUT requests
}
```

## Parameters

To create an API route that accepts a path parameter, create a directory within the route's path whose name is of the format `[param]`.

For example, if you want to define a route that takes a `productId` parameter, you can do so by creating a file called `/api/products/[productId]/route.ts`:

```ts
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { productId } = req.params;

  res.json({
    message: `You're looking for product ${productId}`
  })
}
```

To create an API route that accepts multiple path parameters, create within the file's path multiple directories whose names are of the format `[param]`.

For example, if you want to define a route that takes both a `productId` and a `variantId` parameter, you can do so by creating a file called `/api/products/[productId]/variants/[variantId]/route.ts`.

## Using the container

The Medusa container is available on `req.scope`. Use it to access modules' main services and other registered resources:

```ts
import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const productModuleService = req.scope.resolve("product")

  const [, count] = await productModuleService.listAndCount()

  res.json({
    count,
  })
}
```

## Middleware

You can apply middleware to your routes by creating a file called `/api/middlewares.ts`. This file must export a configuration object with what middleware you want to apply to which routes.

For example, if you want to apply a custom middleware function to the `/store/custom` route, you can do so by adding the following to your `/api/middlewares.ts` file:

```ts
import { defineMiddlewares } from "@medusajs/framework/http"
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http";

async function logger(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  console.log("Request received");
  next();
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom",
      middlewares: [logger],
    },
  ],
})
```

The `matcher` property can be either a string or a regular expression. The `middlewares` property accepts an array of middleware functions.

## Available API Endpoints

This application provides custom API endpoints for booking management. All endpoints are organized into two main groups: **Store APIs** (public-facing) and **Admin APIs** (administrative).

### Store APIs

Store APIs are public-facing endpoints that don't require authentication (as indicated by `AUTHENTICATE = false`).

#### Booking Carts

- **POST** `/store/booking-carts`
  - Create a new booking cart
  - Body: `CreateCartWorkflowInput`
  - Returns: Created cart result

- **GET** `/store/booking-carts/[id]`
  - Retrieve a booking cart with its booking line items
  - Returns: Cart and booking line items

- **POST** `/store/booking-carts/[id]`
  - Update booking cart customer information
  - Body: `{ customer_email?: string, customer_address?: CreateAddressDTO }`
  - Returns: Updated cart

- **POST** `/store/booking-carts/[id]/complete`
  - Complete a booking cart (creates order and bookings)
  - Returns: Completion result

- **POST** `/store/booking-carts/[id]/items`
  - Add a booking item to the cart
  - Body: `{ booking_resource_id: string, start_date: Date, end_date: Date }`
  - Returns: Booking cart item and resource allocation

- **DELETE** `/store/booking-carts/[id]/items/[itemId]`
  - Remove a booking item from the cart
  - Returns: Empty response

#### Booking Resources

- **GET** `/store/booking-resources`
  - List all available booking resources with product information
  - Returns: Array of booking resources with product details and pricing

- **GET** `/store/booking-resources/[id]`
  - Get a specific booking resource with product information
  - Returns: Booking resource with product details and pricing

- **GET** `/store/booking-resources/[id]/availability`
  - Get booking resource availability information
  - Query params: `startDate?`, `endDate?`
  - Returns: Booking resource and product details

- **POST** `/store/booking-resources/[id]/hold`
  - Hold a booking resource for a time period
  - Body: `{ startDate: Date, endDate: Date }`
  - Returns: Hold result

### Admin APIs

Admin APIs are administrative endpoints that require authentication.

#### Bookings

- **GET** `/admin/bookings`
  - List all bookings with pagination
  - Query params: `skip?` (default: 0), `take?` (default: 15)
  - Returns: Bookings with associated orders and line items, count, offset, limit

- **POST** `/admin/bookings`
  - Create a new booking
  - Body: `{ customer: { email, shippingAddress, billingAddress }, bookingResource: { id, startDate, endDate }, context: { unit } }`
  - Returns: Created booking result

- **GET** `/admin/bookings/[id]`
  - Get a specific booking with full details
  - Returns: Booking with order and line items

- **POST** `/admin/bookings/[id]/cancel`
  - Cancel a booking
  - Returns: Cancellation result

- **GET** `/admin/bookings/stats`
  - Get booking statistics
  - Query params: `type?` ("active" | "upcoming" | "past" | "pending")
  - Returns: Statistics with counts and differences

#### Booking Resources

- **GET** `/admin/booking-resources`
  - List all booking resources
  - Returns: Array of booking resources and count

- **POST** `/admin/booking-resources`
  - Create a new booking resource
  - Body: `{ booking_resource, booking_resource_availablity_rules, booking_resource_pricing }`
  - Returns: Created booking resource result

- **GET** `/admin/booking-resources/[id]`
  - Get a specific booking resource with full details
  - Returns: Booking resource with availability rules and pricing configs

- **POST** `/admin/booking-resources/[id]`
  - Update a booking resource
  - Body: `{ booking_resource, booking_resource_product_details? }`
  - Returns: Updated booking resource

- **DELETE** `/admin/booking-resources/[id]`
  - Delete a booking resource
  - Returns: Deletion result

- **GET** `/admin/booking-resources/[id]/availability`
  - Get booking resource availability for a date range
  - Query params: `from` (Date), `to` (Date), `view?` ("month" | "week" | "day" | "agenda", default: "month")
  - Returns: Booking resource and availability array

- **POST** `/admin/booking-resources/[id]/status`
  - Update booking resource status (published/draft)
  - Body: `{ status: "published" | "draft" }`
  - Returns: Updated booking resource

#### Booking Resource Allocations

- **DELETE** `/admin/booking-resources/[id]/allocations/[allocationId]`
  - Delete a booking resource allocation
  - Returns: Empty response

#### Booking Resource Availability Rules

- **GET** `/admin/booking-resources/[id]/availability-rules`
  - List availability rules for a booking resource
  - Returns: Array of availability rules

- **POST** `/admin/booking-resources/[id]/availability-rules`
  - Create an availability rule for a booking resource
  - Body: Availability rule data (without id)
  - Returns: Created availability rule

- **GET** `/admin/booking-resources/[id]/availability-rules/[availabilityRuleId]`
  - Get a specific availability rule
  - Returns: Availability rule

- **POST** `/admin/booking-resources/[id]/availability-rules/[availabilityRuleId]`
  - Update an availability rule
  - Body: `{ bookingResourceAvailabilityRule }`
  - Returns: Updated availability rule

- **DELETE** `/admin/booking-resources/[id]/availability-rules/[availabilityRuleId]`
  - Delete an availability rule
  - Returns: Empty response

#### Booking Resource Pricing

- **POST** `/admin/booking-resources/[id]/pricing`
  - Create a pricing configuration for a booking resource
  - Body: `{ booking_resource_pricing_config, booking_resource_pricing }`
  - Returns: Booking resource with updated pricing configs

- **DELETE** `/admin/booking-resources/[id]/pricing`
  - Delete pricing configuration (deletes the booking resource)
  - Returns: Deletion result

- **POST** `/admin/booking-resources/[id]/pricing/[priceConfigId]`
  - Update a pricing configuration
  - Body: `{ config, pricing }`
  - Returns: Updated pricing result

- **DELETE** `/admin/booking-resources/[id]/pricing/[priceConfigId]`
  - Delete a specific pricing configuration
  - Returns: Empty response

## API Documentation

For detailed API documentation including request/response schemas, see the [Swagger/OpenAPI specification](./swagger.yaml).
