import React from 'react';
import { cn } from '../lib/utils';
import { ListTodo, Send, User } from 'lucide-react';

interface BottomNavProps {
    activeTab: 'assigned' | 'created' | 'profile';
    onTabChange: (tab: 'assigned' | 'created' | 'profile') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const tabs = [
        { id: 'assigned', label: 'My Tasks', icon: ListTodo },
        { id: 'created', label: 'Created', icon: Send },
        { id: 'profile', label: 'Profile', icon: User },
    ] as const;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-16 transition-all duration-300",
                                isActive ? "text-indigo-600 -translate-y-1" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all",
                                isActive ? "bg-indigo-50" : "bg-transparent"
                            )}>
                                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            </div>
                            <span className="text-[10px] font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
