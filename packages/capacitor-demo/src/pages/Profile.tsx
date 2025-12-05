import React from 'react';
import { UserAvatar } from '../components/UserAvatar';

interface ProfileProps {
    userEmail: string;
    onLogout: () => void;
}

export function Profile({ userEmail, onLogout }: ProfileProps) {
    return (
        <div className="pb-24 pt-safe-top min-h-screen bg-slate-50">
            <div className="bg-white px-6 pb-4 pt-2 shadow-sm sticky top-0 z-30 mb-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile</h1>
            </div>

            <div className="px-6">
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
        </div>
    );
}
