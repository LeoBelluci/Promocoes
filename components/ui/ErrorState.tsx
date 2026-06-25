import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
      <AlertCircle aria-hidden="true" className="h-8 w-8" />
      <p className="mt-3 text-sm font-semibold">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-white px-3 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
        >
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}
