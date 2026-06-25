import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  label: string;
}

export default function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 shadow-sm">
      <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
