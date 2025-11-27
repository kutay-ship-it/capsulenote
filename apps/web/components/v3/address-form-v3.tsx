"use client"

import * as React from "react"
import { CheckCircle2, AlertTriangle, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { postcodeValidator } from "postcode-validator"

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
import {
  getCountryConfig,
  hasStateDropdown,
  getStatesForCountry,
  DEFAULT_COUNTRY,
} from "@/components/v3/country-data"
import { CountrySelectorV3 } from "@/components/v3/country-selector-v3"

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
  const [country, setCountry] = React.useState(initialData?.country || DEFAULT_COUNTRY)
  const [line1, setLine1] = React.useState(initialData?.line1 || "")
  const [line2, setLine2] = React.useState(initialData?.line2 || "")
  const [city, setCity] = React.useState(initialData?.city || "")
  const [state, setState] = React.useState(initialData?.state || "")
  const [postalCode, setPostalCode] = React.useState(initialData?.postalCode || "")

  // Get current country config
  const countryConfig = React.useMemo(() => getCountryConfig(country), [country])
  const stateOptions = React.useMemo(() => getStatesForCountry(country), [country])
  const showStateDropdown = hasStateDropdown(country)
  const showStateField = countryConfig?.stateLabel !== null

  // Verification state
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [verification, setVerification] = React.useState<AddressVerificationResponse | null>(null)
  const [showSuggestion, setShowSuggestion] = React.useState(false)

  // Validation errors
  const [errors, setErrors] = React.useState<Partial<Record<keyof ShippingAddressInput, string>>>({})

  // Reset state when country changes
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setState("") // Reset state when country changes
    setVerification(null)
    setShowSuggestion(false)
    // Clear any state-related errors
    if (errors.state) {
      setErrors({ ...errors, state: undefined })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    const config = getCountryConfig(country)

    if (showNameField && !name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!line1.trim()) {
      newErrors.line1 = "Address is required"
    }
    if (!city.trim()) {
      newErrors.city = "City is required"
    }

    // State validation - only if required for this country
    if (config?.requiresState && !state.trim()) {
      newErrors.state = `${config.stateLabel || "State"} is required`
    }

    // Postal code validation using postcode-validator
    if (!postalCode.trim()) {
      newErrors.postalCode = `${config?.postalLabel || "Postal code"} is required`
    } else {
      try {
        const isValidPostal = postcodeValidator(postalCode, country)
        if (!isValidPostal) {
          newErrors.postalCode = `Invalid ${config?.postalLabel || "postal code"} format`
        }
      } catch {
        // If postcode-validator doesn't support the country, accept any format
        // This is a fallback for countries not in the library
      }
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
        state: state || undefined,
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
              (suggested.state && suggested.state.toUpperCase() !== state.toUpperCase()) ||
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
      if (suggested.state) setState(suggested.state)
      setPostalCode(suggested.postalCode)
      setShowSuggestion(false)
      toast.success("Address updated with suggestion")
    }
  }

  const handleSubmit = () => {
    if (!validateForm() || isSubmitting) return

    const addressData: ShippingAddressInput = {
      name: showNameField ? name : "Recipient",
      line1,
      line2: line2 || undefined,
      city,
      state: state || "",
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
    <div className="space-y-4">
      {/* Country Selector - TOP, prominent, searchable */}
      <div className="space-y-1.5">
        <label
          htmlFor="address-country"
          className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
        >
          Country
        </label>
        <CountrySelectorV3
          value={country}
          onChange={handleCountryChange}
          disabled={isSubmitting}
        />
      </div>

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
      <div className={cn("grid gap-3", showStateField ? "grid-cols-2" : "grid-cols-1")}>
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

        {/* State/Province Field - Conditional based on country */}
        {showStateField && (
          <div className="space-y-1.5">
            <label
              htmlFor="address-state"
              className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
            >
              {countryConfig?.stateLabel || "State"}
              {!countryConfig?.requiresState && (
                <span className="text-charcoal/40 ml-1">(Optional)</span>
              )}
            </label>

            {showStateDropdown ? (
              // Dropdown for countries with predefined states
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
                    "h-[54px] border-2 border-charcoal bg-white px-6 font-mono text-sm",
                    errors.state && "border-coral"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent
                  className="border-2 border-charcoal bg-white font-mono max-h-[240px]"
                  style={{ borderRadius: "2px" }}
                >
                  {stateOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="font-mono text-sm">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // Free text input for other countries
              <Input
                id="address-state"
                value={state}
                onChange={(e) => {
                  setState(e.target.value)
                  clearField("state")
                }}
                placeholder={countryConfig?.stateLabel || "State/Province"}
                className={cn(
                  "border-2 border-charcoal font-mono text-sm",
                  errors.state && "border-coral"
                )}
                style={{ borderRadius: "2px" }}
                aria-invalid={!!errors.state}
                disabled={isSubmitting}
              />
            )}
            {errors.state && (
              <p className="font-mono text-xs text-coral">{errors.state}</p>
            )}
          </div>
        )}
      </div>

      {/* Postal Code */}
      <div className="space-y-1.5">
        <label
          htmlFor="address-postal"
          className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/70"
        >
          {countryConfig?.postalLabel || "Postal Code"}
        </label>
        <div className="flex items-center gap-3">
          <Input
            id="address-postal"
            value={postalCode}
            onChange={(e) => {
              setPostalCode(e.target.value)
              clearField("postalCode")
            }}
            placeholder={countryConfig?.postalPlaceholder || "12345"}
            className={cn(
              "border-2 border-charcoal font-mono text-sm w-40",
              errors.postalCode && "border-coral"
            )}
            style={{ borderRadius: "2px" }}
            aria-invalid={!!errors.postalCode}
            disabled={isSubmitting}
          />
          {/* Format hint */}
          {countryConfig?.postalPlaceholder && (
            <span className="font-mono text-[10px] text-charcoal/40">
              e.g., {countryConfig.postalPlaceholder}
            </span>
          )}
        </div>
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
                {verification.suggestedAddress.city}
                {verification.suggestedAddress.state && (
                  <>, {verification.suggestedAddress.state}</>
                )}{" "}
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
          type="button"
          onClick={handleSubmit}
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
    </div>
  )
}
