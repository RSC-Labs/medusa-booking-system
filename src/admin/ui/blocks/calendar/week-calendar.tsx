"use client"

import { useState, useMemo } from "react"
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, getDay, getHours, differenceInHours } from "date-fns"
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Clock, User, CheckCircle, AlertCircle, Ban } from "lucide-react"
import { Button } from "@medusajs/ui"
import { BookingAvailabilityDTO } from "../../../types/booking-availability";

// --- Mock Data for Week View ---
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8 AM to 6 PM

type WeekEvent = {
  id: number
  title: string
  dayOffset: number
  startHour: number
  duration: number
  color: string
  customer: string
  service: string
  status: string
  price: string
}

interface WeekCalendarProps {
  availability: BookingAvailabilityDTO[];
  date?: Date;
  onDateChange?: (date: Date) => void;
}

const getColorFromStatus = (status: string) => {
  if (status === "confirmed") return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
  if (status === "pending") return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800"
  if (status === "available") return "bg-green-50 text-green-700 border-green-200 border-dashed dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
  return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800"
}

export function WeekCalendar({ availability = [], date, onDateChange }: WeekCalendarProps) {
  const [internalDate, setInternalDate] = useState(new Date())
  const currentDate = date ?? internalDate
  const [selectedEvent, setSelectedEvent] = useState<WeekEvent | null>(null)

  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

  const handleDateChange = (newDate: Date) => {
    if (onDateChange) {
      onDateChange(newDate)
    } else {
      setInternalDate(newDate)
    }
  }

  const nextWeek = () => handleDateChange(addWeeks(currentDate, 1))
  const prevWeek = () => handleDateChange(subWeeks(currentDate, 1))

  const processedEvents: WeekEvent[] = useMemo(() => {
    const events: WeekEvent[] = [];
    let idCounter = 0;
    availability.forEach((dayData) => {
      if (dayData.slots) {
        dayData.slots.forEach((slot: any) => {
          const fromDate = new Date(slot.from);
          const toDate = new Date(slot.to);
          events.push({
            id: idCounter++,
            title: "Available",
            dayOffset: getDay(fromDate),
            startHour: getHours(fromDate) + (fromDate.getMinutes() / 60),
            duration: (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60),
            color: getColorFromStatus("available"),
            customer: "",
            service: "",
            status: "available",
            price: ""
          });
        });
      }
    });
    return events;
  }, [availability]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
      case "pending": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled": return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
      case "available": return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4" />
      case "pending": return <AlertCircle className="h-4 w-4" />
      case "cancelled": return <Ban className="h-4 w-4" />
      case "available": return <CheckCircle className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const eventDate = selectedEvent ? addDays(startDate, selectedEvent.dayOffset) : new Date()

  return (
    <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="font-semibold text-lg">
          {format(startDate, "MMM d")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="transparent" size="small" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="transparent" size="small" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 border-r bg-muted/10">
          <div className="h-10 border-b bg-muted/40" /> {/* Empty corner */}
          {HOURS.map((hour) => (
            <div key={hour} className="h-[60px] border-b text-xs text-muted-foreground flex items-start justify-center pt-2">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className="flex-1 grid grid-cols-7 min-w-[600px]">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div key={i} className="flex flex-col border-r last:border-r-0">
                {/* Day Header */}
                <div className={`h-10 border-b flex items-center justify-center text-sm font-medium ${isToday ? "bg-primary/5 text-primary" : "bg-muted/40"}`}>
                  <span className={isToday ? "font-bold" : ""}>
                    {format(day, "EEE d")}
                  </span>
                </div>

                {/* Day Slots Container */}
                <div className="relative flex-1 bg-background">
                  {/* Grid Lines */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-dashed border-muted/50" />
                  ))}

                  {/* Events */}
                  {processedEvents.filter((e) => e.dayOffset === i).map((event) => {
                    // Calculate position
                    // Start hour is relative to the first hour displayed (8 AM)
                    const startOffset = event.startHour - 8
                    const top = startOffset * 60
                    const height = event.duration * 60

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`absolute left-1 right-1 rounded px-2 py-1 text-xs border shadow-sm overflow-hidden cursor-pointer hover:brightness-95 transition-all ${event.color}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div className="font-semibold">{event.title}</div>
                        <div className="opacity-80">
                          {event.startHour}:00 - {event.startHour + event.duration}:{(event.duration % 1) * 60 || "00"}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Details Modal (Dialog) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-lg shadow-lg max-w-sm w-full border p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Booking Details</h3>
              <Button variant="transparent" size="small" className="h-8 w-8" onClick={() => setSelectedEvent(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {selectedEvent.customer ? selectedEvent.customer.charAt(0) : "A"}
                </div>
                <div>
                  <p className="font-medium">{selectedEvent.customer || "Available Slot"}</p>
                  <p className="text-sm text-muted-foreground">{selectedEvent.service || "No service specified"}</p>
                </div>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Date</span>
                  </div>
                  <span>{format(eventDate, "PPP")}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Time</span>
                  </div>
                  <span>
                    {selectedEvent.startHour}:00 - {selectedEvent.startHour + selectedEvent.duration}:{(selectedEvent.duration % 1) * 60 || "00"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {getStatusIcon(selectedEvent.status)}
                    <span className="capitalize">{selectedEvent.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t mt-2">
                  <span className="font-medium">Total Price</span>
                  <span className="font-bold text-lg">{selectedEvent.price}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full" onClick={() => setSelectedEvent(null)}>
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}