import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { openai } from '@/app/lib/openai/client';
import { extractConstraints } from '@/app/lib/openai/extractor';
import { constructConstraintSentence } from '@/app/lib/parser/utils';
import { CONSTRAINT_TEMPLATES } from "@/app/lib/parser/templates";

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();
        console.log('Received query:', query);

        if (!query || query.trim() == '') {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabase = await createClient();

        console.log('--- Search Processing Start ---');

        // 0. EXACT STRING MATCH (Fastest - 0ms, $0)
        // Check if we have seen this EXACT text before.
        // This avoids even the "Embedding" cost/time.
        const { data: exactMatch } = await supabase
            .from('search_cache')
            .select('result')
            .eq('query_text', query)
            .limit(1)
            .maybeSingle();

        if (exactMatch) {
            console.log("EXACT CACHE HIT! 🚀 Returning stored result.");
            return NextResponse.json(exactMatch.result);
        }

        // 1. Generate Embedding (Used for Cache & Search)
        // We use the openai instance directly. 
        // Note: generateEmbedding helper from client.ts could also be used if it does the same thing.
        console.log('Generating embedding...');
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
        });
        const embedding = embeddingResponse.data[0].embedding;

        // 2. SEMANTIC CACHE CHECK
        // Check if we have seen a very similar query before
        console.log('Checking semantic cache...');
        const { data: cachedData, error: cacheError } = await supabase.rpc('match_search_cache', {
            query_embedding: embedding,
            match_threshold: 0.99, // 99% similarity means basically the same intent
            match_count: 1
        });

        if (cacheError) {
            console.error('Cache RPC Error (ignoring):', cacheError);
        }

        if (cachedData && cachedData.length > 0) {
            console.log("CACHE HIT! ⚡️ Returning stored result.");
            return NextResponse.json(cachedData[0].result);
        }

        console.log("CACHE MISS. 🧠 Running AI Extraction...");

        // 3. AI Extraction (The "Expensive" Step)
        let extractionResult;
        try {
            extractionResult = await extractConstraints(query);
        } catch (e) {
            console.error("Extraction failed fully:", e);
            extractionResult = {};
        }
        console.log("AI Extraction Complete:", JSON.stringify(extractionResult));

        // Safely extract parts
        const extractedParams = extractionResult?.parameters || null; // Allow null to trigger defaults later if handled, or {}
        const templateName = extractionResult?.template_name;

        // 4. Construct Human-Readable Sentence
        const templateDef = CONSTRAINT_TEMPLATES.find(t => t.name === templateName);
        const safeTemplateDef = templateDef || CONSTRAINT_TEMPLATES[0];

        // Ensure params object exists for the reconstructor
        const safeParams = extractedParams || {};

        const constructedSentence = constructConstraintSentence(
            safeTemplateDef,
            safeParams
        );

        // 5. Semantic Search for Similar Past Constraints (Context/Examples)
        console.log('Searching for similar historical constraints...');
        const { data: semanticMatches, error: semanticError } = await supabase.rpc('match_constraints', {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: 5,
        });

        if (semanticError) {
            console.error('Semantic search error (non-fatal):', semanticError);
        }

        // 6. Construct Final Response
        const finalResponse = {
            query,
            keywordMatch: null, // Deprecated/Legacy
            extractedParameters: safeParams,
            semanticMatches: [
                // 1. The Live Result (Self-match)
                {
                    query: query,
                    template_type: templateName || 'Unknown',
                    template_name: templateName || 'Unknown',
                    parameters: safeParams,
                    similarity: 1.0,
                    parsed_constraint: constructedSentence
                },
                // 2. Historical Context Matches
                ...(semanticMatches || []).map((match: any) => ({
                    ...match,
                    template_name: match.template_type
                }))
            ]
        };

        // 7. SAVE TO CACHE (Write-through)
        // Store for future FREE processing
        console.log('Saving result to semantic cache...');
        const { error: insertError } = await supabase.from('search_cache').insert({
            query_text: query,
            embedding: embedding,
            result: finalResponse
        });

        if (insertError) {
            console.error("Cache insert error:", insertError);
        } else {
            console.log("Result cached successfully.");
        }

        return NextResponse.json(finalResponse);

    } catch (error: any) {
        console.error('Sever Error:', error);
        // Debugging Strategy: Write to file so agent can read it
        try {
            // Dynamic import to avoid build issues if mixed runtime
            const fs = await import('fs');
            const path = await import('path');
            const logPath = path.resolve(process.cwd(), 'debug.log');
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ERROR: ${error?.message || error}\nStack: ${error?.stack || 'No stack'}\n\n`;
            fs.appendFileSync(logPath, logMessage);
        } catch (fsError) {
            console.error('Failed to write debug log:', fsError);
        }

        return NextResponse.json(
            { error: 'Internal server error processing request', details: error?.message },
            { status: 500 }
        );
    }
}