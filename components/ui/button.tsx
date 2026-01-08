import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-medium sm:text-base lg:text-lg xl:text-lg 2xl:text-xl transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:aria-disabled [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-visible:shadow-lg aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] touch-target cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] active:shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] active:shadow-sm focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] active:shadow-sm dark:bg-card/50 dark:border-border/80 dark:hover:bg-accent/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] active:shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.05] active:scale-[0.95] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
      },
      size: {
        // FIX: All sizes now meet minimum touch target requirements (44px iOS, 48px Android)
        // Using 44px minimum for better cross-platform compatibility
        default: "h-11 px-4 py-2 has-[>svg]:px-3 min-h-[44px] min-w-[44px]",
        sm: "h-10 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5 min-h-[44px] min-w-[44px]",
        lg: "h-12 rounded-lg px-6 has-[>svg]:px-4 min-h-[48px] min-w-[48px]",
        icon: "h-16 w-16 sm:h-16 sm:w-16 min-h-[56px] min-w-[56px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
