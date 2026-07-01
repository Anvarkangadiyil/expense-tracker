"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-8 shadow-elevation-2 space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-heading-3 font-bold tracking-tight text-ink">
            Something went wrong
          </h1>
          <p className="text-xs text-ink-muted leading-relaxed">
            An unexpected error occurred in this application view. If this issue persists, please contact support.
          </p>
          {error.message && (
            <div className="bg-canvas-soft/80 border border-hairline/60 rounded p-3 text-3xs text-ink-secondary font-mono break-all max-h-24 overflow-y-auto mt-2 text-left italic">
              Error: {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
          <Button
            onClick={() => reset()}
            className="bg-primary text-white hover:bg-primary-active h-9 px-4 text-xs font-semibold gap-1.5 rounded-md flex items-center justify-center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-9 px-4 border-hairline hover:bg-canvas-soft text-xs font-semibold"
          >
            <Link href="/" className="flex items-center gap-1.5 justify-center">
              <Home className="h-3.5 w-3.5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
