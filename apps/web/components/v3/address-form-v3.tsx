"use client"

import * as React from "react"
import { CheckCircle2, AlertTriangle, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  verifyShippingAddress,
  type AddressVerificationResponse,
  type ShippingAddressInput,
} from "@/server/actions/addresses"

// US states for dropdown
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "Washington DC" },
]

interface AddressFormV3Props {
  initialData?: Partial<ShippingAddressInput>
  onSubmit: (address: ShippingAddressInput, verification?: AddressVerificationResponse) => void
  onCancel?: () => void
  isSubmitting?: boolean
  showNameField?: boolean
  submitLabel?: string
}

export function AddressFormV3({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showNameField = true,
  submitLabel = "Save Address",
}: AddressFormV3Props) {
  // Form state
  const [name, setName] = React.useState(initialData?.name || "")
  const [line1, setLine1] = React.useState(initialData?.line1 || "")
  const [line2, setLine2] = React.useState(initialData?.line2 || "")
  const [city, setCity] = React.useState(initialData?.city || "")
  const [state, setState] = React.useState(initialData?.state || "")
  const [postalCode, setPostalCode] = React.useState(initialData?.postalCode || "")
  const country = "US" // Currently only supporting US addresses

  // Verification state
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verification, setVerification] = React.useState<AddressVerificationResponse | null>(null)
  const [showSuggestion, setShowSuggestion] = React.useState(false)

  // Validation errors
  const [errors, setErrors] = React.useState<Partial<Record<keyof ShippingAddressInput, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (showNameField && !name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!line1.trim()) {
      newErrors.line1 = "Address is required"
    }
    if (!city.trim()) {
      newErrors.city = "City is required"
    }
    if (!state) {
      newErrors.state = "State is required"
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = "ZIP code is required"
    } else if (!/^\d{5}(-\d{4})?$/.test(postalCode)) {
      newErrors.postalCode = "Invalid ZIP code format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerify = async () => {
    if (!validateForm()) return

    setIsVerifying(true)
    setVerification(null)
    setShowSuggestion(false)

    try {
      const result = await verifyShippingAddress({
        line1,
        line2: line2 || undefined,
        city,
        state,
        postalCode,
        country,
      })

      if (result.success) {
        setVerification(result.data)

        if (result.data.isValid) {
          // Check if there's a suggested address that differs
          if (result.data.suggestedAddress) {
            const suggested = result.data.suggestedAddress
            const hasDifference =
              suggested.line1.toUpperCase() !== line1.toUpperCase() ||
              suggested.city.toUpperCase() !== city.toUpperCase() ||
              suggested.state.toUpperCase() !== state.toUpperCase() ||
              suggested.postalCode !== postalCode

            if (hasDifference) {
              setShowSuggestion(true)
            } else {
              toast.success("Address verified successfully!")
            }
          } else {
            toast.success("Address verified successfully!")
          }
        } else {
          toast.error("Address may not be deliverable", {
            description: result.data.error || "Please check the address and try again.",
          })
        }
      } else {
        toast.error("Verification failed", {
          description: result.error.message,
        })
      }
    } catch (error) {
      toast.error("Verification error", {
        description: "Please try again later.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleUseSuggested = () => {
    if (verification?.suggestedAddress) {
      const suggested = verification.suggestedAddress
      setLine1(suggested.line1)
      setLine2(suggested.line2 || "")
      setCity(suggested.city)
      setState(suggested.state)
      setPostalCode(suggested.postalCode)
      setShowSuggestion(false)
      toast.success("Address updated with suggestion")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    const addressData: ShippingAddressInput = {
      name: showNameField ? name : "Recipient",
      line1,
      line2: line2 || undefined,
      city,
      state,
      postalCode,
      country,
    }

    onSubmit(addressData, verification || undefined)
  }

  const clearField = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
    // Clear verification when address changes
    if (verification) {
      setVerification(null)
      setShowSuggestion(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      {showNameField && (
        <div className="space-y-1.5">
          <label
            htmlFor="address-name"
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
          >
            Recipient Name
          </label>
          <Input
            id="address-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              clearField("name")
            }}
            placeholder="John Doe"
            className="border-2 border-charcoal font-mono text-sm"
            style={{ borderRadius: "2px" }}
            aria-invalid={!!errors.name}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="font-mono text-xs text-coral">{errors.name}</p>
          )}
        </div>
      )}

      {/* Address Line 1 */}
      <div className="space-y-1.5">
        <label
          htmlFor="address-line1"
          className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
        >
          Street Address
        </label>
        <Input
          id="address-line1"
          value={line1}
          onChange={(e) => {
            setLine1(e.target.value)
            clearField("line1")
          }}
          placeholder="123 Main Street"
          className="border-2 border-charcoal font-mono text-sm"
          style={{ borderRadius: "2px" }}
          aria-invalid={!!errors.line1}
          disabled={isSubmitting}
        />
        {errors.line1 && (
          <p className="font-mono text-xs text-coral">{errors.line1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-1.5">
        <label
          htmlFor="address-line2"
          className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
        >
          Apt, Suite, Unit (Optional)
        </label>
        <Input
          id="address-line2"
          value={line2}
          onChange={(e) => {
            setLine2(e.target.value)
            clearField("line2")
          }}
          placeholder="Apt 4B"
          className="border-2 border-charcoal font-mono text-sm"
          style={{ borderRadius: "2px" }}
          disabled={isSubmitting}
        />
      </div>

      {/* City and State Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="address-city"
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
          >
            City
          </label>
          <Input
            id="address-city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value)
              clearField("city")
            }}
            placeholder="San Francisco"
            className="border-2 border-charcoal font-mono text-sm"
            style={{ borderRadius: "2px" }}
            aria-invalid={!!errors.city}
            disabled={isSubmitting}
          />
          {errors.city && (
            <p className="font-mono text-xs text-coral">{errors.city}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="address-state"
            className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
          >
            State
          </label>
          <Select
            value={state}
            onValueChange={(value) => {
              setState(value)
              clearField("state")
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="address-state"
              className={cn(
                "border-2 border-charcoal font-mono text-sm",
                errors.state && "border-coral"
              )}
              style={{ borderRadius: "2px" }}
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="font-mono text-xs text-coral">{errors.state}</p>
          )}
        </div>
      </div>

      {/* ZIP Code */}
      <div className="space-y-1.5">
        <label
          htmlFor="address-zip"
          className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
        >
          ZIP Code
        </label>
        <Input
          id="address-zip"
          value={postalCode}
          onChange={(e) => {
            setPostalCode(e.target.value)
            clearField("postalCode")
          }}
          placeholder="94102"
          className="border-2 border-charcoal font-mono text-sm w-32"
          style={{ borderRadius: "2px" }}
          aria-invalid={!!errors.postalCode}
          disabled={isSubmitting}
          maxLength={10}
        />
        {errors.postalCode && (
          <p className="font-mono text-xs text-coral">{errors.postalCode}</p>
        )}
      </div>

      {/* Verification Status */}
      {verification && (
        <div
          className={cn(
            "flex items-start gap-3 p-3 border-2",
            verification.isValid
              ? "border-teal-primary bg-teal-primary/10"
              : "border-coral bg-coral/10"
          )}
          style={{ borderRadius: "2px" }}
        >
          {verification.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-teal-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
          ) : (
            <AlertTriangle className="h-4 w-4 text-coral flex-shrink-0 mt-0.5" strokeWidth={2} />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs font-bold text-charcoal">
              {verification.isValid ? "Address Verified" : "Address Issue"}
            </p>
            <p className="font-mono text-[10px] text-charcoal/70">
              {verification.isValid
                ? "This address is deliverable"
                : verification.error || "Address may not be deliverable"}
            </p>
          </div>
        </div>
      )}

      {/* Address Suggestion */}
      {showSuggestion && verification?.suggestedAddress && (
        <div
          className="border-2 border-duck-yellow bg-duck-yellow/10 p-3 space-y-2"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-charcoal flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold text-charcoal">
                Suggested Address Format
              </p>
              <p className="font-mono text-[10px] text-charcoal/70 mt-1">
                {verification.suggestedAddress.line1}
                {verification.suggestedAddress.line2 && (
                  <>, {verification.suggestedAddress.line2}</>
                )}
                <br />
                {verification.suggestedAddress.city}, {verification.suggestedAddress.state}{" "}
                {verification.suggestedAddress.postalCode}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleUseSuggested}
              className="h-8 text-[10px] bg-duck-yellow hover:bg-duck-yellow/80 text-charcoal border-2 border-charcoal"
              style={{ borderRadius: "2px" }}
            >
              Use Suggested
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowSuggestion(false)}
              className="h-8 text-[10px] border-2 border-charcoal"
              style={{ borderRadius: "2px" }}
            >
              Keep Original
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleVerify}
          disabled={isVerifying || isSubmitting}
          className="h-10 gap-2 border-2 border-charcoal bg-white hover:bg-duck-blue/20 font-mono text-[10px] uppercase tracking-wider"
          style={{ borderRadius: "2px" }}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
              Verify
            </>
          )}
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-10 gap-2 font-mono text-[10px] uppercase tracking-wider"
          style={{ borderRadius: "2px" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 font-mono text-[10px] uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
