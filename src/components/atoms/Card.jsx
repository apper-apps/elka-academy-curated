import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("card", className)}
      {...props}
    />
  );
});

Card.displayName = "Card";

export default Card;