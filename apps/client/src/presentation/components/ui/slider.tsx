import { type ComponentProps } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({ className, ref, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center",
        props.orientation === "vertical" ? "h-full flex-col w-1.5" : "w-full h-1.5",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className={cn(
        "relative grow overflow-hidden rounded-full bg-primary/20",
        props.orientation === "vertical" ? "w-full h-full" : "h-full w-full"
      )}>
        <SliderPrimitive.Range className={cn(
          "absolute bg-primary",
          props.orientation === "vertical" ? "w-full bottom-0" : "h-full"
        )} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
}

export { Slider }
