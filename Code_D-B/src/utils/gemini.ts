/**
 * Shared AI client supporting both Gemini (Cloud) and Ollama (Local)
 *
 * Configured via .env:
 *  AI_PROVIDER=ollama  (or gemini)
 *  AI_MODEL=qwen2.5:1.5b  (or gemini-1.5-flash)
 *  OLLAMA_MAX_TOKENS=800   (optional, default 800)
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import logger from './logger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// ─── Prompt cache (avoids duplicate Ollama calls for same input) ─────────────
interface CacheEntry {
  result: string;
  expiresAt: number;
}
const promptCache = new Map<string, CacheEntry>();
const PROMPT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(prompt: string): string | null {
  const entry = promptCache.get(prompt);
  if (entry && Date.now() < entry.expiresAt) {
    logger.info('[AI Cache] HIT — returning cached response');
    return entry.result;
  }
  if (entry) promptCache.delete(prompt); // expired
  return null;
}

function setCache(prompt: string, result: string): void {
  // Only cache shorter prompts (no point caching huge context dumps)
  if (prompt.length <= 4000) {
    promptCache.set(prompt, { result, expiresAt: Date.now() + PROMPT_CACHE_TTL_MS });
  }
}

/** Periodically clear stale cache entries to prevent memory leaks */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of promptCache.entries()) {
    if (now >= entry.expiresAt) promptCache.delete(key);
  }
}, 10 * 60 * 1000); // every 10 minutes

// ─── Model rotation (Gemini only) ────────────────────────────────────────────
const MODEL_PRIORITY: string[] = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
];

let _cachedModelName: string | null = null;
let _cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

function getErrorCode(err: Error): number | null {
  const m = err.message?.match(/\[(\d{3})/);
  return m ? parseInt(m[1]) : null;
}

function bustCache(): void {
  _cachedModelName = null;
  _cacheExpiresAt = 0;
}

// ─── Ollama ───────────────────────────────────────────────────────────────────
/**
 * Generate content using local Ollama.
 * - num_predict caps output tokens → much faster responses
 * - temperature 0.3 → more focused, less rambling
 * - stream: false → wait for full response (simpler, reliable)
 */
async function tryOllamaModel(prompt: string): Promise<string> {
  const model = process.env.AI_MODEL || 'llama3';
  const maxTokens = parseInt(process.env.OLLAMA_MAX_TOKENS || '800', 10);
  logger.info(`[Ollama] Generating with model: ${model} (max_tokens: ${maxTokens})`);

  try {
    const response = await axios.post(
      'http://127.0.0.1:11434/api/generate',
      {
        model,
        prompt,
        stream: false,
        options: {
          num_predict: maxTokens, // cap output length for speed
          temperature: 0.3,       // more deterministic = faster + consistent
          top_p: 0.9,
          repeat_penalty: 1.1,
        },
      },
      { timeout: 180000 } // 3 min (was 5 min — fail faster, retry sooner)
    );

    if (response.data?.response) {
      logger.info(`[Ollama] Success with ${model}`);
      return response.data.response as string;
    }
    throw new Error('Empty response from Ollama');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`[Ollama] Generation failed: ${message}`);
    throw new Error(
      `AI_UNAVAILABLE: Ollama failed. Is '${model}' running? Error: ${message}`
    );
  }
}

// ─── Gemini ───────────────────────────────────────────────────────────────────
async function tryGeminiModel(
  name: string,
  prompt: string,
  maxRetries = 2
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: name });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.();
      if (!text) throw new Error('Empty response from AI model');

      _cachedModelName = name;
      _cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      if (attempt > 0)
        logger.info(`[Gemini] ${name} recovered after ${attempt} retry(s)`);
      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = getErrorCode(error);

      if (code === 503) {
        if (attempt < maxRetries) {
          const wait = (attempt + 1) * 2000;
          logger.warn(
            `[Gemini] ${name} → 503 (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${wait}ms...`
          );
          await sleep(wait);
          continue;
        }
        logger.warn(`[Gemini] ${name} → 503 exhausted, rotating model`);
        throw error;
      }

      throw error;
    }
  }

  throw new Error('Unreachable');
}

// ─── Main entry ───────────────────────────────────────────────────────────────
/**
 * Generates content using the best available AI model.
 * Checks in-memory prompt cache first to avoid redundant calls.
 */
export async function generateContent(prompt: string): Promise<string> {
  // Check cache first (works for both Ollama and Gemini)
  const cached = getCached(prompt);
  if (cached) return cached;

  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'ollama') {
    const result = await tryOllamaModel(prompt);
    setCache(prompt, result);
    return result;
  }

  // ── Gemini path ──────────────────────────────────────────────────────────
  const envModel = process.env.AI_MODEL;
  const candidates =
    envModel && !MODEL_PRIORITY.includes(envModel)
      ? [envModel, ...MODEL_PRIORITY]
      : MODEL_PRIORITY;

  if (_cachedModelName && Date.now() < _cacheExpiresAt) {
    try {
      logger.info(`[Gemini] Using cached model: ${_cachedModelName}`);
      const result = await tryGeminiModel(_cachedModelName, prompt, 2);
      setCache(prompt, result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = getErrorCode(error);
      logger.warn(
        `[Gemini] Cached model ${_cachedModelName} failed (${code}), trying all candidates...`
      );
      bustCache();
    }
  }

  const tried = new Set(_cachedModelName ? [_cachedModelName] : []);
  let lastError: Error = new Error('Unknown error');

  for (const name of candidates) {
    if (tried.has(name)) continue;
    tried.add(name);

    try {
      logger.info(`[Gemini] Trying model: ${name}`);
      const text = await tryGeminiModel(name, prompt, 2);
      logger.info(`[Gemini] Active model: ${name}`);
      setCache(prompt, text);
      return text;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const code = getErrorCode(error);
      lastError = error;

      if (code === 429) {
        logger.warn(`[Gemini] ${name} → 429 (quota exhausted), trying next...`);
        await sleep(500);
        continue;
      }
      if (code === 404) {
        logger.warn(`[Gemini] ${name} → 404 (not found), trying next...`);
        continue;
      }
      if (code === 503) {
        logger.warn(`[Gemini] ${name} → 503 after all retries, trying next...`);
        await sleep(1000);
        continue;
      }
      throw error;
    }
  }

  const code = getErrorCode(lastError);
  if (code === 503) {
    throw new Error(
      'AI_QUOTA_EXCEEDED: Gemini is under high demand. Please wait a few seconds and try again.'
    );
  }
  if (code === 429) {
    throw new Error(
      'AI_QUOTA_EXCEEDED: Gemini API quota exceeded. Try again later or contact your admin.'
    );
  }
  throw new Error(
    `AI_UNAVAILABLE: ${lastError?.message || 'All Gemini models unavailable'}`
  );
}

/**
 * Generates content from an image using Gemini Vision (1.5 Flash)
 */
export async function generateVisionContent(
  prompt: string,
  imageData: string, // base64 string
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType
        }
      }
    ]);

    const text = result?.response?.text?.();
    if (!text) throw new Error('Empty response from AI Vision model');

    return text;
  } catch (err: any) {
    logger.error(`[Gemini Vision] Analysis failed: ${err.message}`);
    throw new Error(`AI Vision Analysis failed: ${err.message}`);
  }
}

export { bustCache };
