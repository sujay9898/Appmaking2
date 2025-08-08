import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-200 ease-in-out font-['Inter'] tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-[#3c595d] text-[#ffffff] hover:bg-[#4a6b70] hover:shadow-[0_0_10px_rgba(60,89,93,0.3)] hover:scale-[1.01] active:scale-[0.99] font-medium",
        secondary: "bg-transparent border border-[#3c595d] text-[#ffffff] hover:bg-[#3c595d] hover:text-[#ffffff] hover:scale-[1.01] active:scale-[0.99] font-medium",
        destructive:
          "bg-[#DC2626] text-[#ffffff] hover:bg-[#B91C1C] hover:scale-[1.01] active:scale-[0.99] font-medium",
        outline:
          "border border-[#3c595d] bg-transparent text-[#ffffff] hover:bg-[#3c595d] hover:text-[#ffffff] hover:border-[#4a6b70] hover:scale-[1.01] active:scale-[0.99] font-medium",
        ghost: "bg-transparent text-[#ffffff] hover:bg-[#3c595d] hover:text-[#ffffff] hover:scale-[1.01] active:scale-[0.99]",
        link: "text-[#ffffff] underline-offset-4 hover:underline hover:text-[#e0e0e0] font-medium",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm rounded-[2px]",
        sm: "h-9 px-4 py-2 text-sm rounded-[2px]",
        lg: "h-12 px-8 py-3 text-base rounded-[2px]",
        xl: "h-14 px-10 py-4 text-lg rounded-[2px]",
        icon: "h-11 w-11 rounded-[2px]",
        "icon-sm": "h-9 w-9 rounded-[2px]",
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
