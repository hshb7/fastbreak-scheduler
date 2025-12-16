import fs from 'fs';
import path from 'path';

// 1. Manually load .env.local because we aren't running inside Next.js
// This MUST happen before we import any file that uses process.env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const fileContent = fs.readFileSync(envPath, 'utf-8');
    fileContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            const cleanKey = key.trim();
            const cleanValue = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            process.env[cleanKey] = cleanValue;
        }
    });
} else {
    console.warn("⚠️ .env.local not found at:", envPath);
}

// Test Cases for each Template Type
const testCases = [
    {
        name: "Test Case 1: Game Scheduling (Template 1)",
        query: "Ensure at least 3 rivalry games are on ESPN",
        targetTemplate: "Template 1: Game Scheduling Constraints"
    },
    {
        name: "Test Case 2: Sequence (Template 2)",
        query: "Penn State plays at UCLA and USC back-to-back",
        targetTemplate: "Template 2: Sequence Constraints"
    },
    {
        name: "Test Case 3: Team Pattern (Template 3)",
        query: "No cases of 3 games in 3 nights for any team",
        targetTemplate: "Template 3: Team Schedule Pattern Constraints"
    }
];

async function runTest() {
    // 2. Dynamic Imports (MOVED INSIDE)
    // We import here so that env vars are loaded FIRST.
    const { extractConstraints } = await import('../app/lib/openai/extractor');
    const { constructConstraintSentence } = await import('../app/lib/parser/utils');
    const { CONSTRAINT_TEMPLATES } = await import('../app/lib/parser/templates');

    console.log("🚀 Starting Comprehensive Test Suite...\n");

    for (const test of testCases) {
        console.log(`--------------------------------------------------`);
        console.log(`Testing: ${test.name}`);
        console.log(`Query: "${test.query}"`);

        // 1. AI Extraction
        console.log("running AI extraction...");
        let params;
        try {
            params = await extractConstraints(test.query);
        } catch (e) {
            console.error("AI Error:", e);
            continue;
        }
        console.log("Extracted Params:", JSON.stringify(params, null, 2));

        // 2. Find the specific template to test construction
        const template = CONSTRAINT_TEMPLATES.find(t => t.name === test.targetTemplate);
        if (!template) {
            console.error(`❌ Could not find template: ${test.targetTemplate}`);
            continue;
        }

        // 3. Construct Sentence
        const sentence = constructConstraintSentence(template, params as any);
        console.log(`\nVerified Sentence:\n"${sentence}"`);
        console.log(`--------------------------------------------------\n`);
    }
}

runTest();