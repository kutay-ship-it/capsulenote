"use client"

import * as React from "react"
import { MapPin, Plus, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddressFormV3 } from "@/components/v3/address-form-v3"
import {
  listShippingAddresses,
  createVerifiedShippingAddress,
  deleteShippingAddress,
  type ShippingAddress,
  type ShippingAddressInput,
  type AddressVerificationResponse,
} from "@/server/actions/addresses"

interface AddressSelectorV3Props {
  value: string | null
  onChange: (addressId: string | null, address?: ShippingAddress) => void
  disabled?: boolean
}

export function AddressSelectorV3({
  value,
  onChange,
  disabled = false,
}: AddressSelectorV3Props) {
  const [addresses, setAddresses] = React.useState<ShippingAddress[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  // Load addresses on mount
  React.useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    setIsLoading(true)
    try {
      const result = await listShippingAddresses()
      if (result.success) {
        setAddresses(result.data)
        // If we had a selection and it no longer exists, clear it
        if (value && !result.data.find((a) => a.id === value)) {
          onChange(null)
        }
      } else {
        toast.error("Failed to load addresses", {
          description: result.error.message,
        })
      }
    } catch (error) {
      toast.error("Failed to load addresses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddress = async (
    addressData: ShippingAddressInput,
    verification?: AddressVerificationResponse
  ) => {
    setIsSubmitting(true)
    try {
      const result = await createVerifiedShippingAddress(addressData, verification)
      if (result.success) {
        toast.success("Address saved!")
        setAddresses((prev) => [result.data, ...prev])
        setShowAddForm(false)
        // Auto-select the newly created address
        onChange(result.data.id, result.data)
      } else {
        toast.error("Failed to save address", {
          description: result.error.message,
        })
      }
    } catch (error) {
      toast.error("Failed to save address")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteShippingAddress(id)
      if (result.success) {
        toast.success("Address deleted")
        setAddresses((prev) => prev.filter((a) => a.id !== id))
        // Clear selection if we deleted the selected address
        if (value === id) {
          onChange(null)
        }
      } else {
        toast.error("Failed to delete address", {
          description: result.error.message,
        })
      }
    } catch (error) {
      toast.error("Failed to delete address")
    } finally {
      setDeletingId(null)
    }
  }

  const formatAddress = (addr: ShippingAddress) => {
    const parts = [addr.line1]
    if (addr.line2) parts.push(addr.line2)
    parts.push(`${addr.city}, ${addr.state} ${addr.postalCode}`)
    return parts.join(", ")
  }

  const isVerified = (addr: ShippingAddress) => {
    return addr.metadata && (addr.metadata as Record<string, unknown>).verified === true
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-charcoal/20 bg-charcoal/5"
        style={{ borderRadius: "2px" }}
      >
        <Loader2 className="h-4 w-4 animate-spin text-charcoal/50" strokeWidth={2} />
        <span className="font-mono text-xs text-charcoal/50 uppercase tracking-wider">
          Loading addresses...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Address List */}
      {addresses.length > 0 && !showAddForm && (
        <div className="space-y-2">
          {addresses.map((address) => {
            const isSelected = value === address.id
            const verified = isVerified(address)

            return (
              <div
                key={address.id}
                className={cn(
                  "group relative border-2 p-3 cursor-pointer transition-all",
                  isSelected
                    ? "border-teal-primary bg-teal-primary/5 shadow-[2px_2px_0_theme(colors.teal-primary)]"
                    : "border-charcoal bg-white hover:border-teal-primary/50 hover:bg-teal-primary/5",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                style={{ borderRadius: "2px" }}
                onClick={() => {
                  if (!disabled) {
                    onChange(isSelected ? null : address.id, isSelected ? undefined : address)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Radio indicator */}
                  <div
                    className={cn(
                      "flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 mt-0.5",
                      isSelected ? "border-teal-primary bg-teal-primary" : "border-charcoal/40"
                    )}
                    style={{ borderRadius: "50%" }}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 bg-white" style={{ borderRadius: "50%" }} />
                    )}
                  </div>

                  {/* Address info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs font-bold text-charcoal truncate">
                        {address.name}
                      </p>
                      {verified && (
                        <CheckCircle2 className="h-3 w-3 text-teal-primary flex-shrink-0" strokeWidth={2} />
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-charcoal/60 truncate mt-0.5">
                      {formatAddress(address)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-charcoal/40 hover:text-coral hover:bg-coral/10"
                          onClick={(e) => e.stopPropagation()}
                          disabled={disabled || deletingId === address.id}
                        >
                          {deletingId === address.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        className="border-2 border-charcoal bg-white font-mono"
                        style={{
                          borderRadius: "2px",
                          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
                        }}
                      >
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-mono text-xl uppercase tracking-wide text-charcoal">
                            Delete Address?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-mono text-sm text-charcoal/60">
                            This will permanently delete "{address.name}" from your saved addresses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-3">
                          <AlertDialogCancel
                            className="border-2 border-charcoal bg-white hover:bg-off-white font-mono uppercase"
                            style={{ borderRadius: "2px" }}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(address.id)}
                            className="border-2 border-charcoal bg-coral hover:bg-coral/90 text-white font-mono uppercase"
                            style={{ borderRadius: "2px" }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !showAddForm && (
        <div
          className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-charcoal/20 bg-charcoal/5"
          style={{ borderRadius: "2px" }}
        >
          <MapPin className="h-8 w-8 text-charcoal/30" strokeWidth={1.5} />
          <div className="text-center">
            <p className="font-mono text-xs font-bold text-charcoal/50 uppercase tracking-wider">
              No Saved Addresses
            </p>
            <p className="font-mono text-[10px] text-charcoal/40 mt-1">
              Add an address to send physical letters
            </p>
          </div>
        </div>
      )}

      {/* Add Address Form */}
      {showAddForm && (
        <div
          className="border-2 border-duck-yellow bg-duck-yellow/5 p-4"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-charcoal" strokeWidth={2} />
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
              Add New Address
            </p>
          </div>
          <AddressFormV3
            onSubmit={handleAddAddress}
            onCancel={() => setShowAddForm(false)}
            isSubmitting={isSubmitting}
            submitLabel="Save Address"
          />
        </div>
      )}

      {/* Add Address Button */}
      {!showAddForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          disabled={disabled}
          className="w-full h-10 gap-2 border-2 border-dashed border-charcoal/30 bg-transparent hover:bg-duck-yellow/10 hover:border-duck-yellow font-mono text-[10px] uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
          style={{ borderRadius: "2px" }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Add New Address
        </Button>
      )}
    </div>
  )
}
