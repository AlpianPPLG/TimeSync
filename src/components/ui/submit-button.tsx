"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"
import { ComponentProps } from "react"

export function SubmitButton({
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className={className}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengirim...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
