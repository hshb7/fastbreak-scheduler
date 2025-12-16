import SignupForm from '../components/SignupForm';
import AnimatedShaderBackground from '../components/AnimatedShaderBackground';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { createClient } from '../lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
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

                {/* Right side - Registration form */}
                <div className="flex items-center justify-center p-8 lg:p-16">
                    <SignupForm />
                </div>
            </div>
        </div>
    );
}