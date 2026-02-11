import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Rocket } from "lucide-react"
import { PasswordStrengthMeter, calculateStrength } from "@/components/password-strength-meter"

/**
 * Beta Signup Form - Low Friction
 * Collects minimal information to maximize conversion
 */
export function BetaSignupForm() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [role, setRole] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [wantsUpdates, setWantsUpdates] = useState(false)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)

    try {
      await signInWithGoogle()
      // Navigation happens automatically via useAuth hook
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up with Google"
      setError(errorMessage)
      setGoogleLoading(false)
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

        {/* Google Sign-in Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-lg"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          data-testid="google-signin"
        >
          {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

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
