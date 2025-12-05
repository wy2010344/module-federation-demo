import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TodoList } from '../components/TodoList';
import { Search, Plus } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { CreateTodoModal } from '../components/CreateTodoModal';

interface CreatedTasksProps {
    userEmail: string;
}

export function CreatedTasks({ userEmail }: CreatedTasksProps) {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>('review');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const todos = useQuery(api.todos.listCreated, {
        userEmail,
        statusFilter: statusFilter === 'all' ? undefined : statusFilter,
        searchQuery: searchQuery || undefined
    });

    const filters = ['review', 'incomplete', 'completed', 'all'];
    const filterLabels: Record<string, string> = {
        review: 'To Check',
        incomplete: 'Pending',
        completed: 'Done',
        all: 'All',
    };

    return (
        <div className="pb-24 pt-safe-top">
            <div className="bg-white px-6 pb-4 pt-2 shadow-sm sticky top-0 z-30">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-slate-900">Created by Me</h1>
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
                    isCreatorView
                    emptyMessage="No tasks found matching your filters."
                />
            </div>

            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed right-6 bottom-24 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:bg-indigo-700 active:scale-90 active:rotate-90 transition-all z-30"
            >
                <Plus className="w-7 h-7" />
            </button>

            <CreateTodoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                userEmail={userEmail}
            />
        </div>
    );
}
