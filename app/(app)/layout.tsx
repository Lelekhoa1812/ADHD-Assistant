import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyToken } from '@/server/auth/jwt'
import { Button } from '@/components/ui/button'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) {
    redirect('/auth/login')
  }

  const payload = await verifyToken(token)
  if (!payload) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/app/dashboard" className="text-xl font-bold">
            ADHD Assistant
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/app/dashboard" className="text-sm hover:underline">Dashboard</Link>
            <Link href="/app/assessment" className="text-sm hover:underline">Assessment</Link>
            <Link href="/app/chat" className="text-sm hover:underline">Chat</Link>
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
