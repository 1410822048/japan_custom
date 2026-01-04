'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createTrip(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  // 1. Insert Trip
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .insert({
      title,
      start_date: startDate || null,
      end_date: endDate || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (tripError) {
    return { error: tripError.message }
  }

  // 2. Add creator to trip_members
  // Note: RLS allows "Users can join a trip if they are the owner", 
  // ensuring the creator is a member.
  const { error: memberError } = await supabase
    .from('trip_members')
    .insert({
        trip_id: trip.id,
        user_id: user.id,
        role: 'owner'
    })

  if (memberError) {
      // Potentially rollback or just log? 
      // If this fails, the user owns the trip but isn't a "member" in the members table.
      // Depending on RLS, they might still see it via "owner" check in `trips` policy.
      // My RLS policy said: auth.uid() = user_id OR exists in members.
      // So they can still see it. But let's return error.
      return { error: memberError.message }
  }

  revalidatePath('/')
  redirect(`/trips/${trip.id}`)
}

export async function deleteTrip(tripId: string) {
  const supabase = await createClient()

  const {
      data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RLS will ensure only owners can delete
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}


export async function updateTripTitle(tripId: string, title: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('trips')
    .update({ title })
    .eq('id', tripId)

  if (error) return { error: error.message }

  revalidatePath(`/trips/${tripId}`)
  revalidatePath('/')
  return { success: true }
}

export async function updateTripDates(tripId: string, startDate: string | null, endDate: string | null) {
    const supabase = await createClient()
  
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
  
    const { error } = await supabase
      .from('trips')
      .update({ 
        start_date: startDate,
        end_date: endDate
      })
      .eq('id', tripId)
  
    if (error) return { error: error.message }
  
    revalidatePath(`/trips/${tripId}`)
    revalidatePath('/')
    return { success: true }
  }
