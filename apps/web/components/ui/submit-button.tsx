"use client"

import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "./button"
import { cn } from "@/lib/utils"

interface SubmitButtonProps extends ButtonProps {
  pendingText?: string
}

export function SubmitButton({
  children,
  pendingText,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn(pending && "opacity-70", className)}
      {...props}
    >
      {pending && pendingText ? pendingText : children}
    </Button>
  )
}
