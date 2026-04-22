// Keep this string in sync with apps/www/src/snippets/prompt.txt.
export const AGENT_PROMPT = `Read this codebase carefully, then generate an openpolicy.ts using the OpenPolicy SDK.

SDK reference: https://docs.openpolicy.sh/llms.txt

Your output should capture:
- Every category of data collected and why
- All third-party services integrated and their purpose
- The applicable jurisdiction (US, EU, UK, etc.)
- Legal basis for processing
- User rights supported
- Cookie usage (essential, analytics, marketing) and consent categories

Output only a single openpolicy.ts using defineConfig(). No explanations.
`;
