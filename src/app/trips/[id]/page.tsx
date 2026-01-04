import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { TripHeader } from '@/components/trip/trip-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Wallet, NotebookPen } from 'lucide-react'

// Next.js 16: params is a Promise
export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch Trip
  const { data: trip, error } = await supabase
    .from('trips')
    .select('*, trip_members(*)')
    .eq('id', id)
    .single()

  if (error || !trip) {
    console.error("Error fetching trip:", error)
    notFound()
  }

  // Check if user is a member (Optional, but good for UX to redirect specific error page if needed)
  // RLS will return empty if not authorized usually, but .single() would error.
  // We'll rely on the fact that if trip is null/error, it's either not found or not auth.

  return (
     <div className="container mx-auto py-8 px-4 space-y-8 max-w-5xl">
        <TripHeader trip={trip} />
        
        <Tabs defaultValue="itinerary" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="itinerary" className="flex gap-2">
                    <CalendarDays className="h-4 w-4" />
                    行程
                </TabsTrigger>
                <TabsTrigger value="expenses" className="flex gap-2">
                    <Wallet className="h-4 w-4" />
                    預算
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex gap-2">
                    <NotebookPen className="h-4 w-4" />
                    筆記
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="itinerary" className="mt-6">
                <div className="p-4 border rounded-lg bg-gray-50 text-center text-muted-foreground min-h-[300px] flex items-center justify-center flex-col gap-4">
                     <p>行程功能即將推出</p>
                     {/* We will add Itinerary View here later */}
                </div>
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-6">
                 <div className="p-10 border rounded-lg bg-gray-50 text-center text-muted-foreground">
                    預算功能開發中
                </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
                 <div className="p-10 border rounded-lg bg-gray-50 text-center text-muted-foreground">
                    筆記功能開發中
                </div>
            </TabsContent>
        </Tabs>
     </div>
  )
}
