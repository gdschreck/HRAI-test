"use client"

import { useState } from "react"
import { useSession, useUser } from "@clerk/nextjs"
import { createClerkSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function AssessmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useUser()
  const { session } = useSession()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClerkSupabaseClient(async () => {
    return session?.getToken() ?? null
  })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!user || !session) {
      toast.error("You must be signed in to submit an assessment")
      return
    }

    const answerNum = parseInt(answer, 10)
    if (isNaN(answerNum) || answerNum < 0 || answerNum > 5) {
      toast.error("Answer must be a number between 0 and 5")
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("assessments").upsert({
        user_id: user.id,
        user_name: user.fullName || user.username || user.firstName || "Unknown",
        email: user.primaryEmailAddress?.emailAddress || "",
        question: question.trim(),
        answer: answerNum,
      }, { onConflict: 'user_id,question' })

      if (error) {
        console.error("Supabase error:", error)
        toast.error(`Failed to submit: ${error.message}`)
        return
      }

      toast.success("Assessment submitted successfully!")
      setQuestion("")
      setAnswer("")
      onSuccess?.()
    } catch (err) {
      console.error("Submit error:", err)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          type="text"
          placeholder="e.g., 1.1, 1.2, 2.1"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <p className="text-sm text-muted-foreground">
          Enter the question number (e.g., 1.1, 1.2)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Input
          id="answer"
          type="number"
          min={0}
          max={5}
          placeholder="0-5"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <p className="text-sm text-muted-foreground">
          Enter a value between 0 and 5
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Assessment"
        )}
      </Button>
    </form>
  )
}
