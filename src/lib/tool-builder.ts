/**
 * AI Tool Builder — generates React components via Claude API.
 * Premium feature: 20 generations per month.
 */

const SYSTEM_PROMPT = `You are a utility tool generator for FreeToolStack. You generate self-contained React functional components that run in the browser.

RULES:
1. Output ONLY a single React component as a default export
2. Use only: useState, useEffect, useRef, useMemo, useCallback from React
3. Use Tailwind CSS classes for styling (primary-*, surface-*, rounded-lg, etc.)
4. NO external imports, NO fetch calls, NO network access
5. All processing must happen client-side in the browser
6. Use Web APIs: Canvas, FileReader, Blob, URL.createObjectURL, crypto.subtle, Web Audio, etc.
7. Include proper labels, inputs, outputs, and a clean UI
8. Handle edge cases and show helpful error messages
9. Maximum 200 lines of code

OUTPUT FORMAT — return ONLY the component code wrapped in a code block:
\`\`\`tsx
import { useState } from 'react';

export default function ToolName() {
  // implementation
}
\`\`\`

Do not include any explanation outside the code block.`;

const MAX_GENERATIONS_PER_MONTH = 20;

export interface GenerationResult {
  code: string;
  title: string;
  description: string;
  tokensUsed: { prompt: number; completion: number };
}

export async function generateTool(
  prompt: string,
  apiKey: string,
): Promise<GenerationResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Create a utility tool: ${prompt}\n\nAlso include a one-line title and description as comments at the top of the component: // Title: ... and // Description: ...`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0]?.text || '';

  // Extract code from markdown code block
  const codeMatch = text.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]*?)```/);
  if (!codeMatch) throw new Error('Failed to generate valid component code');

  const code = codeMatch[1].trim();

  // Extract title and description from comments
  const titleMatch = code.match(/\/\/\s*Title:\s*(.+)/);
  const descMatch = code.match(/\/\/\s*Description:\s*(.+)/);
  const title = titleMatch?.[1]?.trim() || 'Custom Tool';
  const description = descMatch?.[1]?.trim() || prompt.slice(0, 160);

  return {
    code,
    title,
    description,
    tokensUsed: {
      prompt: data.usage?.input_tokens || 0,
      completion: data.usage?.output_tokens || 0,
    },
  };
}

export { MAX_GENERATIONS_PER_MONTH };
