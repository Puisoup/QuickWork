import { Fragment } from "react"

/**
 * QuickWork-Flow: Gutachten → dann Angebote (USP über UI).
 */
export function RequestFlowProgress({
  status,
  hasFramework,
}: {
  status: string
  hasFramework: boolean
}) {
  const steps = [
    { key: "in", label: "Eingang" },
    { key: "gw", label: "Gutachten" },
    { key: "bid", label: "Angebote" },
    { key: "end", label: "Abschluss" },
  ] as const

  let activeIndex = 1
  if (status === "DONE") activeIndex = 3
  else if (status === "BIDDING" && hasFramework) activeIndex = 2
  else if (status === "OPEN") activeIndex = 1

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-zinc-800">
      <div className="flex w-full items-center">
        {steps.map((step, i) => (
          <Fragment key={step.key}>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  i < activeIndex
                    ? "bg-yellow-500 text-white"
                    : i === activeIndex
                      ? "bg-yellow-400 text-black ring-2 ring-yellow-500/50 dark:text-black"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                }`}
              >
                {i < activeIndex ? "✓" : i + 1}
              </span>
              <span
                className={`mt-1.5 max-w-[4.5rem] truncate text-[10px] font-medium sm:max-w-none sm:text-xs ${
                  i <= activeIndex ? "text-gray-800 dark:text-gray-200" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mb-6 h-0.5 min-w-[8px] flex-1 sm:min-w-[12px] ${i < activeIndex ? "bg-yellow-500" : "bg-zinc-200 dark:bg-zinc-700"}`}
                aria-hidden
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
