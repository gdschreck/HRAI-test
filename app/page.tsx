"use client"

import { useState } from "react"
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { AssessmentForm } from "@/components/assessment-form"
import { AssessmentsList } from "@/components/assessments-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const { user } = useUser()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Assessment DB Test</h1>
          <SignedIn>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</span>
              <UserButton />
            </div>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <SignedOut>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Welcome</CardTitle>
              <CardDescription>
                Sign in to test the assessment database schema
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SignInButton mode="modal">
                <Button size="lg">Sign In to Continue</Button>
              </SignInButton>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Submit Assessment</CardTitle>
                <CardDescription>
                  Enter a question number and answer to write to the database.
                  Your Clerk user ID, email, and name will be automatically recorded.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentForm onSuccess={() => setRefreshTrigger((t) => t + 1)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>
                  View and manage your submitted assessments. Due to RLS policies,
                  you can only see your own records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentsList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Info (from Clerk)</CardTitle>
                <CardDescription>
                  This data is automatically populated from your Clerk session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                    <dd className="mt-1 font-mono text-sm">{user?.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                    <dd className="mt-1 text-sm">{user?.primaryEmailAddress?.emailAddress}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                    <dd className="mt-1 text-sm">
                      {user?.fullName || user?.username || user?.firstName || "Not set"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </SignedIn>
      </div>
    </main>
  )
}
