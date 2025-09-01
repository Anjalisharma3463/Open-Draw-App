import { ReactNode } from "react";

export function IconButton({
    icon,
    onClick,
    activated,
    className = ""
}: {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
    className?: string;
}) {
    return (
        <div
            className={`m-2 pointer rounded-full border p-2 bg-black hover:bg-gray-700 transition-colors ${
                activated ? "text-red-400" : "text-white"
            } ${className}`}
            onClick={onClick}
        >
            {icon}
        </div>
    );
}
