import LoginForm from '../components/LoginForm';
import AnimatedShaderBackground from '../components/AnimatedShaderBackground';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        redirect('/');
    }

    return (
        <div className="min-h-screen relative">
            <AnimatedShaderBackground />

            <div className="min-h-screen grid lg:grid-cols-2 relative z-10">
                {/* Left side - Logo with animated background */}
                <div className="hidden lg:flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AnimatedLogo />
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="flex items-center justify-center p-8 lg:p-16">
                    <div className="w-full max-w-md">
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="w-48 h-12 flex items-center justify-center">
                                {/* Mobile simplified logo placeholder or reusing animated logo scaled down if needed, 
                                    but for consistency with previous state, sticking to basic container */}
                                <span className="text-white font-bold text-xl tracking-widest">FASTBREAK</span>
                            </div>
                        </div>
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}