import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader className={`${sizeClasses[size]} text-primary animate-spin`} />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}
