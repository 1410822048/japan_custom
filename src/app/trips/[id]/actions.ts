'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createItineraryItem(tripId: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const day = parseInt(formData.get('day') as string)
  const startTime = formData.get('start_time') as string // HH:mm:ss ?
  const location = formData.get('location') as string

  // We need to implement this later when we have the Dialog
  // ...
  
  revalidatePath(`/trips/${tripId}`)
}
