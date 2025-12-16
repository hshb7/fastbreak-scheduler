# Fastbreak Scheduler - Developer Challenge

Hey team, here is my submission for the constraint parser challenge. I built this to translate natural language into structured scheduling constraints using a hybrid approach of semantic search (Supabase) and LLMs (OpenAI).

## Live Demo
[Insert Deployment URL Here]

**Test Credentials:**
- **Email:** `cibeanu3@gmail.com`
- **Password:** `awesome1`

---

## My Approach

The core challenge was taking messy user input (e.g., "No games on Xmas") and mapping it perfectly to one of the strict JSON templates.

I decided against writing complex Regex parsers because they are brittle. Instead, I used a **Search-First, Extract-Second** pipeline:
1.  **Find the Template**: I use `pgvector` in Supabase to find the most similar "Template" based on the meaning of the user's query. This handles synonyms really well (e.g., "matchup" vs "game").
2.  **Extract Parameters**: Once we know the specific Template, I use OpenAI's **Structured Outputs** (JSON Schema) to extract the exact parameters needed (`min`, `max`, `teams`, etc.). This guarantees type safety.
3.  **Optimization (Caching)**: To save money and speed things up, I implemented a semantic cache. If I see a query that is semantically identical to a previous one (similarity > 99%), I serve the cached result instantly from Postgres. No API cost.

## Tech Stack

-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion (for the "tech" feel).
-   **Backend**: Next.js API Routes.
-   **Database**: Supabase (PostgreSQL) with `pgvector` extension.
-   **AI**: OpenAI GPT-4o-mini (for extraction) + `text-embedding-3-small` (for vectors).

## Architecture Details

-   **Why Supabase?** I needed Auth and Vector Search in one place. It was easier than spinning up Pinecone separately.
-   **Why Structured Outputs?** The prompt engineering required to get valid JSON from older models is painful. The new `json_schema` mode makes the parser extremely reliable.
-   **Performance**: The initial search takes ~800ms (OpenAI latency), but subsequent similar searches are <50ms thanks to the vector cache layer.

## Setup Instructions

If you want to run this locally:

1.  **Clone details**
    ```bash
    git clone [repo-url]
    cd fastbreak-scheduler
    npm install
    ```

2.  **Environment Config**
    Populate `.env.local` with your keys:
    ```
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    OPENAI_API_KEY=sk-...
    ```

3.  **Database**
    Run the SQL in `supabase/schema.sql` to create the tables and functions.

4.  **Run**
    ```bash
    npm run dev
    ```

## Trade-offs / Challenges

-   **Latency vs. Accuracy**: Using an LLM for extraction is slower than Regex, but much more accurate for weird phrasings. I mitigated the latency with the Semantic Cache.
-   **Template Ambiguity**: Sometimes queries look like they could fit two templates. I added a "Analysis Candidates" section in the UI to show other possible matches if the confidence is close.

Overall, it was a fun challenge to balance AI with the strict requirements of a scheduling system. Let me know if you have questions!
