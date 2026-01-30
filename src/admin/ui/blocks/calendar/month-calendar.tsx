"use client"

import { useMemo } from "react";
import { format, isSameMonth } from "date-fns"
import { Calendar } from "lucide-react"
import { BookingAvailabilityDTO } from "../../../types/booking-availability"
import { MonthCalendarCore } from "./month-calendar-core"

// --- Types ---

interface MonthCalendarProps {
  availability: BookingAvailabilityDTO[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onDayClick?: (date: Date, dayData?: BookingAvailabilityDTO) => void;
}

export function MonthCalendar({ availability = [], date, onDateChange, onDayClick }: MonthCalendarProps) {
  const currentDate = date ?? new Date()

  // Stats for the current view
  const stats = useMemo(() => {
    const monthData = availability.filter((a) => {
      const d = new Date(a.date);
      return isSameMonth(d, currentDate);
    });
    
    const availableCount = monthData.filter(a => a.is_available).length;
    const totalBookings = monthData.reduce((sum, a) => sum + (a.layers?.filter(layer => layer.source_type === 'allocation').length || 0), 0);
    const fullyBookedCount = monthData.filter(a => !a.is_available && (a.layers?.filter(layer => layer.source_type === 'allocation').length || 0) > 0).length;

    return { availableCount, totalBookings, fullyBookedCount };
  }, [availability, currentDate]);

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Monthly Overview</p>
            <p className="text-2xl font-bold">{format(currentDate, "MMMM yyyy")}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Available Days</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.availableCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalBookings}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fully Booked</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.fullyBookedCount}</p>
          </div>
        </div>
      </div>

      {/* Use core calendar component */}
      <MonthCalendarCore
        availability={availability}
        date={date}
        onDateChange={onDateChange}
        onDayClick={onDayClick}
        showHeader={true}
        showLegend={true}
      />
    </div>
  )
}