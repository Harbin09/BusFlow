'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password, role });
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'DRIVER') router.push('/driver/dashboard');
      else router.push('/student/dashboard');
    } catch {
      // handled by store error
    }
  };

  return (
    <Card className="w-full max-w-md p-8 glass-card">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-100">Welcome Back</h2>
        <p className="text-xs text-slate-400 mt-1">Sign in to your BusFlow portal account</p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['STUDENT', 'DRIVER', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 text-xs font-bold rounded-lg border transition ${
                  role === r
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="name@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center text-slate-400 gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-500" />
            <span>Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-blue-400 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading} leftIcon={<LogIn className="w-4 h-4" />}>
          Sign In as {role}
        </Button>
      </form>
    </Card>
  );
}
