import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-green text-white hover:brightness-110 hover:shadow-lg active:scale-95 shadow-sm transition-all",
        destructive:
          "bg-error-button text-white hover:brightness-110 hover:shadow-lg active:scale-95 shadow-sm transition-all",
        outline:
          "border border-border-gray bg-transparent hover:bg-surface-light text-text-primary active:scale-95 transition-all",
        secondary:
          "bg-secondary-navy text-white hover:brightness-125 active:scale-95 transition-all",
        ghost: "hover:bg-surface-light text-text-primary hover:brightness-110 active:scale-95 transition-all",
        link: "text-primary-green underline-offset-4 hover:underline active:opacity-70 transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
