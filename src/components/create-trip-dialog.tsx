'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { createTrip } from "@/app/actions"
import { toast } from "sonner"

export function CreateTripDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get("title") as string
    const startDate = formData.get("start_date") as string
    const endDate = formData.get("end_date") as string

    if (!title) {
        toast.error("請輸入標題")
        return
    }

    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            toast.error("結束日期不能早於開始日期")
            return
        }
    }

    setIsLoading(true)
    
    // Add a small delay to ensure the loading state is visible and feels deliberate
    await new Promise(resolve => setTimeout(resolve, 800))

    // We allow the server action to handle the redirect.
    // If it redirects, the component will eventually unmount.
    // We only create a "stop loading" condition if we get an error back.
    const result = await createTrip(formData)

    if (result?.error) {
      setIsLoading(false)
      toast.error(result.error)
    } else {
        // If successful, we don't set open=false or loading=false 
        // because the page is about to redirect to the new trip.
        // Keeping loading true gives better UX.
        // However, in case redirect is slow or we want to provide "success" feedback:
        toast.success("行程建立成功，正在跳轉...")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
            <Button>
            <Plus className="mr-2 h-4 w-4" />
            建立新行程
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>建立新行程</DialogTitle>
          <DialogDescription>
            輸入行程的基本資訊。建立後可以再邀請朋友加入。
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">正在建立行程，請稍候...</p>
            </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                標題
              </Label>
              <Input
                id="title"
                name="title"
                defaultValue="東京五日遊"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                開始日期
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                結束日期
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
                建立行程
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
