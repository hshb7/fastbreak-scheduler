
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function verifyCache() {
    const testQuery = "verify cache functionality " + Date.now();
    console.log(`\n🧪 Testing Cache with Query: "${testQuery}"`);

    // 1. Generate Embedding
    console.log("1. Generating Embedding...");
    const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: testQuery,
    });
    const embedding = embeddingResponse.data[0].embedding;
    console.log("   ✅ Embedding generated.");

    // 2. Check Cache (Expect MISS)
    console.log("\n2. Checking Cache (First time)...");
    const { data: missData, error: missError } = await supabase.rpc('match_search_cache', {
        query_embedding: embedding,
        match_threshold: 0.99,
        match_count: 1
    });

    if (missError) console.error("   ❌ RPC Error:", missError);
    if (!missData || missData.length === 0) {
        console.log("   ✅ Cache MISS (Expected).");
    } else {
        console.warn("   ⚠️ Cache HIT (Unexpected) - Did we run this already?");
    }

    // 3. Insert into Cache (Simulate API saving result)
    console.log("\n3. Inserting Mock Result into Cache...");
    const mockResult = { test: "This is a cached result", timestamp: Date.now() };
    const { error: insertError } = await supabase.from('search_cache').insert({
        query_text: testQuery,
        embedding: embedding,
        result: mockResult
    });

    if (insertError) {
        console.error("   ❌ Insert Error:", insertError);
        return;
    }
    console.log("   ✅ Inserted successfully.");

    // 4. Check Cache Again (Expect HIT)
    console.log("\n4. Checking Cache (Second time)...");
    const { data: hitData, error: hitError } = await supabase.rpc('match_search_cache', {
        query_embedding: embedding,
        match_threshold: 0.99,
        match_count: 1
    });

    if (hitError) console.error("   ❌ RPC Error:", hitError);

    if (hitData && hitData.length > 0) {
        console.log("   ✅ Cache HIT (Success!).");
        console.log("   📄 Retrieved Result:", JSON.stringify(hitData[0].result));
        console.log("   🎯 Similarity Score:", hitData[0].similarity);
    } else {
        console.error("   ❌ Cache MISS (Failed). Logic check needed.");
    }
}

verifyCache();
