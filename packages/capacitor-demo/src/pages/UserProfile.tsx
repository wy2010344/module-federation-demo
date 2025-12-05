import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserAvatar } from '../components/UserAvatar';
import { ArrowLeft } from 'lucide-react';

export function UserProfile() {
    const { email } = useParams<{ email: string }>();
    const navigate = useNavigate();

    // In a real app, we would fetch user details from backend here.
    // For now, we just display the email and generated avatar.

    return (
        <div className="min-h-screen bg-slate-50 pt-safe-top">
            <div className="bg-white sticky top-0 z-20 shadow-sm px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h1 className="text-lg font-bold text-slate-900">User Profile</h1>
            </div>

            <div className="p-6 flex flex-col items-center">
                <UserAvatar email={email || ""} size="lg" className="mb-4 text-3xl w-24 h-24" />
                <h2 className="text-xl font-bold text-slate-900 mb-1">{email?.split('@')[0]}</h2>
                <p className="text-slate-500 text-sm">{email}</p>
            </div>
        </div>
    );
}
