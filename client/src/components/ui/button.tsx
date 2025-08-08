import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transition-all duration-300 ease-out font-['Poppins'] tracking-tight",
  {
    variants: {
      variant: {
        default: "bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#F0C646] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-[1.02] active:scale-[0.98] font-semibold",
        secondary: "bg-transparent border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0B0B0B] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-[1.02] active:scale-[0.98] font-medium",
        destructive:
          "bg-[#FF4757] text-white hover:bg-[#FF3742] hover:shadow-[0_0_20px_rgba(255,71,87,0.3)] hover:scale-[1.02] active:scale-[0.98] font-medium",
        outline:
          "border border-[#2A2A2A] bg-transparent text-[#B8B8B8] hover:bg-[#1A1A1A] hover:text-white hover:border-[#D4AF37] hover:scale-[1.02] active:scale-[0.98] font-medium",
        ghost: "bg-transparent text-[#B8B8B8] hover:bg-[#1A1A1A] hover:text-white hover:scale-[1.02] active:scale-[0.98]",
        link: "text-[#D4AF37] underline-offset-4 hover:underline hover:text-[#F0C646] font-medium",
        premium: "bg-gradient-to-r from-[#D4AF37] to-[#00E5FF] text-[#0B0B0B] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] font-semibold",
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
