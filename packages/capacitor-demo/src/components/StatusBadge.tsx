import React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export type TodoStatus = "pending" | "completed" | "failed" | "approved" | "rejected";

interface StatusBadgeProps {
    status: TodoStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = {
        pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-200", icon: Clock, label: "Pending" },
        completed: { color: "bg-green-500/10 text-green-600 border-green-200", icon: CheckCircle2, label: "Completed" },
        failed: { color: "bg-red-500/10 text-red-600 border-red-200", icon: XCircle, label: "Failed" },
        approved: { color: "bg-blue-500/10 text-blue-600 border-blue-200", icon: ShieldCheck, label: "Approved" },
        rejected: { color: "bg-orange-500/10 text-orange-600 border-orange-200", icon: AlertCircle, label: "Rejected" },
    };

    const { color, icon: Icon, label } = config[status] || config.pending;

    return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", color, className)}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
        </div>
    );
}
