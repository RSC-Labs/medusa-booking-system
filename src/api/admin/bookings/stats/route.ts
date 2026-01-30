import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import BookingModuleService from "../../../../modules/booking/service";
import { BOOKING_MODULE } from "../../../../modules/booking";

type BookingStatsResponse = {
  active?: {
    count: number;
    difference: number;
  };
  upcoming?: {
    count: number;
    difference: number;
  };
  past?: {
    count: number;
  };
  pending?: {
    count: number;
    difference: number;
  };
}

export async function GET (
  req: MedusaRequest,
  res: MedusaResponse<BookingStatsResponse>
) {
  const bookingModuleService: BookingModuleService = req.scope.resolve(
    BOOKING_MODULE
  );

  const now = new Date();
  const statsType = req.query.type as string | undefined;

  // Calculate date ranges for current month
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Calculate date ranges for last month
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const response: BookingStatsResponse = {};

  switch (statsType) {
    case "active": {
      // Filter for bookings that could be active (start_time <= current month end, end_time >= current month start)
      const [currentBookings] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $lte: currentMonthEnd,
        },
        end_time: {
          $gte: currentMonthStart,
        },
        status: {
          $nin: ["cancelled", "completed"],
        },
      });

      // Filter for last month active bookings
      const [lastMonthBookings] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $lte: lastMonthEnd,
        },
        end_time: {
          $gte: lastMonthStart,
        },
        status: {
          $nin: ["cancelled", "completed"],
        },
      });

      // Filter in memory for precise active bookings (currently happening)
      const activeBookings = currentBookings.filter(booking => {
        if (!booking.start_time || !booking.end_time) return false;
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        return startTime <= now && now <= endTime;
      });

      const lastMonthActiveBookings = lastMonthBookings.filter(booking => {
        if (!booking.start_time || !booking.end_time) return false;
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        return startTime <= lastMonthEnd && lastMonthEnd <= endTime;
      });

      response.active = {
        count: activeBookings.length,
        difference: activeBookings.length - lastMonthActiveBookings.length,
      };
      break;
    }

    case "upcoming": {
      // Filter for upcoming bookings (start_time > now)
      const [currentBookings] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: now,
        },
        status: {
          $nin: ["cancelled"],
        },
      });

      // Filter for last month upcoming bookings (what was upcoming at the end of last month)
      const [lastMonthBookings] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: lastMonthEnd,
        },
        status: {
          $nin: ["cancelled"],
        },
      });

      const upcomingCount = currentBookings.length;
      const lastMonthUpcomingCount = lastMonthBookings.length;

      response.upcoming = {
        count: upcomingCount,
        difference: upcomingCount - lastMonthUpcomingCount,
      };
      break;
    }

    case "past": {
      // Filter for past bookings (end_time < now or status = completed)
      // Limit to bookings that ended in the last 12 months for performance
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      
      const [pastBookings] = await bookingModuleService.listAndCountBookings({
        $or: [
          {
            end_time: {
              $lt: now,
              $gte: twelveMonthsAgo,
            },
          },
          {
            status: "completed",
            completed_at: {
              $gte: twelveMonthsAgo,
            },
          },
        ],
      });

      response.past = {
        count: pastBookings.length,
      };
      break;
    }

    case "pending": {
      // Filter for pending bookings (future bookings with pending status)
      const [currentBookings] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: now,
        },
        status: "pending",
      });

      // Filter for last month pending bookings (what was pending at the end of last month)
      const [lastMonthBookings] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: lastMonthEnd,
        },
        status: "pending",
      });

      const pendingCount = currentBookings.length;
      const lastMonthPendingCount = lastMonthBookings.length;

      response.pending = {
        count: pendingCount,
        difference: pendingCount - lastMonthPendingCount,
      };
      break;
    }

    default: {
      // If no type specified, return all stats (but still use filtered queries)
      // Active bookings
      const [activeCurrent] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $lte: currentMonthEnd,
        },
        end_time: {
          $gte: currentMonthStart,
        },
        status: {
          $nin: ["cancelled", "completed"],
        },
      });

      const [activeLastMonth] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $lte: lastMonthEnd,
        },
        end_time: {
          $gte: lastMonthStart,
        },
        status: {
          $nin: ["cancelled", "completed"],
        },
      });

      const activeBookings = activeCurrent.filter(booking => {
        if (!booking.start_time || !booking.end_time) return false;
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        return startTime <= now && now <= endTime;
      });

      const lastMonthActiveBookings = activeLastMonth.filter(booking => {
        if (!booking.start_time || !booking.end_time) return false;
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        return startTime <= lastMonthEnd && lastMonthEnd <= endTime;
      });

      // Upcoming bookings
      const [upcomingCurrent] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: now,
        },
        status: {
          $nin: ["cancelled"],
        },
      });

      const [upcomingLastMonth] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: lastMonthEnd,
        },
        status: {
          $nin: ["cancelled"],
        },
      });

      // Past bookings - limit to last 12 months for performance
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      const [pastCurrent] = await bookingModuleService.listAndCountBookings({
        $or: [
          {
            end_time: {
              $lt: now,
              $gte: twelveMonthsAgo,
            },
          },
          {
            status: "completed",
            completed_at: {
              $gte: twelveMonthsAgo,
            },
          },
        ],
      });

      // Pending bookings (future bookings with pending status)
      const [pendingCurrent] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: now,
        },
        status: "pending",
      });

      const [pendingLastMonth] = await bookingModuleService.listAndCountBookings({
        start_time: {
          $gt: lastMonthEnd,
        },
        status: "pending",
      });

      response.active = {
        count: activeBookings.length,
        difference: activeBookings.length - lastMonthActiveBookings.length,
      };

      response.upcoming = {
        count: upcomingCurrent.length,
        difference: upcomingCurrent.length - upcomingLastMonth.length,
      };

      response.past = {
        count: pastCurrent.length,
      };

      response.pending = {
        count: pendingCurrent.length,
        difference: pendingCurrent.length - pendingLastMonth.length,
      };
      break;
    }
  }

  res.json(response);
}

export const AUTHENTICATE = false
