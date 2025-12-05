import React, { useMemo } from 'react';
import { cn } from '../lib/utils';

interface UserAvatarProps {
    email: string;
    name?: string;
    picture?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ email, name, picture, className, size = 'md' }: UserAvatarProps) {
    const username = useMemo(() => {
        if (name) return name;
        return email.split('@')[0];
    }, [email, name]);

    const initial = username.charAt(0).toUpperCase();

    const bgColor = useMemo(() => {
        // Deterministic color generation based on email
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 80%)`;
    }, [email]);

    const textColor = useMemo(() => {
        // Darker version of bg color for text
        let hash = 0;
        for (let i = 0; i < email.length; i++) {
            hash = email.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 80%, 30%)`;
    }, [email]);

    const sizeClasses = {
        sm: "w-6 h-6 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
    };

    if (picture) {
        return (
            <img
                src={picture}
                alt={username}
                className={cn(
                    "rounded-full object-cover shadow-sm",
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-bold shadow-sm",
                sizeClasses[size],
                className
            )}
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {initial}
        </div>
    );
}
