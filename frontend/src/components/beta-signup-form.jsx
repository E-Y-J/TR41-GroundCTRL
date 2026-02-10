import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Rocket } from "lucide-react"
import zxcvbn from "zxcvbn"

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

  const passwordStrength = password ? zxcvbn(password) : null
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!agreedToTerms) {
      setError("Please agree to the Terms & Privacy Policy")
      return
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters")
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must include at least one uppercase letter")
      return
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must include at least one special character")
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
    <div className="w-full max-w-md space-y-4">
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center mb-2">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Join the Beta</h2>
        <p className="text-xs text-muted-foreground">
          Get early access to GroundCTRL satellite operations simulator
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1">
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

        <div className="space-y-1">
          <label htmlFor="password" className="text-xs font-medium text-foreground">
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
          
          {/* Password Strength Meter */}
          {password && (
            <div className="mt-2">
              <div className="w-full h-1.5 bg-border rounded">
                <div
                  className={`h-1.5 rounded transition-all duration-300 ${
                    passwordStrength.score === 0 ? "bg-red-500 w-1/5" :
                    passwordStrength.score === 1 ? "bg-orange-500 w-2/5" :
                    passwordStrength.score === 2 ? "bg-yellow-500 w-3/5" :
                    passwordStrength.score === 3 ? "bg-blue-500 w-4/5" :
                    "bg-green-600 w-full"
                  }`}
                />
              </div>
              <div className="text-[10px] mt-1 text-muted-foreground flex justify-between">
                <span>Password strength:</span>
                <span className={
                  passwordStrength.score < 2 ? "text-red-500" :
                  passwordStrength.score === 2 ? "text-yellow-600" :
                  passwordStrength.score === 3 ? "text-blue-600" :
                  "text-green-600"
                }>
                  {strengthLabels[passwordStrength.score]}
                </span>
              </div>
            </div>
          )}
          
          {/* Password Requirements Checklist */}
          <div className="mt-2 space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground">Password must contain:</p>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  password.length >= 12 ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {password.length >= 12 && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={password.length >= 12 ? 'text-green-600' : 'text-muted-foreground'}>
                  At least 12 characters
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  /[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {/[A-Z]/.test(password) && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                  One uppercase letter (A-Z)
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px]">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  /[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {/[^A-Za-z0-9]/.test(password) && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                  One special character (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label htmlFor="firstName" className="text-xs font-medium text-foreground">
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
          
          <div className="space-y-1">
            <label htmlFor="lastName" className="text-xs font-medium text-foreground">
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

        <div className="space-y-1">
          <label htmlFor="role" className="text-xs font-medium text-foreground">
            Primary Role
          </label>
          <select
            id="role"
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

        <div className="space-y-2 pt-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={setAgreedToTerms}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-xs text-foreground leading-tight cursor-pointer">
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
            <label htmlFor="updates" className="text-xs text-muted-foreground leading-tight cursor-pointer">
              I'm ok receiving occasional GroundCTRL updates
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Rocket className="mr-2 h-4 w-4" />
          Request Beta Access
        </Button>

        <p className="text-[10px] text-center text-muted-foreground leading-tight">
          Beta access is currently limited. You'll be notified when approved.
        </p>
      </form>
    </div>
  )
}
