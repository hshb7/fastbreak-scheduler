import { openai } from './client';
export async function extractConstraints(query: string) {
    if (!query) return {};

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: `You are a sports scheduling expert. Extract scheduling parameters and identify the matching template from the user's natural language query.
                
                TEMPLATES:
                - "Template 1: Game Scheduling Constraints" (Basic game limits, venues, networks)
                - "Template 2: Sequence Constraints" (Sequences of events, back-to-back, etc.)
                - "Template 3: Team Schedule Pattern Constraints" (Complex patterns like "3 games in 4 nights")

                IMPORTANT RULES:
                1. If the user mentions a matchup like "Team A at Team B", add "Team A@Team B" to the 'games' array.
                2. If the user says "No cases of X", set 'min': 0, 'max': 0.
                3. "Inner" constraints like "3 games in 3 nights" should map to 'k' (games) and 'rounds' (time).
                
                EXAMPLES:
                - Query: "No cases of 3 games in 3 nights"
                  Output: { 
                    "template_name": "Template 3: Team Schedule Pattern Constraints",
                    "parameters": { "min": 0, "max": 0, "k": 3, "rounds": ["3 nights"], "games": [], "teams": [], "networks": [], "venues": [], "gameTypes": null, "m": null } 
                  }
                
                - Query: "Penn State plays at UCLA and USC"
                  Output: { 
                    "template_name": "Template 1: Game Scheduling Constraints",
                    "parameters": { "games": ["Penn State@UCLA", "Penn State@USC"], "min": null, "max": null, "k": null, "m": null, "teams": [], "rounds": [], "networks": [], "venues": [], "gameTypes": null } 
                  }
                `
            },
            { role: "user", content: query }
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "constraint_extraction",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        template_name: {
                            type: "string",
                            enum: [
                                "Template 1: Game Scheduling Constraints",
                                "Template 2: Sequence Constraints",
                                "Template 3: Team Schedule Pattern Constraints"
                            ]
                        },
                        parameters: {
                            type: "object",
                            properties: {
                                min: { type: ["number", "null"] },
                                max: { type: ["number", "null"] },
                                k: { type: ["number", "null"] },
                                m: { type: ["number", "null"] },
                                games: { type: "array", items: { type: "string" } },
                                teams: { type: "array", items: { type: "string" } },
                                rounds: { type: "array", items: { type: "string" } },
                                networks: { type: "array", items: { type: "string" } },
                                venues: { type: "array", items: { type: "string" } },
                                gameTypes: { type: ["string", "null"], enum: ["home", "away", "bye", "active"] }
                            },
                            required: ["min", "max", "k", "m", "games", "teams", "rounds", "networks", "venues", "gameTypes"],
                            additionalProperties: false
                        }
                    },
                    required: ["template_name", "parameters"],
                    additionalProperties: false
                }
            }
        }
    });

    try {
        const content = response.choices[0].message.content;
        return content ? JSON.parse(content) : {};
    } catch (e) {
        console.error("AI Extraction failed:", e);
        return {};
    }
}