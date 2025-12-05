import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { BottomNav } from './BottomNav';
import { TodoList } from './TodoList';
import { CreateTodoModal } from './CreateTodoModal';
import { Plus, Search } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface MainAppProps {
    userEmail: string;
    onLogout: () => void;
}

export function MainApp({ userEmail, onLogout }: MainAppProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'profile'>('assigned');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Filter & Search states
    const [statusFilter, setStatusFilter] = useState<string>('incomplete');
    const [searchQuery, setSearchQuery] = useState('');

    const handleTabChange = (tab: 'assigned' | 'created' | 'profile') => {
        setActiveTab(tab);
        if (tab === 'created') {
            setStatusFilter('review');
        } else {
            setStatusFilter('incomplete');
        }
    };

    const assignedTodos = useQuery(api.todos.listAssigned, {
        userEmail,
        statusFilter: activeTab === 'assigned' ? statusFilter : undefined,
        searchQuery: searchQuery || undefined
    });

    const createdTodos = useQuery(api.todos.listCreated, {
        userEmail,
        statusFilter: activeTab === 'created' ? statusFilter : undefined,
        searchQuery: searchQuery || undefined
    });

    const filters = activeTab === 'assigned'
        ? ['incomplete', 'completed', 'all']
        : ['review', 'completed', 'all'];

    const filterLabels: Record<string, string> = {
        incomplete: 'To Do',
        completed: 'Done',
        all: 'All',
        review: 'To Check',
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white pt-safe-top pb-0 shadow-sm sticky top-0 z-30">
                <div className="px-6 pb-4 pt-2">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {activeTab === 'assigned' ? 'My Tasks' :
                                    activeTab === 'created' ? 'Created by Me' : 'Profile'}
                            </h1>
                        </div>
                        <UserAvatar email={userEmail} size="md" />
                    </div>

                    {activeTab !== 'profile' && (
                        <div className="space-y-3">
                            {/* Search Bar */}
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

                            {/* Filter Tabs */}
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
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto pt-4">
                {activeTab === 'assigned' && (
                    <TodoList
                        todos={assignedTodos}
                        isLoading={assignedTodos === undefined}
                        onTodoClick={(id) => navigate(`/todo/${id}`)}
                        emptyMessage="No tasks found matching your filters."
                    />
                )}

                {activeTab === 'created' && (
                    <TodoList
                        todos={createdTodos}
                        isLoading={createdTodos === undefined}
                        onTodoClick={(id) => navigate(`/todo/${id}`)}
                        isCreatorView
                        emptyMessage="No tasks found matching your filters."
                    />
                )}

                {activeTab === 'profile' && (
                    <div className="p-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                            <UserAvatar email={userEmail} size="lg" className="mb-4 text-2xl" />
                            <h2 className="text-xl font-bold text-slate-900 mb-1">{userEmail.split('@')[0]}</h2>
                            <p className="text-slate-500 text-sm mb-6">{userEmail}</p>

                            <button
                                onClick={onLogout}
                                className="w-full py-3 text-red-600 font-medium bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* FAB */}
            {activeTab !== 'profile' && (
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="fixed right-6 bottom-24 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:bg-indigo-700 active:scale-90 active:rotate-90 transition-all z-30"
                >
                    <Plus className="w-7 h-7" />
                </button>
            )}

            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

            <CreateTodoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                userEmail={userEmail}
            />
        </div>
    );
}
