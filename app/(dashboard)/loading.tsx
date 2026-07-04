export default function Loading() {
  return (
    <div className="space-y-6">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-40 rounded bg-surface animate-pulse" />
          <div className="h-4 w-60 rounded bg-surface animate-pulse" />
        </div>

        {/* Metrics Cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-3">
              <div className="h-3 w-28 rounded bg-canvas-soft animate-pulse" />
              <div className="h-8 w-36 rounded bg-canvas-soft animate-pulse" />
            </div>
          ))}
        </div>

        {/* Analytics & Quick Add Form skeleton */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-hairline bg-surface p-6 shadow-elevation-1 h-[350px] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-canvas-soft animate-pulse" />
              <div className="h-3 w-48 rounded bg-canvas-soft animate-pulse" />
            </div>
            <div className="flex-1 w-full bg-canvas-soft/30 rounded mt-4 animate-pulse" />
          </div>

          <div className="rounded-lg border border-hairline bg-surface shadow-elevation-1 h-[350px] flex flex-col">
            <div className="flex border-b border-hairline text-sm">
              <div className="flex-1 py-3 bg-canvas-soft/20 animate-pulse border-r border-hairline" />
              <div className="flex-1 py-3 bg-canvas-soft/20 animate-pulse" />
            </div>
            <div className="flex-1 p-5 space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-canvas-soft animate-pulse" />
                <div className="h-9 w-full rounded bg-canvas-soft animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 rounded bg-canvas-soft animate-pulse" />
                <div className="h-9 w-full rounded bg-canvas-soft animate-pulse" />
              </div>
              <div className="h-9 w-full rounded bg-canvas-soft/80 animate-pulse mt-6" />
            </div>
          </div>
        </div>

        {/* Transactions list skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div className="h-5 w-28 rounded bg-surface animate-pulse" />
            <div className="h-8 w-48 rounded bg-surface animate-pulse" />
          </div>
          <div className="rounded-lg border border-hairline bg-surface p-6 shadow-elevation-1 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-hairline pb-3 last:border-0 last:pb-0">
                <div className="flex gap-4 items-center">
                  <div className="h-6 w-12 rounded bg-canvas-soft animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 rounded bg-canvas-soft animate-pulse" />
                    <div className="h-3 w-20 rounded bg-canvas-soft animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-16 rounded bg-canvas-soft animate-pulse" />
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
