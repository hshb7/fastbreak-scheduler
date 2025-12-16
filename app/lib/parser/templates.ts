export enum TemplateType {
    GAME_SCHEDULING = 'game_scheduling',
    SEQUENCE = 'sequence',
    TEAM_PATTERN = 'team_pattern'
}

export interface ConstraintTemplate {
    type: TemplateType;
    name: string;
    description: string;
    pattern: string;
    keywords: string[];
    examples: string[];

}

export const CONSTRAINT_TEMPLATES: ConstraintTemplate[] = [
    {
        type: TemplateType.GAME_SCHEDULING,
        name: 'Template 1: Game Scheduling Constraints',
        description: 'Controls when and where specific games are scheduled',
        pattern: 'Ensure that at least <min> and at most <max> games from <games> are scheduled across <rounds> and played in any venue from <venues> and assigned to any of <networks>.',
        keywords: [
            'game', 'games', 'matchup', 'rivalry',
            'weekend', 'weekday', 'ESPN', 'CBS'
        ],
        examples: [
            'Ensure all rivalry games on a weekend on ESPN'
        ]
    },

    {
        type: TemplateType.SEQUENCE,
        name: 'Template 2: Sequence Constraints',
        description: 'Controls the order and sequence of games or byes',
        pattern: 'Ensure at least <min> and at most <max> cases where there is a sequence <sequence_1>, or <sequence_2> across rounds <round1>, <round2>.',
        keywords: [
            'back-to-back', 'consecutive', 'sequence', 'bye week',
            'before', 'after', 'followed by', 'in a row'
        ],
        examples: [
            'Penn State plays at UCLA and USC back-to-back',
            'No team plays home games before and after bye week'
        ]
    },

    {
        type: TemplateType.TEAM_PATTERN,
        name: 'Template 3: Team Schedule Pattern Constraints',
        description: 'Controls patterns in team schedules like games per time period',
        pattern: 'Ensure that <teams> have at least <min> and at most <max> instances where they play at least <k> and at most <m> <gameType> games across <rounds> where the game is assigned to any of <networks> and played in any venue from <venues>.',
        keywords: [
            'cases of', 'instances', 'games in', 'nights', 'days',
            'home games', 'away games', 'road games',
            'no more than', 'at most', 'at least'
        ],
        examples: [
            'No cases of 3 games in 3 nights for any team',
            'At most 2 cases of 3 away games in 4 days',
            'No team plays more than 4 home games in a row'
        ]
    }
];


