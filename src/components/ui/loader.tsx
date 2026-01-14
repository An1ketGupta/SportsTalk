import { cn } from "@/lib/utils";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function Loader({ size = "md", className }: LoaderProps) {
    const sizeClasses = {
        sm: "w-5 h-5 border-2",
        md: "w-8 h-8 border-4",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div
            className={cn(
                "border-gray-700 border-t-blue-500 rounded-full animate-spin",
                sizeClasses[size],
                className
            )}
        />
    );
}
