"use client"

import { useEffect, useState } from "react"
import { useSession, useUser } from "@clerk/nextjs"
import { createClerkSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Assessment {
  id: string
  created_at: string
  user_id: string
  user_name: string | null
  email: string
  question: string
  answer: number
  notes: string | null
}

export function AssessmentsList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useUser()
  const { session } = useSession()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClerkSupabaseClient(async () => {
    return session?.getToken() ?? null
  })

  async function loadAssessments() {
    if (!user || !session) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading assessments:", error)
        toast.error(`Failed to load assessments: ${error.message}`)
        return
      }

      setAssessments(data || [])
    } catch (err) {
      console.error("Load error:", err)
      toast.error("An unexpected error occurred while loading assessments")
    } finally {
      setLoading(false)
    }
  }

  async function deleteAssessment(id: string) {
    try {
      const { error } = await supabase
        .from("assessments")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error deleting assessment:", error)
        toast.error(`Failed to delete: ${error.message}`)
        return
      }

      toast.success("Assessment deleted")
      loadAssessments()
    } catch (err) {
      console.error("Delete error:", err)
      toast.error("An unexpected error occurred while deleting")
    }
  }

  useEffect(() => {
    if (user && session) {
      loadAssessments()
    }
  }, [user, session, refreshTrigger])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading assessments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Assessments</h2>
        <Button variant="outline" size="sm" onClick={loadAssessments}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {assessments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No assessments found. Submit one above!</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.question}</TableCell>
                  <TableCell>{assessment.answer}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAssessment(assessment.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
