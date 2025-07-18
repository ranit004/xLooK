"use client";

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function LogoutButton({ 
  variant = 'ghost', 
  size = 'default', 
  showIcon = true,
  children,
  className 
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4" />}
          {children && <span className={showIcon ? "ml-2" : ""}>{children}</span>}
        </>
      )}
    </Button>
  );
}

// Simple logout link variant
export function LogoutLink() {
  return (
    <a href="/api/auth/logout" className="text-sm text-muted-foreground hover:text-foreground">
      Logout
    </a>
  );
}
