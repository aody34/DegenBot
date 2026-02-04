/**
 * OpenAI/Gemini AI Token Analyzer for DegenBot Copy Trading
 * Analyzes tokens for risk before executing copy trades
 */

// Support both OpenAI and Google Gemini APIs
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface TokenAnalysis {
    score: number;           // 0-100 confidence score
    reasoning: string;       // AI explanation
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    recommendation: 'BUY' | 'SKIP' | 'CAUTION';
}

export interface TokenData {
    mintAddress: string;
    name?: string;
    symbol?: string;
    liquidity?: number;
    marketCap?: number;
    priceUsd?: number;
    volume24h?: number;
    holders?: number;
    topHoldersPercent?: number;
    hasMintAuthority?: boolean;
    hasFreezeAuthority?: boolean;
    createdAt?: string;
}

/**
 * Analyze a token using Gemini AI (you provided a Gemini key)
 */
export async function analyzeTokenWithGemini(
    apiKey: string,
    tokenData: TokenData,
    whaleLabel?: string
): Promise<TokenAnalysis> {
    const prompt = buildAnalysisPrompt(tokenData, whaleLabel);

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 500,
                },
            }),
        });

        if (!response.ok) {
            console.error('[AI] Gemini API error:', await response.text());
            return getDefaultAnalysis('API error');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return parseAIResponse(text);
    } catch (error) {
        console.error('[AI] Error analyzing token:', error);
        return getDefaultAnalysis('Analysis failed');
    }
}

/**
 * Analyze a token using OpenAI GPT-4o
 */
export async function analyzeTokenWithOpenAI(
    apiKey: string,
    tokenData: TokenData,
    whaleLabel?: string
): Promise<TokenAnalysis> {
    const prompt = buildAnalysisPrompt(tokenData, whaleLabel);

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a crypto trading risk analyst. Analyze tokens and return JSON with score (0-100), reasoning, riskLevel (LOW/MEDIUM/HIGH/EXTREME), and recommendation (BUY/SKIP/CAUTION).',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            console.error('[AI] OpenAI API error:', await response.text());
            return getDefaultAnalysis('API error');
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';

        return parseAIResponse(text);
    } catch (error) {
        console.error('[AI] Error analyzing token:', error);
        return getDefaultAnalysis('Analysis failed');
    }
}

/**
 * Build the analysis prompt
 */
function buildAnalysisPrompt(tokenData: TokenData, whaleLabel?: string): string {
    return `Analyze this Solana token for copy trading risk:

TOKEN: ${tokenData.symbol || 'Unknown'} (${tokenData.name || 'Unknown'})
MINT: ${tokenData.mintAddress}
${whaleLabel ? `WHALE: ${whaleLabel} just bought this token` : ''}

METRICS:
- Liquidity: $${tokenData.liquidity?.toLocaleString() || 'Unknown'}
- Market Cap: $${tokenData.marketCap?.toLocaleString() || 'Unknown'}
- 24h Volume: $${tokenData.volume24h?.toLocaleString() || 'Unknown'}
- Holders: ${tokenData.holders?.toLocaleString() || 'Unknown'}
- Top 10 Holders: ${tokenData.topHoldersPercent ? `${tokenData.topHoldersPercent}%` : 'Unknown'}
- Mint Authority: ${tokenData.hasMintAuthority === undefined ? 'Unknown' : tokenData.hasMintAuthority ? 'ACTIVE ⚠️' : 'Revoked ✓'}
- Freeze Authority: ${tokenData.hasFreezeAuthority === undefined ? 'Unknown' : tokenData.hasFreezeAuthority ? 'ACTIVE ⚠️' : 'Revoked ✓'}
- Token Age: ${tokenData.createdAt || 'Unknown'}

SCORING GUIDE:
- 80-100: Safe to copy (good liquidity, revoked authorities, reasonable holder distribution)
- 60-79: Proceed with caution
- 40-59: High risk, not recommended
- 0-39: Extreme risk, likely rug/scam

Respond in JSON format:
{
    "score": <0-100>,
    "reasoning": "<brief explanation>",
    "riskLevel": "LOW|MEDIUM|HIGH|EXTREME",
    "recommendation": "BUY|SKIP|CAUTION"
}`;
}

/**
 * Parse AI response into TokenAnalysis
 */
function parseAIResponse(text: string): TokenAnalysis {
    try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                score: Math.min(100, Math.max(0, parsed.score || 0)),
                reasoning: parsed.reasoning || 'No reasoning provided',
                riskLevel: parsed.riskLevel || 'HIGH',
                recommendation: parsed.recommendation || 'SKIP',
            };
        }
    } catch (e) {
        console.error('[AI] Failed to parse response:', e);
    }

    return getDefaultAnalysis('Failed to parse AI response');
}

/**
 * Get default analysis for error cases
 */
function getDefaultAnalysis(reason: string): TokenAnalysis {
    return {
        score: 0,
        reasoning: reason,
        riskLevel: 'EXTREME',
        recommendation: 'SKIP',
    };
}

/**
 * Get token data from DexScreener for analysis
 */
export async function getTokenDataFromDexScreener(
    mintAddress: string
): Promise<Partial<TokenData>> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`
        );

        if (!response.ok) return {};

        const data = await response.json();
        const pair = data.pairs?.[0];

        if (!pair) return {};

        return {
            mintAddress,
            name: pair.baseToken?.name,
            symbol: pair.baseToken?.symbol,
            liquidity: pair.liquidity?.usd,
            marketCap: pair.marketCap,
            priceUsd: parseFloat(pair.priceUsd),
            volume24h: pair.volume?.h24,
        };
    } catch (error) {
        console.error('[DexScreener] Error fetching token data:', error);
        return {};
    }
}

/**
 * Main analysis function - uses Gemini (based on your API key)
 */
export async function analyzeToken(
    tokenData: TokenData,
    whaleLabel?: string
): Promise<TokenAnalysis> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error('[AI] No API key configured');
        return getDefaultAnalysis('No AI API key configured');
    }

    // Check which API to use based on key format
    if (apiKey.startsWith('AIza')) {
        return analyzeTokenWithGemini(apiKey, tokenData, whaleLabel);
    } else {
        return analyzeTokenWithOpenAI(apiKey, tokenData, whaleLabel);
    }
}
