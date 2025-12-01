import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mt-2">
          View your past assessments, plans, and conversations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Assessments</CardTitle>
          <CardDescription>Your screening history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No assessments yet. Complete a screening to see your results here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chat History</CardTitle>
          <CardDescription>Previous conversations with your coach</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No chat history yet. Start a conversation to see it here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

