import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold">ADHD Assistant</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A supportive tool for ADHD screening and personalized coaching.
              Understand your patterns and discover strategies that work for you.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Important Notice */}
          <Card className="bg-muted/50 border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Important Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                This tool is for <strong>screening and self-understanding only</strong>. It does
                not provide a medical diagnosis. If you have concerns about ADHD, please consult
                with a qualified healthcare professional for evaluation and treatment.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ADHD Screening</CardTitle>
                <CardDescription>
                  Take the validated ASRS v1.1 screening tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Understand your patterns with a research-backed screening tool. Results are for
                  informational purposes only.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalized Coaching</CardTitle>
                <CardDescription>
                  Get AI-powered support tailored to your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Chat with your coach about strategies, planning, and challenges. Your history
                  helps provide personalized guidance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy First</CardTitle>
                <CardDescription>
                  Your data is secure and you&apos;re in control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All your data is encrypted and stored securely. You can export or delete your
                  data at any time.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">1</div>
                <h3 className="font-semibold">Create Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up and complete a brief onboarding to personalize your experience
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">2</div>
                <h3 className="font-semibold">Take Screening</h3>
                <p className="text-sm text-muted-foreground">
                  Complete the ASRS v1.1 screening tool to understand your patterns
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">3</div>
                <h3 className="font-semibold">Get Support</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with your coach and access personalized strategies and plans
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
