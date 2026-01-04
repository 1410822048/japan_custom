'use client'

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Pencil } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { updateTripDates } from "@/app/actions"
import { toast } from "sonner"

interface TripDatePickerProps {
  tripId: string
  startDate: string | null
  endDate: string | null
}

export function TripDatePicker({ tripId, startDate, endDate }: TripDatePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      }
    } else if (startDate) {
        return {
            from: new Date(startDate),
            to: undefined
        }
    }
    return undefined
  })

  const [open, setOpen] = React.useState(false)

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate)
  }

  const handleSave = async () => {
    // If we want to allow clearing dates, we can handle undefined date here.
    // For now assuming we update with whatever is selected.
    
    const start = date?.from ? format(date.from, 'yyyy-MM-dd') : null
    const end = date?.to ? format(date.to, 'yyyy-MM-dd') : (start ? start : null)

    const result = await updateTripDates(tripId, start, end)
    if (result?.error) {
        toast.error(result.error)
    } else {
        toast.success("日期更新成功")
        setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"ghost"}
          className={cn(
            "w-fit justify-start text-left font-normal px-2 -ml-2 text-muted-foreground md:hover:text-primary h-10 text-base md:text-sm transition-all active:scale-95 active:bg-muted group",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>尚未設定日期</span>
          )}
          {/* Pencil icon: hidden on mobile, visible on desktop hover */}
          <Pencil className="ml-2 h-4 w-4 hidden lg:block opacity-0 lg:group-hover:opacity-50 transition-opacity" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
        <div className="p-2 border-t flex justify-end">
            <Button size="sm" onClick={handleSave}>儲存日期</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
