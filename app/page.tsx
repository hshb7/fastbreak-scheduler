
import { createClient } from '@/app/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import ConstraintSearch from './components/ConstraintSearch';
import ParticleHeroBackground from '@/components/ui/particle-effect-for-hero';
import { LogOut } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  console.log("Page: Server-side User Check:", user ? "Logged In (" + user.email + ")" : "NULL (Redirecting to login)");

  if (!user) {
    redirect('/login');
  }

  // Logout server action
  async function signOut() {
    'use server'
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* The Missing Background */}
      <ParticleHeroBackground />

      {/* Logo - Top Left */}
      <div className="absolute -top-4 left-8 z-20 pointer-events-auto">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fastbreakai-h054JiS2Dz4kEsOArp2Vg2Tl82aM1U.png"
          alt="Fastbreak AI"
          width={400}
          height={100}
          className="h-40 w-auto drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]"
          priority
        />
      </div>

      {/* Header / Sign Out - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <form action={signOut}>
          <button
            type="submit"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all font-[family-name:var(--font-jetbrains)] text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest backdrop-blur-md"
          >
            <LogOut className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            Sign Out
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="z-10 w-full max-w-7xl pt-24 px-4 flex flex-col items-center gap-8">
        {/* The Feature */}
        <ConstraintSearch />
      </div>
    </main>
  );
}

