import { CheckCircle, XCircle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * NASA-Grade Password Requirements
 * Based on NIST SP 800-63B and NASA security standards
 */
const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Minimum 12 characters (Mission Control standard)",
    test: (pwd) => pwd.length >= 12,
  },
  {
    id: "uppercase",
    label: "At least 1 uppercase letter (A-Z)",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "lowercase",
    label: "At least 1 lowercase letter (a-z)",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    id: "number",
    label: "At least 1 number (0-9)",
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    id: "special",
    label: "At least 1 special character (!@#$%^&*)",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\';/~`]/.test(pwd),
  },
]

/**
 * Calculate password strength level
 * @param {string} password - Password to evaluate
 * @returns {Object} Strength analysis
 */
function calculateStrength(password) {
  if (!password) {
    return { level: 0, label: "NO SIGNAL", color: "text-muted-foreground", className: "bg-muted" }
  }

  const passedChecks = PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length
  const totalChecks = PASSWORD_REQUIREMENTS.length

  if (passedChecks === totalChecks) {
    return { 
      level: 5, 
      label: "GO FOR LAUNCH 🚀", 
      color: "text-green-500", 
      className: "bg-green-500" 
    }
  } else if (passedChecks >= 4) {
    return { 
      level: 4, 
      label: "MISSION READY", 
      color: "text-blue-500", 
      className: "bg-blue-500" 
    }
  } else if (passedChecks >= 3) {
    return { 
      level: 3, 
      label: "OPERATIONAL", 
      color: "text-yellow-500", 
      className: "bg-yellow-500" 
    }
  } else if (passedChecks >= 2) {
    return { 
      level: 2, 
      label: "WEAK SIGNAL", 
      color: "text-orange-500", 
      className: "bg-orange-500" 
    }
  } else {
    return { 
      level: 1, 
      label: "NO-GO", 
      color: "text-red-500", 
      className: "bg-red-500" 
    }
  }
}

export function PasswordStrengthMeter({ password, className }) {
  const strength = calculateStrength(password)
  const passedChecks = PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length
  const totalChecks = PASSWORD_REQUIREMENTS.length

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Indicator Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Security Level
          </span>
          <span className={cn("font-mono font-semibold", strength.color)}>
            {strength.label}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", strength.className)}
            style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-card border border-border rounded-lg p-2">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          NASA-GRADE SECURITY REQUIREMENTS
        </p>
        <div className="space-y-1">
          {PASSWORD_REQUIREMENTS.map((req) => {
            const passed = req.test(password)
            return (
              <div key={req.id} className="flex items-start gap-1.5 text-[10px]">
                {passed ? (
                  <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <span className={cn(
                  "leading-tight",
                  passed ? "text-green-500 font-medium" : "text-muted-foreground"
                )}>
                  {req.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mission Status */}
      {strength.level === 5 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
          <p className="text-xs font-mono font-semibold text-green-500">
            ✓ CLEARANCE GRANTED - READY FOR MISSION
          </p>
        </div>
      )}
    </div>
  )
}

export { PASSWORD_REQUIREMENTS, calculateStrength }
