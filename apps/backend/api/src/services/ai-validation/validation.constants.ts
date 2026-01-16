export const MAX_RESPONSE_CHARS = 500;
export const MAX_INSTRUCTIONS_CHARS = 2000;

export const TEXT_RESPONSE_FORMAT_EXAMPLE = {
  isValid: false,
  confidence: 0.85,
  feedback: '1-2 sentences, encouraging but accurate',
};

export const AUDIO_RESPONSE_FORMAT_EXAMPLE = {
  isValid: false,
  confidence: 0.85,
  feedback: '1-2 sentences, encouraging but accurate',
  transcript: 'What the user said in the audio',
};

export const buildTextPrompt = (instructions: string, criteria: string, userResponse: string) => `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}

Player's response: "${userResponse}"

Determine if the response meets the criteria.
Respond with ONLY a JSON object: ${JSON.stringify(TEXT_RESPONSE_FORMAT_EXAMPLE)}
`;

export const buildAudioPrompt = (instructions: string, criteria: string) => `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}

Listen to the audio and determine if it meets the criteria.
The audio might contain speech, sounds, music, or environmental audio.

Respond with ONLY a JSON object (no markdown, no code blocks): ${JSON.stringify(AUDIO_RESPONSE_FORMAT_EXAMPLE)}
`;
