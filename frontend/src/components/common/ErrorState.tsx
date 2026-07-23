import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-critical-soft text-critical-base">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-ink">The API is not responding</p>
      <p className="mt-1 max-w-md text-sm text-ink-muted">
        Start the backend with <code className="font-mono text-xs">uvicorn app:app --reload</code> in the
        backend folder, then try again.
      </p>
      {onRetry && (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          <RefreshCw /> Try again
        </Button>
      )}
    </div>
  );
}
