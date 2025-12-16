import OpenAI from 'openai';

// Prevent crash on import if env var is missing/stale.
// The actual API call will fail gracefully later if the key is invalid.
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-init',
});

// Generating embedding for semantic search
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.trim(),
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate embedding');
    }
}