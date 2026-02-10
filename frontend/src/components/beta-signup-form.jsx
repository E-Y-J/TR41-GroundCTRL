import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Rocket, Shield } from "lucide-react"
import { PasswordStrengthMeter, calculateStrength } from "@/components/password-strength-meter"

/**
 * Beta Signup Form - Low Friction
 * Collects minimal information to maximize conversion
 */
export function BetaSignupForm() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [wantsUpdates, setWantsUpdates] = useState(false)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!agreedToTerms) {
      setError("Please agree to the Terms & Privacy Policy")
      return
    }

    // Validate NASA-grade password requirements
    const passwordStrength = calculateStrength(password)
    if (passwordStrength.level < 5) {
      setError("🚫 Mission abort! Password does not meet NASA-grade security requirements. All checks must be green.")
      return
    }

    setLoading(true)

    try {
      // Combine first and last name for displayName
      const displayName = `${firstName} ${lastName}`.trim() || email.split("@")[0]
      
      // Sign up with beta role
      await signUp(email, password, displayName, "", {
        role: "beta",
        primaryRole: role || "Other",
        onboardingComplete: false,
        wantsUpdates,
      })

      // Redirect to beta waiting page
      navigate("/beta-welcome")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up"
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="text-center space-y-0.5">
        <div className="flex items-center justify-center mb-1">
          <Rocket className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Join the Beta</h2>
        <p className="text-[10px] text-muted-foreground">
          Get early access to GroundCTRL satellite operations simulator
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {error && (
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <div className="space-y-0.5">
          <label htmlFor="email" className="text-xs font-medium text-foreground">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-0.5">
          <label htmlFor="password" className="text-[10px] font-medium text-foreground">
            Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            className="rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
          />
          
          {/* NASA-Grade Password Strength Meter */}
          {password && <PasswordStrengthMeter password={password} className="mt-1" />}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <label htmlFor="firstName" className="text-[10px] font-medium text-foreground">
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              className="rounded-lg"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          
          <div className="space-y-0.5">
            <label htmlFor="lastName" className="text-[10px] font-medium text-foreground">
              Last Name
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              className="rounded-lg"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-0.5">
          <label htmlFor="role" className="text-[10px] font-medium text-foreground">
            Primary Role
          </label>
          <select
            id="role"
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select your role...</option>
            <option value="Student">Student</option>
            <option value="Hobbyist">Hobbyist</option>
            <option value="Engineer">Engineer</option>
            <option value="Mission Ops">Mission Ops</option>
            <option value="Educator">Educator</option>
            <option value="Researcher">Researcher</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1 pt-0.5">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-[10px] text-foreground leading-tight cursor-pointer">
              I agree to the{" "}
              <a href="/terms" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </a>
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="updates"
              checked={wantsUpdates}
              onCheckedChange={setWantsUpdates}
              className="mt-1"
            />
            <label htmlFor="updates" className="text-[10px] text-muted-foreground leading-tight cursor-pointer">
              I'm ok receiving occasional GroundCTRL updates
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-lg text-sm py-1.5" disabled={loading}>
          {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          <Rocket className="mr-1.5 h-3.5 w-3.5" />
          Request Beta Access
        </Button>

        <p className="text-[9px] text-center text-muted-foreground leading-tight">
          Beta access is currently limited. You'll be notified when approved.
        </p>
      </form>
    </div>
  )
}
