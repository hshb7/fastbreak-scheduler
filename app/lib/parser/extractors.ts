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

function textToNumber(text: string): number | undefined {
    const lower = text.toLowerCase().trim();

    const parsed = parseInt(lower);
    if (!isNaN(parsed)) return parsed;

    // Dictionary mapping. Using Record <string, number> for key value pair
    const numberMap: Record<string, number> = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'zero': 0, 'no': 0, 'none': 0
    };
    return numberMap[lower];
}

export function extractMinMax(text: string): { min?: number; max?: number } {
    const result: { min?: number; max?: number } = {};

    // Check for "all" (means no limit)
    if (text.toLowerCase().includes('all')) {
        result.min = 1;
        result.max = 999;
        return result;
    }

    // Checking for "no" or "don't"
    if (/\b(no|none|don't|do not)\b/i.test(text)) {
        result.min = 0;
        result.max = 0;
        return result;
    }

    // Check for "at least X"
    const atLeastMatch = text.match(/at least ([a-z0-9]+)/i);
    if (atLeastMatch) {
        const value = textToNumber(atLeastMatch[1]);
        if (value !== undefined) {
            result.min = value
        }
    }

    // Check for "at most X"
    const atMostMatch = text.match(/at most ([a-z0-9]+)/i);
    if (atMostMatch) {
        const value = textToNumber(atMostMatch[1]);
        if (value !== undefined) {
            result.max = value;
        }
    }

    // Default values if only one is specified
    if (result.min !== undefined && result.max === undefined) {
        result.max = 999;
    }
    if (result.max !== undefined && result.min === undefined) {
        result.min = 0;
    }
    return result;
}

export function extractNetworks(text: string): string[] {
    const networks: string[] = [];
    const upperText = text.toUpperCase();
    const networkList = ['ESPN', 'CBS', 'FOX', 'NBC', 'ABC', 'TNT'];

    for (const network of networkList) {
        if (upperText.includes(network)) {
            networks.push(network);
        }
    }
    return networks;
}

export function extractTeams(text: string): string[] {
    const teams: string[] = [];
    const upperText = text.toUpperCase();

    const teamPatterns = [
        { pattern: 'PENN STATE', id: 'PENN_STATE' },
        { pattern: 'PSU', id: 'PENN_STATE' },
        { pattern: 'UCLA', id: 'UCLA' },
        { pattern: 'USC', id: 'USC' },
        { pattern: 'MICHIGAN', id: 'MICHIGAN' },
        { pattern: 'OHIO STATE', id: 'OHIO_STATE' },
        { pattern: 'LAKERS', id: 'LAKERS' },
        { pattern: 'WARRIORS', id: 'WARRIORS' },
        { pattern: 'CELTICS', id: 'CELTICS' },
        { pattern: 'MIAMI HEAT', id: 'MIAMI_HEAT' },
    ];

    for (const team of teamPatterns) {
        if (upperText.includes(team.pattern)) {
            if (!teams.includes(team.id)) {
                teams.push(team.id);
            }
        }
    }

    if (/\b(any|all) teams?\b/i.test(text)) {
        teams.push('ALL_TEAMS');
    }

    return teams;
}

export function extractRounds(text: string): string[] {
    const rounds: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('weekend')) rounds.push('weekend');
    if (lowerText.includes('weekday')) rounds.push('weekday');

    const weekMatch = lowerText.match(/weeks?\s+(\d+(?:\s*-\s*\d+)?)/);
    if (weekMatch) {
        rounds.push(`week_${weekMatch[1]}`);
    }

    return rounds;
}

export function extractGames(text: string): string[] {
    const games: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('rivalry')) games.push('rivalry_games');
    if (lowerText.includes('division')) games.push('division_games');
    if (lowerText.includes('playoff')) games.push('playoff_games');

    const matchupPattern = /\b([A-Z]+)@([A-Z]+)\b/g;
    let match;
    while ((match = matchupPattern.exec(text)) !== null) {
        games.push(`${match[1]}@${match[2]}`);
    }
    return games;
}

export function extractGameType(text: string): 'home' | 'away' | 'bye' | 'active' | undefined {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('home game') || lowerText.includes('at home')) return 'home';
    if (lowerText.includes('away game') || lowerText.includes('road game')) return 'away';
    if (lowerText.includes('bye')) return 'bye';
    return undefined;
}