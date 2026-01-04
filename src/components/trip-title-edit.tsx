'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Check, X } from "lucide-react"
import { updateTripTitle } from "@/app/actions"
import { toast } from "sonner"

interface TripTitleEditProps {
  tripId: string
  initialTitle: string
}

export function TripTitleEdit({ tripId, initialTitle }: TripTitleEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("標題不能為空")
      return
    }

    if (title === initialTitle) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    const result = await updateTripTitle(tripId, title)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsEditing(false)
      toast.success("標題更新成功")
    }
  }

  const handleCancel = () => {
    setTitle(initialTitle)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="h-10 text-xl font-bold w-[300px]"
          disabled={isLoading}
        />
        <Button size="icon" variant="ghost" onClick={handleSave} disabled={isLoading} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleCancel} disabled={isLoading} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100">
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={() => setIsEditing(true)}
        className="h-10 w-10 text-muted-foreground opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all ml-1 active:scale-90 active:bg-muted"
      >
        <Pencil className="h-5 w-5" />
        <span className="sr-only">編輯標題</span>
      </Button>
    </div>
  )
}
