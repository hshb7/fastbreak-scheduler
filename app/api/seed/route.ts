import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { generateEmbedding } from '@/app/lib/openai/client';

// Array of sample constraints covering the 3 templates
const SAMPLE_CONSTRAINTS = [
    // Template 1: Game Scheduling
    {
        query: "Ensure all rivalry games on a weekend on ESPN",
        template_type: "game_scheduling",
        template_name: "Template 1: Game Scheduling Constraints",
        parameters: {
            min: 1,
            max: 999,
            games: ["rivalry_games"],
            rounds: ["weekend"],
            networks: ["ESPN"]
        }
    },
    // Adding more examples
    {
        query: "Schedule at least 5 games on Saturday nights on ABC",
        template_type: "game_scheduling",
        template_name: "Template 1: Game Scheduling Constraints",
        parameters: {
            min: 5,
            max: 999,
            games: [],
            rounds: ["Saturday nights"],
            networks: ["ABC"]
        }
    },

    {
        query: "No more than 3 UCLA games on ESPN in prime time",
        template_type: "game_scheduling",
        template_name: "Template 1: Game Scheduling Constraints",
        parameters: {
            min: 0,
            max: 3,
            games: [],
            teams: ["UCLA"],
            rounds: ["prime time"],
            networks: ["ESPN"]
        }
    },
    {
        query: "Penn State plays at UCLA and USC back-to-back",
        template_type: "sequence",
        template_name: "Template 2: Sequence Constraints",
        parameters: {
            min: 1,
            max: 1,
            teams: ["PENN_ST"],
            games: ["UCLA", "USC"],
            rounds: [],
            gameTypes: "away"
        }
    },
    {
        query: "No team should have home games before and after bye week",
        template_type: "sequence",
        template_name: "Template 2: Sequence Constraints",
        parameters: {
            min: 0,
            max: 0,
            teams: ["ALL_TEAMS"],
            gameTypes: "home",
            rounds: ["bye week"]
        }
    },
    {
        query: "Ensure at least 2 cases of rivalry games followed by bye weeks",
        template_type: "sequence",
        template_name: "Template 2: Sequence Constraints",
        parameters: {
            min: 2,
            max: 999,
            games: ["rivalry_games"],
            rounds: ["bye week"]
        }
    },
    {
        query: "No cases of 3 games in 3 nights for any team",
        template_type: "team_pattern",
        template_name: "Template 3: Team Schedule Pattern Constraints",
        parameters: {
            min: 0,
            max: 0,
            teams: ["ALL_TEAMS"],
            rounds: ["3 nights"]
        }
    },
    {
        query: "UCLA should have at most 2 instances of 3 away games in 4 days",
        template_type: "team_pattern",
        template_name: "Template 3: Team Schedule Pattern Constraints",
        parameters: {
            min: 0,
            max: 2,
            teams: ["UCLA"],
            gameTypes: "away",
            rounds: ["4 days"]
        }
    },
        {
            query: "Schedule UCLA@USC rivalry game on a weekend on ESPN",
            template_type: "game_scheduling",
            template_name: "Template 1: Game Scheduling Constraints",
            parameters: {
                min: 1,
                max: 1,
                games: ["UCLA@USC"],
                rounds: ["weekend"],
                networks: ["ESPN"]
            }
        },
        {
            query: "At least 3 prime time games for USC on CBS",
            template_type: "game_scheduling",
            template_name: "Template 1: Game Scheduling Constraints",
            parameters: {
                min: 3,
                max: 999,
                teams: ["USC"],
                rounds: ["prime time"],
                networks: ["CBS"]
            }
        },
        {
            query: "Ensure all playoff games are on national networks",
            template_type: "game_scheduling",
            template_name: "Template 1: Game Scheduling Constraints",
            parameters: {
                min: 1,
                max: 999,
                games: ["playoff_games"],
                networks: ["ESPN", "CBS", "ABC"]
            }
        },
        {
            query: "Ensure 4 consecutive home games for Penn State",
            template_type: "sequence",
            template_name: "Template 2: Sequence Constraints",
            parameters: {
                min: 1,
                max: 1,
                teams: ["PENN_ST"],
                gameTypes: "home",
                rounds: ["consecutive"]
            }
        },
        {
            query: "No back-to-back away games for UCLA",
            template_type: "sequence",
            template_name: "Template 2: Sequence Constraints",
            parameters: {
                min: 0,
                max: 0,
                teams: ["UCLA"],
                gameTypes: "away",
                rounds: ["back-to-back"]
            }
        },
        {
            query: "USC plays 3 games in 5 days followed by bye week",
            template_type: "sequence",
            template_name: "Template 2: Sequence Constraints",
            parameters: {
                min: 1,
                max: 1,
                teams: ["USC"],
                rounds: ["5 days", "bye week"]
            }
        },
        {
            query: "At most 4 home games in a row for any team",
            template_type: "team_pattern",
            template_name: "Template 3: Team Schedule Pattern Constraints",
            parameters: {
                min: 0,
                max: 4,
                teams: ["ALL_TEAMS"],
                gameTypes: "home",
                rounds: ["in a row"]
            }
        },
        {
            query: "USC should have at least 2 bye weeks",
            template_type: "team_pattern",
            template_name: "Template 3: Team Schedule Pattern Constraints",
            parameters: {
                min: 2,
                max: 999,
                teams: ["USC"],
                gameTypes: "bye"
            }
        },
        {
            query: "No more than 2 Thursday night games for Penn State",
            template_type: "team_pattern",
            template_name: "Template 3: Team Schedule Pattern Constraints",
            parameters: {
                min: 0,
                max: 2,
                teams: ["PENN_ST"],
                rounds: ["Thursday night"]
            }
        },
        {
            query: "Ensure UCLA has at least 5 home games total",
            template_type: "team_pattern",
            template_name: "Template 3: Team Schedule Pattern Constraints",
            parameters: {
                min: 5,
                max: 999,
                teams: ["UCLA"],
                gameTypes: "home"
            }
        }
    
    

];

