export const MAX_RESPONSE_CHARS = 500;
export const MAX_INSTRUCTIONS_CHARS = 2000;

export const RESPONSE_FORMAT = {
  isValid: 'boolean',
  confidence: 'number (0-1)',
  feedback: 'string (1-2 sentences, encouraging but accurate)',
};

export const buildTextPrompt = (instructions: string, criteria: string, userResponse: string) => `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}

Player's response: "${userResponse}"

Determine if the response meets the criteria.
Respond with ONLY a JSON object: ${JSON.stringify(RESPONSE_FORMAT)}
`;

export const buildAudioPrompt = (instructions: string, criteria: string) => `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}

Listen to the audio and determine if it meets the criteria.
The audio might contain speech, sounds, music, or environmental audio.

Respond with ONLY a JSON object (no markdown, no code blocks): ${JSON.stringify(RESPONSE_FORMAT)}
`;
