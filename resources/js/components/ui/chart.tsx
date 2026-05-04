// Shadcn-compatible chart utilities
import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<string, string>
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be inside <ChartContainer />")
  return context
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & { config: ChartConfig; children: React.ReactNode }) {
  const chartId = React.useId()
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        id={id || chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<"div"> & {
  active?: boolean
  payload?: Array<{ name?: string; value?: number | string; fill?: string; color?: string; dataKey?: string; payload?: Record<string, unknown> }>
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  label?: string
  labelFormatter?: (label: string, payload: unknown[]) => React.ReactNode
  labelClassName?: string
  formatter?: (value: number | string, name: string, item: unknown, index: number, payload: unknown) => React.ReactNode
  color?: string
  nameKey?: string
  labelKey?: string
}) {
  const { config } = useChart()

  if (!active || !payload?.length) return null

  const tooltipLabel = hideLabel ? null : (
    <div className={cn("font-medium", labelClassName)}>
      {labelFormatter ? labelFormatter(label ?? "", payload) : label}
    </div>
  )

  return (
    <div className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {tooltipLabel}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = nameKey ? (item.payload as Record<string, unknown>)?.[nameKey] as string : (item.dataKey ?? item.name ?? "value")
          const itemConfig = config[key as string] ?? {}
          const indicatorColor = color ?? item.fill ?? item.color

          return (
            <div key={item.dataKey} className="flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground">
              {!hideIndicator && (
                <div
                  className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                    "my-0.5": indicator === "dot",
                    "w-1": indicator === "line" || indicator === "dashed",
                    "border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                    "h-2.5 w-2.5": indicator === "dot",
                  })}
                  style={{ "--color-bg": indicatorColor, "--color-border": indicatorColor } as React.CSSProperties}
                />
              )}
              <div className="flex flex-1 justify-between leading-none items-center">
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">{itemConfig.label ?? item.name}</span>
                </div>
                {item.value !== undefined && (
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatter ? formatter(item.value, item.name ?? "", item, index, item.payload) : item.value.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartTooltipContent as ChartTooltip }