export async function POST(request: NextRequest) {
    // Logic will go here
    try {
        // Step 1: Connection to Supabase
        const supabase = await createClient();

        // Step 2: Clear existing data 
        const { error: deleteError } = await supabase
            .from('constraint_examples')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // This deletes all the rows

        if (deleteError) {
            console.error('Error clearing data:', deleteError);
        }

        // Step 3: Process each sample constraint
        const results = [];

        for (const sample of SAMPLE_CONSTRAINTS) {
            console.log('Processing:', sample.query);

            // Generate embedding for this constraint
            const embedding = await generateEmbedding(sample.query);

            // Build the parsed constraint sentence
            let parsedConstraint = '';
            if (sample.template_type === 'game_scheduling') {
                parsedConstraint = `Ensure that at least ${sample.parameters.min || 0} and at most ${sample.parameters.max || 999} games are scheduled`;
            } else if (sample.template_type === 'sequence') {
                parsedConstraint = `Ensure sequence constraint with min ${sample.parameters.min || 0} and max ${sample.parameters.max || 999}`;
            } else {
                parsedConstraint = `Ensure pattern constraint with min ${sample.parameters.min || 0} and max ${sample.parameters.max || 999}`;
            }

            // Save to database
            const { data, error } = await supabase
                .from('constraint_examples')
                .insert({
                    query: sample.query,
                    template_type: sample.template_type.toLowerCase(),
                    template_name: sample.template_name,
                    parameters: sample.parameters,
                    parsed_constraint: parsedConstraint,
                    embedding: embedding
                })
                .select();

                if (error) {
                    console.error('Error inserting:', error);
                    results.push({ query: sample.query, error: error.message });
                } else {
                    results.push({ query: sample.query, success: true });
                }
        }
        return NextResponse.json({
            message: 'Seeding complete',
            results: results,
            total: SAMPLE_CONSTRAINTS.length
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Failed to seed database' },
            { status: 500}
        );
    }
}