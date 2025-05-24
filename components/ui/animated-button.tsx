import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { forwardRef, useState, useEffect, ButtonHTMLAttributes } from "react";

type Direction = "forward" | "backward" | "success";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: Direction;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isSuccess?: boolean;
  asChild?: boolean;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      direction = "forward",
      children,
      className,
      variant = "default",
      size = "default",
      isSuccess = false,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
      if (isSuccess && !showSuccess) {
        setIsAnimating(true);
        const timer = setTimeout(() => {
          setShowSuccess(true);
          setIsAnimating(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [isSuccess, showSuccess]);

    const renderIcon = () => {
      if (showSuccess) {
        return (
          <Check
            className={cn(
              "ml-2 h-4 w-4 text-green-500 animate-in zoom-in-95"
            )}
            aria-hidden="true"
          />
        );
      }

      if (direction === "backward") {
        return (
          <ArrowLeft
            className={cn(
              "mr-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            )}
            aria-hidden="true"
          />
        );
      }

      if (direction === "forward") {
        return (
          <ArrowRight
            className={cn(
              "ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
            )}
            aria-hidden="true"
          />
        );
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "group relative overflow-hidden inline-flex items-center",
          isAnimating && "animate-pulse",
          className
        )}
        {...props}
      >
        {direction === "backward" && renderIcon()}
        <span className={cn(showSuccess && "text-green-600 dark:text-green-400")}>
          {children}
        </span>
        {direction !== "backward" && renderIcon()}
        
        {isSuccess && (
          <span 
            className={cn(
              "absolute inset-0 bg-green-500/10 dark:bg-green-900/20",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}
            style={{
              mask: 'radial-gradient(circle at center, black 0%, transparent 70%)',
              WebkitMask: 'radial-gradient(circle at center, black 0%, transparent 70%)',
            }}
          />
        )}
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";
