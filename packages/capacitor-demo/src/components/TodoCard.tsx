import React from 'react';
import { Doc } from '../../convex/_generated/dataModel';
import { StatusBadge, TodoStatus } from './StatusBadge';
import { Calendar } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface TodoCardProps {
    todo: Doc<"todos"> & {
        creator?: Doc<"users"> | null;
        assignee?: Doc<"users"> | null;
    };
    onClick: () => void;
    isCreatorView?: boolean; // If true, show assignee. If false, show creator.
}

export function TodoCard({ todo, onClick, isCreatorView }: TodoCardProps) {
    const targetUser = isCreatorView ? todo.assignee : todo.creator;
    const targetEmail = isCreatorView ? todo.assigneeEmail : (todo.creator?.email || "Unknown");

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-3">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                        {todo.content || (todo as any).title}
                    </h3>
                </div>
                <StatusBadge status={todo.status as TodoStatus} className="shrink-0" />
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 group" onClick={(e) => {
                    e.stopPropagation();
                    alert(`User Details:\nEmail: ${targetEmail}\nName: ${targetUser?.name || 'N/A'}`);
                }}>
                    <UserAvatar
                        email={targetEmail}
                        name={targetUser?.name}
                        picture={targetUser?.picture}
                        size="sm"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            {isCreatorView ? 'Assigned To' : 'Created By'}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                            {targetUser?.name || targetEmail.split('@')[0]}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(todo.creationTime).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
