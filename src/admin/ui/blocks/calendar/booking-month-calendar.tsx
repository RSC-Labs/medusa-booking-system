"use client"

import { useState, useMemo } from "react";
import { format, isSameDay, startOfDay, isBefore, isSameMonth, startOfMonth } from "date-fns"
import { MonthCalendarCore } from "./month-calendar-core"
import { BookingAvailabilityDTO } from "../../../types/booking-availability"

export interface BookingMonthCalendarProps {
  availability?: BookingAvailabilityDTO[];
  date?: Date;
  onDateChange?: (date: Date) => void;
  onRangeSelect?: (startDate: Date | null, endDate: Date | null) => void;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
}

export function BookingMonthCalendar({ 
  availability = [], 
  date, 
  onDateChange,
  onRangeSelect,
  selectedStartDate: externalStartDate,
  selectedEndDate: externalEndDate,
}: BookingMonthCalendarProps) {
  const [internalStartDate, setInternalStartDate] = useState<Date | null>(null)
  const [internalEndDate, setInternalEndDate] = useState<Date | null>(null)

  // Use external dates if provided, otherwise use internal state
  const selectedStartDate = externalStartDate ?? internalStartDate
  const selectedEndDate = externalEndDate ?? internalEndDate

  // Create availability map for quick lookup - only for current month
  const currentMonth = date ? startOfMonth(date) : startOfMonth(new Date())
  const availabilityMap = useMemo(() => {
    const map = new Map<string, BookingAvailabilityDTO>();
    availability.forEach((a) => {
      const aDate = new Date(a.date);
      // Only include availability data for days in the current month
      if (isSameMonth(aDate, currentMonth)) {
        const dateStr = format(aDate, "yyyy-MM-dd");
        map.set(dateStr, a);
      }
    });
    return map;
  }, [availability, currentMonth]);

  const isDayDisabled = (day: Date, dayData?: BookingAvailabilityDTO): boolean => {
    // Only check availability for days in the current month
    const isCurrentMonth = isSameMonth(day, currentMonth)
    if (!isCurrentMonth) {
      return false // Don't disable days from other months based on availability
    }
    
    // If no dayData, check if we have availability data for this day
    if (!dayData) {
      const dateStr = format(day, "yyyy-MM-dd");
      dayData = availabilityMap.get(dateStr);
    }
    
    // Disable if explicitly marked as unavailable
    // Also disable if dayData exists but is_available is false
    if (dayData) {
      return dayData.is_available === false
    }
    
    // If no availability data, allow selection (might be outside availability range)
    return false
  }

  const handleDayClick = (day: Date) => {
    // Don't handle clicks on disabled days
    const dateStr = format(day, "yyyy-MM-dd");
    const dayData = availabilityMap.get(dateStr);
    if (isDayDisabled(day, dayData)) {
      return
    }
    
    const dayStart = startOfDay(day)
    
    // If no start date is selected, or both dates are selected, start fresh
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setInternalStartDate(dayStart)
      setInternalEndDate(null)
      onRangeSelect?.(dayStart, null)
      return
    }

    // If start date is selected but not end date
    if (selectedStartDate && !selectedEndDate) {
      // If clicked date is before start date, make it the new start date
      if (isBefore(dayStart, selectedStartDate)) {
        setInternalStartDate(dayStart)
        setInternalEndDate(selectedStartDate)
        onRangeSelect?.(dayStart, selectedStartDate)
      } else {
        // Otherwise, set it as end date
        setInternalEndDate(dayStart)
        onRangeSelect?.(selectedStartDate, dayStart)
      }
      return
    }
  }

  const renderDayContent = (day: Date, dayData?: BookingAvailabilityDTO, isSelected?: boolean, isInRange?: boolean) => {
    const isToday = isSameDay(day, new Date())
    
    // Get availability status
    const holds = dayData?.layers?.filter(l => l.source_type === 'allocation' && l.metadata?.allocation_type === 'hold');
    const bookings = dayData?.layers?.filter(l => l.source_type === 'allocation' && l.metadata?.allocation_type === 'booked');
    const hasHolds = holds && holds.length > 0;
    const hasBookings = bookings && bookings.length > 0;
    const isAvailable = dayData?.is_available;

    // Determine status label
    let statusLabel = "";
    let statusText = "";
    
    if (hasHolds) {
      statusLabel = "On hold";
      statusText = "text-orange-700 dark:text-orange-400";
    } else if (hasBookings) {
      statusLabel = "Booked";
      statusText = "text-amber-700 dark:text-amber-400";
    } else if (isAvailable) {
      statusLabel = "Available";
      statusText = "text-green-700 dark:text-green-400";
    } else if (dayData) {
      statusLabel = "Unavailable";
      statusText = "text-gray-600 dark:text-gray-400";
    }

    return (
      <>
        <span className={`text-sm font-medium ${isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : "ml-1"}`}>
          {format(day, "d")}
        </span>
        
        {statusLabel && (
          <div className={`text-[10px] font-semibold ${statusText} flex items-center gap-1`}>
            {statusLabel === 'Available' && "✓"}
            {(statusLabel === 'Booked' || statusLabel === 'On hold') && "●"}
            {statusLabel === 'Unavailable' && "✕"}
            <span>{statusLabel}</span>
          </div>
        )}
        
        {isSelected && (
          <div className={`text-[10px] font-semibold ${isSelected ? "text-primary-foreground" : ""}`}>
            {isSameDay(day, selectedStartDate) ? "Start" : "End"}
          </div>
        )}
        
        {isInRange && !isSelected && (
          <div className="text-[10px] text-primary/70">
            Selected
          </div>
        )}
      </>
    )
  }

  return (
    <MonthCalendarCore
      availability={availability}
      date={date}
      onDateChange={onDateChange}
      onDayClick={handleDayClick}
      selectedStartDate={selectedStartDate}
      selectedEndDate={selectedEndDate}
      renderDayContent={renderDayContent}
      isDayDisabled={isDayDisabled}
      showHeader={true}
      showLegend={false}
    />
  )
}
