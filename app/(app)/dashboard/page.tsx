import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your ADHD Assistant. Get started with screening or chat with your coach.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>ADHD Screening</CardTitle>
            <CardDescription>
              Take the ASRS v1.1 screening to understand your patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/assessment">
              <Button className="w-full">Start Screening</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coach Chat</CardTitle>
            <CardDescription>
              Get personalized support and strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/chat">
              <Button className="w-full" variant="outline">
                Start Chat
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            <CardDescription>
              View past assessments and conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/history">
              <Button className="w-full" variant="outline">
                View History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Important Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            This tool is for <strong>screening and self-understanding only</strong>. It does not
            provide a medical diagnosis. If you have concerns about ADHD, please consult with a
            qualified healthcare professional.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

