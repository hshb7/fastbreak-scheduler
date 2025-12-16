import { NextRequest, NextResponse } from 'next/server';
import { findBestTemplate } from '@/app/lib/parser/matcher';
import {
    extractMinMax,
    extractTeams,
    extractNetworks,
    extractRounds,
    extractGames,
    extractGameType,
    ExtractedParameters
} from '@/app/lib/parser/extractors';
import { TemplateType } from '@/app/lib/parser/templates';

// Defining what we expect to receive
interface ParseQueryRequest {
    query: string;
}

// Defining what we'll send back (Typescript types)
interface ParseQueryResponse {
    success: boolean;
    template?: string; // Which template matched
    confidence?: number; // How sure we are
    parsedConstraint?: string; // The filled in template sentence
    parameters?: ExtractedParameters; // All the extracted values
    matchedKeywords?: string[]; // Which keywords we found
    originalQuery?: string;
    error?: string;
}

// POST = handles POST request (sending data)
export async function POST(request: NextRequest) {
    try{
        // Step 1: Get the data from the request body
        const body: ParseQueryRequest = await request.json();

        // Step 2: Check if we got a query
        if (!body.query){
            return NextResponse.json(
                {
                    success: false,
                    error: 'No query provided'
                },
                { status: 400 } // 400 = Bad Request
            );
        }

        // Step 3: Finding which template matches
        const templateMatch = findBestTemplate(body.query);

        // If no template matches, return an error
        if(!templateMatch) {
            return NextResponse.json({
                success: false,
                error: 'Could not match query to any constraint template',
                suggestion: 'Try including keywords like: games, schedule, weekend, etc'
            }, {status: 400});
        }
    

        // Step 4: Extract parameters based on the query
        const parameters: ExtractedParameters = {};

        // Extract min/max values
        const minMax = extractMinMax(body.query);
        parameters.min = minMax.min;
        parameters.max = minMax.max;

        // Extract other parameters
        parameters.games = extractGames(body.query);
        parameters.teams = extractTeams(body.query);
        parameters.rounds = extractRounds(body.query);
        parameters.networks = extractNetworks(body.query);
        parameters.gameTypes = extractGameType(body.query);

        // Step 5: Create the response
        const response: ParseQueryResponse = {
            success: true,
            template: templateMatch.templateName,
            confidence: templateMatch.confidence,
            parsedConstraint: buildConstraintSentence(templateMatch.templateType, parameters),
            parameters: parameters,
            matchedKeywords: templateMatch.matchedKeywords,
            originalQuery: body.query
        };

        return NextResponse.json(response);
        
        
    } 
    catch (error) {
        console.error('Error in parseQuery:', error);
        return NextResponse.json(
         {
            success: false,
            error: 'Failed to process query'
         },
         { status: 500 } // 500 = Server Error
        );
    }
}

// Helper function for building the readble constraint sentence
function buildConstraintSentence(type: TemplateType, params: ExtractedParameters): string {
    switch (type) {
        case TemplateType.GAME_SCHEDULING:
            return `Ensure that at least ${params.min || 0} and at most ${params.max || 999} games from [${params.games?.join(', ') || 'unspecified'}] are scheduled across [${params.rounds?.join(', ') || 'any rounds'}] on [${params.networks?.join(', ') || 'any network'}].`;

        case TemplateType.SEQUENCE:
            return `Ensure at least ${params.min || 0} and at most ${params.max || 999} sequences involving [${params.games?.join(', ') || 'unspecified games'}] across [${params.rounds?.join(', ') || 'unspecified rounds'}].`;

        case TemplateType.TEAM_PATTERN:
            return `Ensure ${params.teams?.join(', ') || 'teams'} have at least ${params.min || 0} and at most ${params.max || 999} instances of ${params.gameTypes || 'game'} patterns.`;

        default:
            return 'Unknown constraint type';
    }
}

