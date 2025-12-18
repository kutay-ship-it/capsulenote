"use client"

import { useState, useMemo, useCallback, useId } from "react"
import { ChevronsUpDown, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  COUNTRY_GROUPS,
  getCountryConfig,
  type CountryConfig,
} from "@/components/v3/country-data"

// ============================================================================
// COUNTRY OPTION ITEM
// ============================================================================

interface CountryOptionItemProps {
  country: CountryConfig
  isSelected: boolean
  onClick: () => void
}

function CountryOptionItem({
  country,
  isSelected,
  onClick,
}: CountryOptionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all overflow-hidden",
        "hover:bg-duck-yellow/20",
        isSelected && "bg-duck-yellow/30 border-l-4 border-l-charcoal pl-2"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Flag */}
      <span className="text-base shrink-0">{country.flag}</span>

      {/* Country Name - truncated with max width */}
      <span className="font-mono text-sm text-charcoal truncate min-w-0 flex-1">
        {country.name}
      </span>

      {/* Country Code Badge - always visible */}
      <span
        className={cn(
          "shrink-0 ml-auto px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase",
          isSelected ? "bg-charcoal text-white" : "bg-charcoal/10 text-charcoal/70"
        )}
        style={{ borderRadius: "2px" }}
      >
        {country.code}
      </span>
    </button>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CountrySelectorV3Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CountrySelectorV3({
  value,
  onChange,
  disabled = false,
  className,
}: CountrySelectorV3Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const listboxId = useId()

  // Get display info for selected country
  const selectedCountry = useMemo(() => {
    return getCountryConfig(value)
  }, [value])

  // Filter countries based on search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return COUNTRY_GROUPS

    const searchLower = search.toLowerCase()
    return COUNTRY_GROUPS.map((group) => ({
      ...group,
      countries: group.countries.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower)
      ),
    })).filter((group) => group.countries.length > 0)
  }, [search])

  // Handle country selection
  const handleSelect = useCallback(
    (countryCode: string) => {
      onChange(countryCode)
      setOpen(false)
      setSearch("")
    },
    [onChange]
  )

  // Cancel and close
  const handleCancel = useCallback(() => {
    setSearch("")
    setOpen(false)
  }, [])

  // Count total matching countries
  const totalMatches = useMemo(() => {
    return filteredGroups.reduce((acc, group) => acc + group.countries.length, 0)
  }, [filteredGroups])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "group w-full flex items-center gap-3 h-12 px-4 text-left",
            "border-2 border-charcoal bg-white transition-all",
            "hover:shadow-[2px_2px_0_theme(colors.charcoal)] hover:-translate-y-0.5",
            "focus:outline-none focus:shadow-[2px_2px_0_theme(colors.charcoal)]",
            disabled && "opacity-70 cursor-not-allowed",
            className
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Selected Country */}
          {selectedCountry ? (
            <>
              <span className="text-xl shrink-0">{selectedCountry.flag}</span>
              <span className="font-mono text-sm font-bold text-charcoal flex-1 truncate min-w-0">
                {selectedCountry.name}
              </span>
              <span
                className="shrink-0 px-2 py-0.5 bg-charcoal font-mono text-[10px] font-bold text-white uppercase"
                style={{ borderRadius: "2px" }}
              >
                {selectedCountry.code}
              </span>
            </>
          ) : (
            <span className="font-mono text-sm text-charcoal/50 flex-1">
              Select country...
            </span>
          )}

          {/* Chevron */}
          <ChevronsUpDown
            className="h-5 w-5 shrink-0 text-charcoal/50 group-hover:text-charcoal transition-colors"
            strokeWidth={2}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-2 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] overflow-hidden"
        style={{ borderRadius: "2px" }}
        align="start"
        sideOffset={8}
      >
        {/* Search Input */}
        <div className="p-3 border-b-2 border-charcoal bg-off-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full pl-10 pr-10 py-2 font-mono text-sm text-charcoal placeholder:text-charcoal/40 bg-white border-2 border-charcoal focus:outline-none focus:border-duck-blue"
              style={{ borderRadius: "2px" }}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-charcoal"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Country List */}
        <ScrollArea className="h-[320px]">
          <div id={listboxId} role="listbox" className="p-2 overflow-hidden">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center">
                <p className="font-mono text-sm text-charcoal/50">
                  No countries found
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.label} className="mb-3 last:mb-0 overflow-hidden">
                  {/* Group Header */}
                  <div
                    className="sticky top-0 z-10 px-3 py-1.5 mb-1 bg-duck-cream font-mono text-[10px] font-bold text-charcoal/70 uppercase tracking-wider"
                    style={{ borderRadius: "2px" }}
                  >
                    {group.label}
                  </div>

                  {/* Group Items */}
                  <div className="overflow-hidden">
                    {group.countries.map((country) => (
                      <CountryOptionItem
                        key={country.code}
                        country={country}
                        isSelected={value === country.code}
                        onClick={() => handleSelect(country.code)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t-2 border-charcoal bg-off-white flex items-center justify-between">
          <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
            {totalMatches} countries
          </span>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal bg-white hover:bg-coral/20 transition-colors"
            style={{ borderRadius: "2px" }}
          >
            Cancel
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
