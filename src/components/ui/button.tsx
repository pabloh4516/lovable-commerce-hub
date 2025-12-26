import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted shadow-sm",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-lg",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md",
        gradient: "bg-gradient-to-r from-primary to-[hsl(250,83%,60%)] text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-glow",
        gradientSuccess: "bg-gradient-to-r from-success to-[hsl(160,84%,39%)] text-success-foreground hover:opacity-90 shadow-lg",
        numpad: "bg-secondary hover:bg-muted border border-border text-xl font-semibold",
        payment: "bg-secondary border-2 border-transparent hover:border-primary text-foreground font-medium",
        paymentSelected: "bg-primary/10 border-2 border-primary text-foreground font-medium",
        quickAction: "flex flex-col items-center justify-center gap-2 bg-secondary hover:bg-muted border border-border",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
        iconLg: "h-12 w-12",
        numpad: "h-14 w-14",
        payment: "h-20 px-6",
        quickAction: "h-24 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
