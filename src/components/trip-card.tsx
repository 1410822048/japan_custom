'use client'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { TripCoverUpload } from "@/components/trip-cover-upload"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { deleteTrip } from "@/app/actions"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Trip {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  cover_image_url: string | null
}

export function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {

    setIsDeleting(true)
    const result = await deleteTrip(trip.id)
    setIsDeleting(false)

    if (result && result.error) {
        toast.error(result.error)
    } else {
        setOpen(false)
        toast.success("行程已刪除")
    }
  }

  return (
    <div className="group relative block h-full">
        {/* Main Card with programmatic navigation */}
        <div 
            onClick={() => router.push(`/trips/${trip.id}`)}
            className="block h-full cursor-pointer"
        >
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 group-hover:bg-accent/5 active:scale-95 active:border-primary active:shadow-sm">
                <CardHeader>
                    <CardTitle className="truncate pr-8">{trip.title}</CardTitle>
                    <CardDescription>
                    {trip.start_date ? (
                        <span className="flex items-center text-xs">
                        <CalendarDays className="mr-1 h-3 w-3" />
                        {format(new Date(trip.start_date), 'yyyy/MM/dd')}
                        {trip.end_date ? ` - ${format(new Date(trip.end_date), 'yyyy/MM/dd')}` : ""}
                        </span>
                    ) : (
                        "日期未定"
                    )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Cover Image Upload Area - Stops propagation in component */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <TripCoverUpload 
                            tripId={trip.id} 
                            currentImageUrl={trip.cover_image_url} 
                            title={trip.title} 
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Delete Button */}
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-8 w-8 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">刪除行程</span>
                </Button>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>確認刪除行程？</DialogTitle>
                    <DialogDescription>
                        您確定要刪除「{trip.title}」嗎？此動作無法復原。
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>取消</Button>
                    <Button 
                        variant="destructive" 
                        onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "刪除中..." : "確認刪除"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}
