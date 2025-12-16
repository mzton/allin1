'use client'

import { signOut, useSession } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
        <User className="h-4 w-4" />
        <span className="truncate">{session.user?.email}</span>
      </div>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => signOut({ callbackUrl: '/auth/login' })}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  )
}
