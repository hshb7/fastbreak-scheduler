import { ExtractedParameters } from "./extractors";
import { ConstraintTemplate } from "./templates";

export function constructConstraintSentence(template: ConstraintTemplate, params: ExtractedParameters): string {
    let sentence = template.pattern;

    const replace = (placeholder: string, value: any, defaultValue: string) => {
        if (value === undefined || value === null || (Array.isArray(value) && value.length == 0)) {
            sentence = sentence.replace(placeholder, defaultValue);
        } else {
            // If its an array join with commas
            const strValue = Array.isArray(value) ? value.join(', ') : String(value);
            sentence = sentence.replace(placeholder, strValue);
        }
    };

    // Replace min, max, k, and m
    replace('<min>', params.min, '0');
    replace('<max>', params.max, 'unlimited');
    replace('<k>', params.k, '0');
    replace('<m>', params.m, 'unlimited');

    // Replacing the lists
    replace('<games>', params.games, 'any game');
    replace('<teams>', params.teams, 'any team');
    replace('<rounds>', params.rounds, 'any round');
    replace('<networks>', params.networks, 'any network');
    replace('<venues>', params.venues, 'any venue');

    //Enums
    replace('<gameType>', params.gameTypes, 'active');

    // Sequencing placeholders for the 2nd template. If we have specific games/teams we slot them as sequence items
    if (params.games && params.games.length >= 1) replace('<sequence_1>', params.games[0], 'Event A');
    else replace('<sequence_1>', null, 'Event A');

    if (params.games && params.games.length >= 2) replace('<sequence_2>', params.games[1], 'Event B');
    else replace('<sequence_2>', null, 'Event B');

    if (params.rounds && params.rounds.length >= 1) replace('<round1>', params.rounds[0], 'Round 1');
    else replace('<round1>', null, 'Round 1');

    if (params.rounds && params.rounds.length >= 2) replace('<round2>', params.rounds[1], 'Round 2');
    else replace('<round2>', null, 'Round 2');

    return sentence;
}