export interface ExtractedParameters {
    min?: number;
    max?: number;
    k?: number;
    m?: number;
    games?: string[];
    teams?: string[];
    rounds?: string[];
    networks?: string[];
    venues?: string[];
    gameTypes?: 'home' | 'away' | 'bye' | 'active';
}
// This file defines the shape of parameters extracted from natural language queries.
// The manual regex extractors have been replaced by OpenAI Structured Outputs.

export interface ExtractedParameters {
    min?: number;
    max?: number;
    k?: number;
    m?: number;
    games?: string[];
    teams?: string[];
    rounds?: string[];
    networks?: string[];
    venues?: string[];
    gameTypes?: 'home' | 'away' | 'bye' | 'active';
}