import Link from "next/link"
import { UserNav } from "./user-nav"
import { createClient } from "@/utils/supabase/server"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl tracking-tight">
            旅遊計畫
        </Link>
        <div className="ml-auto flex items-center space-x-4">
            {user ? <UserNav email={user.email!} /> : (
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    登入
                </Link>
            )}
        </div>
      </div>
    </div>
  )
}
