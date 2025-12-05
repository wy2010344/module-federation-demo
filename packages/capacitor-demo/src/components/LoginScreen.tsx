import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { cn } from '../lib/utils';
import { Mail, ArrowRight, Lock } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (email: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const syncUser = useMutation(api.users.syncUser);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        // Basic bot protection / validation could go here
        if (!email.includes('@')) {
            alert("Please enter a valid email");
            return;
        }
        setStep('otp');
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp !== '0000') {
            alert("Invalid code. Please use 0000.");
            return;
        }

        setIsLoading(true);
        try {
            await syncUser({ email });
            onLogin(email);
        } catch (error) {
            console.error("Login failed", error);
            alert("Failed to login. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">TaskFlow</h1>
                    <p className="text-white/80 text-lg">Collaborate seamlessly.</p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-white/90 text-sm font-medium ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-lg hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-white/90 text-sm font-medium ml-1">Verification Code</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="0000"
                                    maxLength={4}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all tracking-widest text-center text-xl font-mono"
                                />
                            </div>
                            <p className="text-white/60 text-xs text-center">Use 0000 to login</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-lg hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Verifying...' : 'Login'}
                            {!isLoading && <ArrowRight className="w-5 h-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="w-full text-white/80 text-sm hover:text-white transition-colors"
                        >
                            Back to Email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
