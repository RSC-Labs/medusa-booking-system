"use client"

import { useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BookingAvailabilityDTO } from "../../../types/booking-availability"
import { Button } from "@medusajs/ui"

// --- Types ---

export interface MonthCalendarCoreProps {
  availability?: BookingAvailabilityDTO[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onDayClick?: (date: Date, dayData?: BookingAvailabilityDTO) => void;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  renderDayContent?: (day: Date, dayData?: BookingAvailabilityDTO, isSelected?: boolean, isInRange?: boolean) => React.ReactNode;
  isDayDisabled?: (day: Date, dayData?: BookingAvailabilityDTO) => boolean;
  showHeader?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function MonthCalendarCore({ 
  availability = [], 
  date, 
  onDateChange, 
  onDayClick,
  selectedStartDate,
  selectedEndDate,
  renderDayContent,
  isDayDisabled,
  showHeader = true,
  showLegend = true,
  className = "",
}: MonthCalendarCoreProps) {
  const currentDate = date ?? new Date()
  
  // Filter availability to only include days in the current month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  
  const availabilityMap = useMemo(() => {
    const map = new Map<string, BookingAvailabilityDTO>();
    availability.forEach((a) => {
      const aDate = new Date(a.date);
      // Only include availability data for days in the current month
      if (isSameMonth(aDate, currentDate)) {
        const dateStr = format(aDate, "yyyy-MM-dd");
        map.set(dateStr, a);
      }
    });
    return map;
  }, [availability, currentDate]);

  // Calendar Navigation
  const nextMonth = () => {
    const newDate = addMonths(currentDate, 1)
    onDateChange?.(newDate)
  }
  
  const prevMonth = () => {
    const newDate = subMonths(currentDate, 1)
    onDateChange?.(newDate)
  }

  // Calendar Grid Calculation
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  // Helper to check if a day is in the selected range
  const isDayInRange = (day: Date): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false
    return isWithinInterval(day, {
      start: selectedStartDate,
      end: selectedEndDate,
    })
  }

  // Helper to check if a day is selected (start or end)
  const isDaySelected = (day: Date): boolean => {
    if (!selectedStartDate && !selectedEndDate) return false
    if (selectedStartDate && isSameDay(day, selectedStartDate)) return true
    if (selectedEndDate && isSameDay(day, selectedEndDate)) return true
    return false
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Calendar Container */}
      <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Calendar Header */}
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex items-center gap-1">
              <Button variant="transparent" size="small" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="transparent" size="small" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Days Header */}
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            // Only get availability data for days in the current month
            const dayData = isCurrentMonth ? availabilityMap.get(format(day, "yyyy-MM-dd")) : undefined;
            const isSelected = isDaySelected(day)
            const isInRange = isDayInRange(day)
            const isDisabled = isDayDisabled ? isDayDisabled(day, dayData) : false
            
            // Determine status and styling (for viewing mode) - only for current month
            const holds = isCurrentMonth && dayData?.layers?.filter(l => l.source_type === 'allocation' && l.metadata?.allocation_type === 'hold');
            const bookings = isCurrentMonth && dayData?.layers?.filter(l => l.source_type === 'allocation' && l.metadata?.allocation_type === 'booked');
            const hasHolds = holds && holds.length > 0;
            const hasBookings = bookings && bookings.length > 0;
            const isAvailable = isCurrentMonth ? dayData?.is_available : undefined;
            
            let statusBg = "";
            let statusText = "";
            let statusLabel = "";

            if (hasHolds) {
              statusBg = "bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30";
              statusText = "text-orange-700 dark:text-orange-400";
              statusLabel = "On hold";
            } else if (hasBookings) {
              statusBg = "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30";
              statusText = "text-amber-700 dark:text-amber-400";
              statusLabel = "Booked";
            } else if (isAvailable) {
              statusBg = "bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30";
              statusText = "text-green-700 dark:text-green-400";
              statusLabel = "Available";
            } else if (dayData) {
              statusBg = "bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30";
              statusText = "text-gray-600 dark:text-gray-400";
              statusLabel = "Unavailable";
            }

            // Range selection styling
            let rangeBg = "";
            if (isSelected) {
              rangeBg = "bg-primary text-primary-foreground";
            } else if (isInRange) {
              rangeBg = "bg-primary/20";
            }

            // Use custom render if provided, otherwise use default
            if (renderDayContent) {
              // Apply status colors, but overlay range selection on top
              // If selected, use primary color; if in range, use primary with opacity; otherwise use status color
              let finalBg = statusBg || ""
              if (isSelected) {
                finalBg = "bg-primary text-primary-foreground"
              } else if (isInRange) {
                // Keep status color but add range indicator
                finalBg = statusBg ? `${statusBg} bg-primary/20` : "bg-primary/20"
              }
              
              // If disabled, use disabled styling
              if (isDisabled) {
                finalBg = "bg-gray-100 dark:bg-gray-800 opacity-50"
              }
              
              return (
                <button
                  key={day.toString()}
                  onClick={() => !isDisabled && onDayClick?.(day, dayData)}
                  disabled={!isCurrentMonth || isDisabled}
                  className={`
                    min-h-[100px] p-2 border-b border-r relative transition-all flex flex-col gap-1 text-left
                    ${!isCurrentMonth || isDisabled ? "bg-muted/20 text-muted-foreground cursor-not-allowed opacity-50" : `${finalBg} cursor-pointer`}
                    ${isToday && !isDisabled ? "ring-2 ring-primary ring-inset" : ""}
                  `}
                >
                  {renderDayContent(day, dayData, isSelected, isInRange)}
                </button>
              )
            }
            
            // Default rendering (for viewing mode)
            const isDisabledDefault = isDayDisabled ? isDayDisabled(day, dayData) : false
            
            return (
              <button
                key={day.toString()}
                onClick={() => !isDisabledDefault && onDayClick?.(day, dayData)}
                disabled={!isCurrentMonth || isDisabledDefault}
                className={`
                  min-h-[100px] p-2 border-b border-r relative transition-all flex flex-col gap-1 text-left
                  ${!isCurrentMonth || isDisabledDefault ? "bg-muted/20 text-muted-foreground cursor-not-allowed opacity-50" : `${statusBg} cursor-pointer`}
                  ${isToday && !isDisabledDefault ? "ring-2 ring-primary ring-inset" : ""}
                  ${rangeBg}
                `}
              >
                <span className={`text-sm font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : "ml-1"}`}>
                  {format(day, "d")}
                </span>
                
                {isCurrentMonth && statusLabel && (
                  <>
                    <div className={`text-[10px] font-semibold ${statusText} flex items-center gap-1`}>
                      {statusLabel === 'Available' && "✓"}
                      {(statusLabel === 'Booked' || statusLabel === 'On hold') && "●"}
                      {statusLabel === 'Unavailable' && "✕"}
                      <span>{statusLabel}</span>
                    </div>
                    
                    {hasHolds && holds.map((hold, index) => (
                      hold.metadata?.allocation_expires_at && (
                        <div key={`hold-${index}`} className="text-[10px] text-orange-700 dark:text-orange-400">
                          Expires at {format(new Date(hold.metadata.allocation_expires_at), 'p')}
                        </div>
                      )
                    ))}
                    
                    {hasBookings && (
                      <div className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                        {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                      </div>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950/30 border"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-950/30 border"></div>
            <span>On hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-950/30 border"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-900/30 border"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-primary"></div>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  )
}
