'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';
import Link from 'next/link';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('Login attempt with:', { email, password: password.length + ' chars' });

        if (!email || !password) {
            setMessage('Please fill in all fields');
            return;
        }

        setLoading(true);
        setMessage('');

        const supabase = createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
        });

        console.log('Login response:', { data, error });

        if (error) {
            setMessage(error.message);
            setLoading(false);
        } else {
            window.location.href = '/';
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-10 space-y-6">
                {/* Heading */}
                <div className="space-y-2 text-center">
                    <h2 className="text-3xl font-semibold text-[#231f20]">Welcome Back</h2>
                    <p className="text-[#828282]">Continue with Google or enter your details.</p>
                </div>

                {/* Google Sign In Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-11 text-[#333333] border border-[#e4e8ed] hover:bg-[#f9fafb] font-medium bg-white rounded-lg flex items-center justify-center transition-colors"
                >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Log in with Google
                </button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#e4e8ed]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-[#828282]">or</span>
                    </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-[#333333]">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full h-11 px-3 border border-[#e4e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] text-[#333333] placeholder:text-[#aaaaaa]"
                    />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-[#333333]">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            className="w-full h-11 px-3 pr-10 border border-[#e4e8ed] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:border-[#7F56D9] text-[#333333] placeholder:text-[#aaaaaa]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-[#828282]"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-[#7F56D9] border-gray-300 rounded focus:ring-[#7F56D9]"
                        />
                        <label htmlFor="remember" className="text-sm font-medium text-[#333333] cursor-pointer">
                            Remember for 30 days
                        </label>
                    </div>
                    <a href="#" className="text-sm font-semibold text-[#7F56D9] hover:text-[#6941C6]">
                        Forgot password
                    </a>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-[#1a1a1a] hover:bg-[#000000] text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Logging in...' : 'Log in'}
                </button>

                {/* Error message */}
                {message && (
                    <p className="text-red-600 text-center text-sm">{message}</p>
                )}

                {/* Sign up link */}
                <p className="text-sm text-center text-[#828282]">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-semibold text-[#7F56D9] hover:text-[#6941C6]">
                        Sign up for free
                    </Link>
                </p>
            </div>
        </form>
    );
}