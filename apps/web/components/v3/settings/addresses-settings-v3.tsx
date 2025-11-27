"use client"

import { useState, useTransition } from "react"
import { MapPin, Plus, Pencil, Trash2, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SettingsCardV3 } from "@/components/v3/settings/settings-card-v3"
import { AddressFormV3 } from "@/components/v3/address-form-v3"
import { getCountryConfig } from "@/components/v3/country-data"
import {
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  type ShippingAddress,
  type ShippingAddressInput,
  type AddressVerificationResponse,
} from "@/server/actions/addresses"

interface AddressesSettingsV3Props {
  initialAddresses: ShippingAddress[]
}

export function AddressesSettingsV3({ initialAddresses }: AddressesSettingsV3Props) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>(initialAddresses)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAddAddress = async (
    data: ShippingAddressInput,
    verification?: AddressVerificationResponse
  ) => {
    startTransition(async () => {
      const result = await createShippingAddress(data)
      if (result.success) {
        setAddresses((prev) => [result.data, ...prev])
        setIsAdding(false)
        toast.success("Address saved successfully")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  const handleUpdateAddress = async (
    id: string,
    data: ShippingAddressInput,
    verification?: AddressVerificationResponse
  ) => {
    startTransition(async () => {
      const result = await updateShippingAddress(id, data)
      if (result.success) {
        setAddresses((prev) =>
          prev.map((addr) => (addr.id === id ? result.data : addr))
        )
        setEditingId(null)
        toast.success("Address updated successfully")
      } else {
        toast.error(result.error.message)
      }
    })
  }

  const handleDeleteAddress = async (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteShippingAddress(id)
      if (result.success) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== id))
        toast.success("Address deleted")
      } else {
        toast.error(result.error.message)
      }
      setDeletingId(null)
    })
  }

  const formatAddress = (address: ShippingAddress) => {
    const parts = [address.line1]
    if (address.line2) parts.push(address.line2)
    parts.push(`${address.city}${address.state ? `, ${address.state}` : ""} ${address.postalCode}`)
    return parts
  }

  const getEditingAddress = () => {
    if (!editingId) return undefined
    const addr = addresses.find((a) => a.id === editingId)
    if (!addr) return undefined
    return {
      name: addr.name,
      line1: addr.line1,
      line2: addr.line2 || undefined,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    }
  }

  return (
    <>
      {/* Saved Addresses */}
      <SettingsCardV3
        icon={<MapPin className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Saved Addresses"
        badgeBg="bg-duck-blue"
        badgeText="text-charcoal"
        actions={
          !isAdding && !editingId && (
            <Button
              type="button"
              onClick={() => setIsAdding(true)}
              className="h-8 gap-2 font-mono text-[10px] uppercase tracking-wider bg-charcoal text-white hover:bg-charcoal/90"
              style={{ borderRadius: "2px" }}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add Address
            </Button>
          )
        }
      >
        {/* Add New Address Form */}
        {isAdding && (
          <div
            className="border-2 border-dashed border-charcoal/30 bg-off-white p-4"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-4">
              New Address
            </p>
            <AddressFormV3
              onSubmit={handleAddAddress}
              onCancel={() => setIsAdding(false)}
              isSubmitting={isPending}
              submitLabel="Save Address"
            />
          </div>
        )}

        {/* Edit Address Form */}
        {editingId && (
          <div
            className="border-2 border-duck-yellow bg-duck-yellow/10 p-4"
            style={{ borderRadius: "2px" }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-4">
              Edit Address
            </p>
            <AddressFormV3
              initialData={getEditingAddress()}
              onSubmit={(data, verification) =>
                handleUpdateAddress(editingId, data, verification)
              }
              onCancel={() => setEditingId(null)}
              isSubmitting={isPending}
              submitLabel="Update Address"
            />
          </div>
        )}

        {/* Address List */}
        {!isAdding && !editingId && addresses.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 mx-auto text-charcoal/20 mb-3" strokeWidth={1.5} />
            <p className="font-mono text-sm text-charcoal/50">
              No saved addresses yet
            </p>
            <p className="font-mono text-xs text-charcoal/40 mt-1">
              Add an address to use for physical letter deliveries
            </p>
          </div>
        )}

        {!isAdding && !editingId && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((address) => {
              const countryConfig = getCountryConfig(address.country)
              const isDeleting = deletingId === address.id

              return (
                <div
                  key={address.id}
                  className={cn(
                    "flex items-start gap-4 border-2 border-charcoal/20 bg-white p-4 transition-all",
                    "hover:border-charcoal/40"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Flag */}
                  <span className="text-2xl shrink-0 mt-0.5">
                    {countryConfig?.flag || "🌍"}
                  </span>

                  {/* Address Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-sm font-bold text-charcoal truncate">
                        {address.name}
                      </p>
                      {address.metadata &&
                        (address.metadata as Record<string, unknown>).verified && (
                          <div
                            className="flex items-center gap-1 px-1.5 py-0.5 bg-teal-primary/10 text-teal-primary"
                            style={{ borderRadius: "2px" }}
                          >
                            <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                            <span className="font-mono text-[9px] font-bold uppercase">
                              Verified
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="space-y-0.5">
                      {formatAddress(address).map((line, i) => (
                        <p
                          key={i}
                          className="font-mono text-xs text-charcoal/70 truncate"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                    <p className="font-mono text-[10px] text-charcoal/40 uppercase mt-2">
                      {countryConfig?.name || address.country}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(address.id)}
                      disabled={isPending}
                      className="h-8 w-8 p-0 text-charcoal/50 hover:text-charcoal hover:bg-duck-yellow/20"
                      style={{ borderRadius: "2px" }}
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(address.id)}
                      disabled={isPending || isDeleting}
                      className="h-8 w-8 p-0 text-charcoal/50 hover:text-coral hover:bg-coral/10"
                      style={{ borderRadius: "2px" }}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SettingsCardV3>

      {/* Info Card */}
      <SettingsCardV3
        icon={<CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />}
        title="Address Verification"
        badgeBg="bg-teal-primary"
        badgeText="text-white"
      >
        <p className="font-mono text-xs text-charcoal/60">
          We verify addresses to ensure successful delivery of your physical letters.
          Verified addresses show a green checkmark.
        </p>
        <div
          className="border-2 border-dashed border-charcoal/20 bg-off-white p-4"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-2">
            Supported Countries
          </p>
          <p className="font-mono text-xs text-charcoal/60">
            We currently support physical mail delivery to the United States, Canada,
            United Kingdom, and Australia. More countries coming soon!
          </p>
        </div>
      </SettingsCardV3>
    </>
  )
}
