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

const getAttemptGuidance = (attemptCount?: number): string => {
  if (attemptCount === undefined) {
    return '';
  }

  const attempt = attemptCount + 1;
  if (attempt >= 4) {
    return 'The player is struggling. Provide a helpful hint in your feedback to guide them toward the answer.';
  }
  if (attempt >= 3) {
    return 'The player has tried a few times. Consider providing a subtle hint in your feedback.';
  }

  return '';
};

export const buildTextPrompt = (
  instructions: string,
  criteria: string,
  userResponse: string,
  attemptCount?: number,
) => {
  const attemptGuidance = getAttemptGuidance(attemptCount);
  return `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}

Player's response: "${userResponse}"
${attemptCount !== undefined ? `Current attempt: ${attemptCount + 1}` : ''}
${attemptGuidance}

Determine if the response meets the criteria.
Respond with ONLY a JSON object: ${JSON.stringify(TEXT_RESPONSE_FORMAT_EXAMPLE)}
`;
};

export const buildAudioPrompt = (instructions: string, criteria: string, attemptCount?: number) => {
  const attemptGuidance = getAttemptGuidance(attemptCount);
  return `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}
${attemptCount !== undefined ? `Current attempt: ${attemptCount + 1}` : ''}
${attemptGuidance}

Listen to the audio and determine if it meets the criteria.
The audio might contain speech, sounds, music, or environmental audio.

IMPORTANT:
- isValid must be true ONLY if the audio clearly meets the validation criteria
- isValid must be false if the audio does NOT meet the criteria (even partially)
- confidence is how certain you are about your isValid decision (0.0 to 1.0)
- feedback should be encouraging but honest about whether they succeeded or need to try again

Respond with ONLY a JSON object (no markdown, no code blocks): ${JSON.stringify(AUDIO_RESPONSE_FORMAT_EXAMPLE)}
`;
};

export const IMAGE_RESPONSE_FORMAT_EXAMPLE = {
  isValid: false,
  confidence: 0.85,
  feedback: '1-2 sentences, encouraging but accurate',
};

export const buildImagePrompt = (instructions: string, criteria: string, attemptCount?: number) => {
  const attemptGuidance = getAttemptGuidance(attemptCount);
  return `
You are a treasure hunt validation assistant.
A player was given this task: "${instructions}"

Validation criteria: ${criteria}
${attemptCount !== undefined ? `Current attempt: ${attemptCount + 1}` : ''}
${attemptGuidance}

Look at the image and determine if it meets the criteria.

IMPORTANT:
- isValid must be true ONLY if the image clearly meets the validation criteria
- isValid must be false if the image does NOT meet the criteria
- confidence is how certain you are about your isValid decision (0.0 to 1.0)
- feedback should be encouraging but honest

Respond with ONLY a JSON object (no markdown, no code blocks): ${JSON.stringify(IMAGE_RESPONSE_FORMAT_EXAMPLE)}
`;
};
