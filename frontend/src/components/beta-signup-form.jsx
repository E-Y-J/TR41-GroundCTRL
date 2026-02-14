import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Rocket, AlertCircle } from "lucide-react"
import { PasswordStrengthMeter, calculateStrength } from "@/components/password-strength-meter"

/**
 * Beta Signup Form - All Required Fields
 * Comprehensive validation with regex patterns
 */

// Validation regex patterns
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
}

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

  // Field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
    terms: ""
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({})

  // Validation functions
  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required"
    if (!VALIDATION_PATTERNS.email.test(value)) {
      return "Please enter a valid email address (e.g., name@example.com)"
    }
    return ""
  }

  const validateName = (value, fieldName) => {
    if (!value.trim()) return `${fieldName} is required`
    if (value.trim().length < 2) return `${fieldName} must be at least 2 characters`
    if (!VALIDATION_PATTERNS.name.test(value)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    }
    return ""
  }

  const validateRole = (value) => {
    if (!value) return "Please select your primary role"
    return ""
  }

  const handleFieldBlur = (field) => {
    setTouched({ ...touched, [field]: true })
    
    let error = ""
    switch (field) {
      case "email":
        error = validateEmail(email)
        break
      case "firstName":
        error = validateName(firstName, "First name")
        break
      case "lastName":
        error = validateName(lastName, "Last name")
        break
      case "role":
        error = validateRole(role)
        break
      default:
        break
    }
    
    setFieldErrors({ ...fieldErrors, [field]: error })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validate all fields
    const errors = {
      email: validateEmail(email),
      firstName: validateName(firstName, "First name"),
      lastName: validateName(lastName, "Last name"),
      role: validateRole(role),
      password: "",
      terms: ""
    }

    // Check password strength
    const passwordStrength = calculateStrength(password)
    if (passwordStrength.level < 5) {
      errors.password = "Password does not meet NASA-grade security requirements. All checks must be green."
    }

    // Check terms agreement
    if (!agreedToTerms) {
      errors.terms = "You must agree to the Terms & Privacy Policy"
    }

    // Set all fields as touched
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      password: true,
      terms: true
    })

    // If any errors, show them and stop
    const hasErrors = Object.values(errors).some(err => err !== "")
    if (hasErrors) {
      setFieldErrors(errors)
      setError("🚫 Mission abort! Please fix the errors above before proceeding.")
      return
    }

    setLoading(true)

    try {
      // Combine first and last name for displayName
      const displayName = `${firstName.trim()} ${lastName.trim()}`
      
      // Sign up with beta program metadata
      // NOTE: role is NOT sent - backend automatically sets to "beta" for security
      await signUp(email.trim(), password, displayName, "", {
        primaryRole: role,
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
            className={`rounded-lg ${touched.email && fieldErrors.email ? 'border-red-500' : ''}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (touched.email) {
                setFieldErrors({ ...fieldErrors, email: validateEmail(e.target.value) })
              }
            }}
            onBlur={() => handleFieldBlur("email")}
            required
          />
          {touched.email && fieldErrors.email && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-500">{fieldErrors.email}</p>
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <label htmlFor="password" className="text-[10px] font-medium text-foreground">
            Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            className={`rounded-lg ${touched.password && fieldErrors.password ? 'border-red-500' : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={12}
          />
          
          {/* NASA-Grade Password Strength Meter */}
          {password && <PasswordStrengthMeter password={password} className="mt-1" />}
          
          {touched.password && fieldErrors.password && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-500">{fieldErrors.password}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <label htmlFor="firstName" className="text-[10px] font-medium text-foreground">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              className={`rounded-lg ${touched.firstName && fieldErrors.firstName ? 'border-red-500' : ''}`}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                if (touched.firstName) {
                  setFieldErrors({ ...fieldErrors, firstName: validateName(e.target.value, "First name") })
                }
              }}
              onBlur={() => handleFieldBlur("firstName")}
              required
            />
            {touched.firstName && fieldErrors.firstName && (
              <div className="flex items-start gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-red-500">{fieldErrors.firstName}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-0.5">
            <label htmlFor="lastName" className="text-[10px] font-medium text-foreground">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              className={`rounded-lg ${touched.lastName && fieldErrors.lastName ? 'border-red-500' : ''}`}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                if (touched.lastName) {
                  setFieldErrors({ ...fieldErrors, lastName: validateName(e.target.value, "Last name") })
                }
              }}
              onBlur={() => handleFieldBlur("lastName")}
              required
            />
            {touched.lastName && fieldErrors.lastName && (
              <div className="flex items-start gap-1 mt-1">
                <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-red-500">{fieldErrors.lastName}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-0.5">
          <label htmlFor="role" className="text-[10px] font-medium text-foreground">
            Primary Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            className={`w-full px-2 py-1.5 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              touched.role && fieldErrors.role ? 'border-red-500' : 'border-input'
            }`}
            value={role}
            onChange={(e) => {
              setRole(e.target.value)
              if (touched.role) {
                setFieldErrors({ ...fieldErrors, role: validateRole(e.target.value) })
              }
            }}
            onBlur={() => handleFieldBlur("role")}
            required
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
          {touched.role && fieldErrors.role && (
            <div className="flex items-start gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-500">{fieldErrors.role}</p>
            </div>
          )}
        </div>

        <div className="space-y-1 pt-0.5">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => {
                setAgreedToTerms(checked)
                if (touched.terms) {
                  setFieldErrors({ 
                    ...fieldErrors, 
                    terms: checked ? "" : "You must agree to the Terms & Privacy Policy" 
                  })
                }
              }}
              className="mt-1"
              required
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
          {touched.terms && fieldErrors.terms && (
            <div className="flex items-start gap-1 mt-1 ml-6">
              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-red-500">{fieldErrors.terms}</p>
            </div>
          )}

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
