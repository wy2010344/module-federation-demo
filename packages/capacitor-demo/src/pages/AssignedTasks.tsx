import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TodoList } from '../components/TodoList';
import { Search } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface AssignedTasksProps {
    userEmail: string;
}

export function AssignedTasks({ userEmail }: AssignedTasksProps) {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>('incomplete');
    const [searchQuery, setSearchQuery] = useState('');

    const todos = useQuery(api.todos.listAssigned, {
        userEmail,
        statusFilter: statusFilter === 'all' ? undefined : statusFilter,
        searchQuery: searchQuery || undefined
    });

    const filters = ['incomplete', 'completed', 'all'];
    const filterLabels: Record<string, string> = {
        incomplete: 'To Do',
        completed: 'Done',
        all: 'All',
    };

    return (
        <div className="pb-24 pt-safe-top">
            <div className="bg-white px-6 pb-4 pt-2 shadow-sm sticky top-0 z-30">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
                    <UserAvatar email={userEmail} size="md" />
                </div>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all",
                                    statusFilter === filter
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {filterLabels[filter] || filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto pt-4 px-4 sm:px-6">
                <TodoList
                    todos={todos}
                    isLoading={todos === undefined}
                    onTodoClick={(id) => navigate(`/todo/${id}`)}
                    emptyMessage="No tasks found matching your filters."
                />
            </div>
        </div>
    );
}
