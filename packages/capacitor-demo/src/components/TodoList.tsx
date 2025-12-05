import React from 'react';
import { Doc } from '../../convex/_generated/dataModel';
import { TodoCard } from './TodoCard';
import { ClipboardList } from 'lucide-react';

interface TodoListProps {
    todos?: (Doc<"todos"> & { creator?: Doc<"users"> | null; assignee?: Doc<"users"> | null })[];
    isLoading: boolean;
    onTodoClick: (todoId: string) => void;
    isCreatorView?: boolean;
    emptyMessage?: string;
}

export function TodoList({ todos, isLoading, onTodoClick, isCreatorView, emptyMessage = "No tasks found" }: TodoListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!todos || todos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <ClipboardList className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">All caught up!</h3>
                <p className="text-slate-500 text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4 pb-24">
            {todos.map((todo) => (
                <TodoCard
                    key={todo._id}
                    todo={todo}
                    onClick={() => onTodoClick(todo._id)}
                    isCreatorView={isCreatorView}
                />
            ))}
        </div>
    );
}
