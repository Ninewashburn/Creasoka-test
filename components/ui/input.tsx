import * as React from "react";

import { cn } from "@/lib/utils";

// S'assurer que l'input a toujours une valeur définie soit par l'utilisateur soit vide
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, ...props }, ref) => {
    // Assurer que la valeur n'est jamais undefined mais une chaîne vide
    const definedValue = value === undefined ? "" : value;

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        value={definedValue}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
