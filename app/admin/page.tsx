"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { withBasePath } from "@/lib/paths"
import Link from "next/link"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function checkSession() {
      try {
        const response = await fetch(withBasePath("/api/admin/session"), { cache: "no-store" })
        if (response.ok && !cancelled) {
          router.replace(withBasePath("/admin/applications"))
          return
        }
      } catch {
        // If the session probe fails, fall back to showing the login form.
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false)
        }
      }
    }

    void checkSession()

    return () => {
      cancelled = true
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(withBasePath("/api/admin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push(withBasePath("/admin/applications"))
        return
      }

      const result = await response.json().catch(() => null) as { error?: string } | null
      setError(result?.error || "Incorrect password")
    } catch {
      setError("Unable to verify password")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground text-center mb-2">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter the admin password to view applications.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className={error ? "border-destructive" : ""}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
