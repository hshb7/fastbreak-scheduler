import { CONSTRAINT_TEMPLATES, TemplateType } from "./templates";

export interface TemplateMatch {
    templateType: TemplateType;
    templateName: string;
    confidence: number;
    matchedKeywords: string[];
}

export function findBestTemplate(query: string): TemplateMatch | null {
    // Convertnig query to lowercase for easier matching
    const lowerQuery = query.toLowerCase();

    // Tracking the scores for each template
    const scores: any[] = [];

    // Loop through the template and score it
    for (const template of CONSTRAINT_TEMPLATES) { // Go through each template one byone
        let score = 0; //Start with 0 points
        const matchedKeywords: string[] = []; // Keep track of which keywods we find

        // Check how many kewords from this template appear in the query
        for (const keyword of template.keywords) {
            if (lowerQuery.includes(keyword.toLowerCase())){
                score += 1;
                matchedKeywords.push(keyword)
            }
        }

        // Saving this template's score
        scores.push({
            template: template,
            score: score,
            matchedKeywords: matchedKeywords
        });

    }
        let bestMatch = scores[0];
        for (const item of scores) {
            if (item.score > bestMatch.score) {
                bestMatch = item;
            }
        }

        // If no keywords matched at all, return null
        if (bestMatch.score === 0){
            return null;
        }

        // Calculating confidence (0 to 1 scale) if we match 5 or more keywords = 1.0 (100%)
        const confidence = Math.min(bestMatch.score / 5, 1.0);

        // Return the match
        return {
            templateType: bestMatch.template.type,
            templateName: bestMatch.template.name,
            confidence: Number(confidence.toFixed(2)), // built in function to round 2 decimal places
            matchedKeywords: bestMatch.matchedKeywords

        };
    }
