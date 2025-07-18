"use client";

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Eye, EyeOff, Shield, Sun, Moon, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSwitchToSignup?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSwitchToSignup, redirectTo = '/' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        router.push(redirectTo);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

return (
<div className="relative w-full max-w-md mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-black text-white rounded-2xl shadow-lg">
    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-300 opacity-10 blur-lg rounded-2xl"></div>
    <div className="relative z-10">
      <div className="flex justify-center mb-4">
        <Shield className="text-white h-16 w-16 animate-pulse" />
      </div>
      <h2 className="text-center text-2xl font-bold tracking-tight mb-6">Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            <Mail className="inline-block w-5 h-5 mr-1" />Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
            className="block w-full h-10 bg-transparent border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            <Lock className="inline-block w-5 h-5 mr-1" />Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="block w-full h-10 bg-transparent border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-white" /> : <Eye className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-gradient-to-r from-white to-gray-500 hover:from-gray-500 hover:to-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          disabled={isLoading || !email || !password}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />}
          Sign In
        </Button>
      </form>
      {onSwitchToSignup && (
        <div className="mt-6 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium text-indigo-300 hover:text-indigo-500 cursor-pointer"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </div>
      )}
    </div>
  </div>
  );
}
