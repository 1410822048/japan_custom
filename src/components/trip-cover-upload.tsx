'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface TripCoverUploadProps {
  tripId: string
  currentImageUrl: string | null
  title: string
  variant?: 'interactive' | 'button' // interactive = whole area clickable, button = only small button clickable
}

export function TripCoverUpload({ tripId, currentImageUrl, title, variant = 'interactive' }: TripCoverUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    
    // Default limit: 2MB (Supabase Free Tier optimization)
    if (file.size > 2 * 1024 * 1024) {
        toast.error("檔案過大", {
            description: "為了節省空間，請上傳小於 2MB 的圖片"
        })
        e.target.value = ''
        return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${tripId}-${Math.random()}.${fileExt}`
    const filePath = `trip-covers/${fileName}`

    setIsUploading(true)
    const supabase = createClient()

    try {
      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-covers')
        .getPublicUrl(filePath)

      // 3. Update DB
      await updateTripCover(publicUrl)

      toast.success('封面照片更新成功')
      setIsOpen(false)
      
    } catch (error: any) {
      toast.error('上傳失敗: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkSubmit = async () => {
    if (!linkUrl) return
    setIsUploading(true)
    try {
        // Basic URL validation
        new URL(linkUrl) 
        
        await updateTripCover(linkUrl)
        toast.success('封面連結更新成功')
        setIsOpen(false)
        setLinkUrl("")
    } catch (error) {
        toast.error('無效的圖片連結')
    } finally {
        setIsUploading(false)
    }
  }

  const updateTripCover = async (url: string) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('trips')
        .update({ cover_image_url: url })
        .eq('id', tripId)

      if (error) throw error
      setImageUrl(url)
  }

  // Helper component defined inside to access state
  const ImageContent = () => (
    <div className="group relative aspect-video w-full rounded-md bg-muted/50 overflow-hidden transition-opacity">
        {imageUrl ? (
            <Image 
                src={imageUrl} 
                alt={`Cover for ${title}`} 
                fill 
                className="object-cover transition-transform group-hover:scale-105"
            />
        ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                <MapPin className="h-8 w-8 opacity-30 mb-1" />
                <span className="text-xs opacity-50 font-medium">設定封面</span>
             </div>
        )}
        
        {/* Interactive variant overlay - Loading state & Desktop Hover */}
        {variant === 'interactive' && (
             <>
                {/* 1. Loading Overlay (Highest priority) */}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-20">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}

                {/* 2. Desktop Hover Overlay (Hidden on mobile usually, or used for "Change" text) 
                    We will replace the generic hover overlay with a specific Badge for clarity on mobile 
                */}
                
                {/* Persistent Edit Badge (Always visible on mobile, Hover on Desktop) */}      
                {!isUploading && (
                    <div className="absolute bottom-2 right-2 z-10">
                        <div className="bg-black/30 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-md shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <ImageIcon className="h-3 w-3" />
                            <span>更換封面</span>
                        </div>
                    </div>
                )}
             </>
        )}

        {/* Button variant trigger */}
        {variant === 'button' && (
             <DialogTrigger asChild>
                <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute bottom-2 right-2 h-8 w-8 rounded-full shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20 hover:bg-white"
                    onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    <span className="sr-only">更換封面</span>
                </Button>
            </DialogTrigger> 
        )}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {variant === 'interactive' ? (
            <DialogTrigger asChild>
                <div className="cursor-pointer" onClick={(e) => { e.stopPropagation(); }}>
                    <ImageContent />
                </div>
            </DialogTrigger>
        ) : (
            // For button variant, we just render the content. The trigger is inside.
            <ImageContent />
        )}
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
                <DialogTitle>設定封面照片</DialogTitle>
                <DialogDescription>
                    請選擇上傳圖片或輸入圖片連結，圖片大小請勿超過 2MB。
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">上傳圖片</TabsTrigger>
                    <TabsTrigger value="link">圖片連結</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4 py-4">
                    <div 
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors",
                            isUploading ? "bg-muted/50 cursor-not-allowed" : "hover:bg-accent/50"
                        )}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                                <span className="text-sm text-muted-foreground">上傳中...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">點擊選擇圖片 (Max 2MB)</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            accept="image/*" 
                            className="hidden" 
                            disabled={isUploading}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="link" className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Input 
                            placeholder="https://example.com/image.jpg" 
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            disabled={isUploading}
                        />
                        <Button onClick={handleLinkSubmit} disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "儲存"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        請確保連結直接指向圖片檔案 (jpg, png, webp 等)。
                    </p>
                </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
  )
}
