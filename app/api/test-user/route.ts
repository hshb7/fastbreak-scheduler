import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Create a test user with auto-confirm
        const { data, error } = await supabase.auth.admin.createUser({
            email: 'demo@test.com',
            password: 'demo123',
            email_confirm: true
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Test user created!',
            email: 'demo@test.com',
            password: 'demo123'
        });
    } catch (err) {
        return NextResponse.json({
            message: 'Use regular signup instead',
            note: 'Admin API not available, please use the signup page'
        });
    }
}