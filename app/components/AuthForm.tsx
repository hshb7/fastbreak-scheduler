'use client';
import { useState } from 'react';
import { createClient } from '../lib/supabase/client';

export default function AuthForm(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async () => {
        setLoading(true);
        setMessage('')

        const supabase = createClient();


        if (isSignUp){
            // New user
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error){
                setMessage(error.message);
            } else {
                setMessage('Check your email for confirmation!')
            }
        } else {
            // Sign in
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMessage(error.message);
            } else {
                window.location.href = '/';
            }
        }
        setLoading(false); //Turning off loading spinner after auth finishes

    }
    return (
        <div className="w-full max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
                {isSignUp ? 'Sign Up' : 'Sign In'}
            </h2>
            <div className="space-y-4">
                <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-sm text-blue-600 hover:underline"
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
                {message && (
                    <p className="text-red-600 text-center">{message}</p>
                )}
            </div>
        </div>
    )
}