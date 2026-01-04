import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Navbar from "@/components/navbar"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { TripCard } from "@/components/trip-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CalendarDays, MapPin, Plus } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch trips where user is owner or member
  // RLS handles the filtering, we just select *
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">我的行程</h1>
            <p className="text-muted-foreground mt-2">
              管理與查看您的所有旅遊計畫。
            </p>
          </div>
        </div>

        {trips?.length === 0 ? (
          <div className="text-center py-20 border rounded-lg bg-muted/50 border-dashed">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">還沒有行程</h3>
            <p className="text-sm text-muted-foreground mb-4">
              點擊下方的按鈕開始規劃您的第一次旅行！
            </p>
            <CreateTripDialog />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips?.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
            
            {/* Create New Trip Card */}
             <CreateTripDialog>
                <div className="group block h-full cursor-pointer">
                    <Card className="h-full border-dashed flex flex-col items-center justify-center p-6 hover:bg-muted/50 transition-all bg-muted/20 active:scale-95 active:border-primary/50">
                        <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                             <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-primary">建立新行程</h3>
                    </Card>
                </div>
             </CreateTripDialog>
          </div>
        )}
      </main>
    </div>
  )
}
