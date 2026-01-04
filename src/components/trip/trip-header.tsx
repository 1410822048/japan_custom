import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, User, ChevronLeft } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface TripMember {
  user_id: string
}

interface Trip {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  created_at: string
  trip_members?: TripMember[]
}

import { TripTitleEdit } from '@/components/trip-title-edit'
import { TripDatePicker } from '@/components/trip-date-picker'

interface TripHeaderProps {
  trip: Trip
}

export function TripHeader({ trip }: TripHeaderProps) {

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <div className="flex items-center justify-between w-full md:w-auto">
        <Button variant="outline" size="icon" asChild className="rounded-full shrink-0 transition-transform active:scale-90">
            <Link href="/">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">返回</span>
            </Link>
        </Button>
      </div>
      
      <div className="flex-1 space-y-4 w-full">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
             {/* Title Edit Area */}
             <TripTitleEdit tripId={trip.id} initialTitle={trip.title} />

             {/* Date Picker Area */}
             <div className="mt-1 group flex items-center">
                <TripDatePicker 
                    tripId={trip.id} 
                    startDate={trip.start_date} 
                    endDate={trip.end_date} 
                />
             </div>
          </div>
          
          {/* Members Area */}
          <div className="flex -space-x-2 overflow-hidden pt-2 md:pt-0">
               {trip.trip_members?.map((member, i) => (
                  <Avatar key={member.user_id} className="inline-block border-2 border-background h-8 w-8 md:h-10 md:w-10">
                      <AvatarFallback>U{i+1}</AvatarFallback>
                  </Avatar>
               ))}
               {(!trip.trip_members || trip.trip_members.length === 0) && (
                  <div className="text-sm text-muted-foreground">無成員</div>
               )}
          </div>
        </div>
      </div>
    </div>
  )
}
