import { GenerateHuntStyle } from '@hunthub/shared';

const CHALLENGE_TYPE_DOCS = `
## Challenge Types

You must use these exact structures. Each step has a "type" and a "challenge" object with exactly one populated field matching the type.

### 1. Clue (type: "clue")
Informational hint or story narrative. Player reads and acknowledges.
\`\`\`json
{
  "type": "clue",
  "challenge": {
    "clue": {
      "title": "The Beginning",
      "description": "Your adventure starts at the old oak tree..."
    }
  }
}
\`\`\`

### 2. Quiz - Multiple Choice (type: "quiz", challenge.quiz.type: "choice")
Player selects one correct answer from options.
\`\`\`json
{
  "type": "quiz",
  "challenge": {
    "quiz": {
      "title": "History Question",
      "description": "In what year was this building constructed?",
      "type": "choice",
      "options": [
        { "id": "a", "text": "1892" },
        { "id": "b", "text": "1905" },
        { "id": "c", "text": "1923" },
        { "id": "d", "text": "1948" }
      ],
      "targetId": "b"
    }
  }
}
\`\`\`
IMPORTANT: "targetId" must match one of the option IDs exactly.

### 3. Quiz - Text Input (type: "quiz", challenge.quiz.type: "input")
Player types an answer that must match expected answer.
\`\`\`json
{
  "type": "quiz",
  "challenge": {
    "quiz": {
      "title": "Riddle",
      "description": "I have cities, but no houses. I have mountains, but no trees. What am I?",
      "type": "input",
      "expectedAnswer": "map"
    }
  }
}
\`\`\`

### 4. Mission - Photo Upload (type: "mission")
Player must take a photo as proof of completing a task.
\`\`\`json
{
  "type": "mission",
  "challenge": {
    "mission": {
      "title": "Capture the Moment",
      "description": "Take a selfie with the statue in the background",
      "type": "upload-media"
    }
  }
}
\`\`\`
IMPORTANT: Only use type "upload-media". Never use "match-location".

### 5. Task (type: "task")
Open-ended task where player submits a text response.
\`\`\`json
{
  "type": "task",
  "challenge": {
    "task": {
      "title": "Creative Challenge",
      "instructions": "Write a short poem (4 lines) inspired by your surroundings"
    }
  }
}
\`\`\`
`;

const OUTPUT_FORMAT = `
## Output Format

Return a valid JSON object with this exact structure:
\`\`\`json
{
  "name": "Hunt title (1-100 characters)",
  "description": "Brief hunt description (optional, max 500 characters)",
  "steps": [
    // Array of step objects as shown above
  ]
}
\`\`\`

## Rules
1. Return ONLY valid JSON. No markdown, no explanations, no code fences.
2. Each step must have "type" and "challenge" fields.
3. The "challenge" object must have exactly ONE field matching the type.
4. For quiz-choice: "targetId" must match an option "id".
5. For quiz-input: "expectedAnswer" must be a non-empty string.
6. For mission: always use type "upload-media".
7. For task: "instructions" must be a non-empty string.
8. Create variety - mix different challenge types.
9. Do NOT include: locations, media, timeLimit, maxAttempts.
10. Each step can optionally have a "hint" field with a brief hint for players who get stuck.
11. Generate between 3-10 steps based on the complexity implied by the description.
`;

const STYLE_PROMPTS: Record<GenerateHuntStyle, string> = {
  educational: `
Style: EDUCATIONAL
- Focus on learning and discovery
- Include factual information and interesting trivia
- Use quiz questions to test knowledge
- Make it informative yet engaging
- Suitable for all ages`,

  adventure: `
Style: ADVENTURE
- Create excitement and mystery
- Use dramatic narrative in clues
- Include challenging puzzles
- Build suspense through the story
- Make players feel like explorers`,

  'team-building': `
Style: TEAM BUILDING
- Design tasks that require collaboration
- Include challenges that need multiple people
- Focus on communication and teamwork
- Add fun competitive elements
- Encourage group problem-solving`,

  'family-friendly': `
Style: FAMILY FRIENDLY
- Keep content appropriate for all ages
- Use simple, clear language
- Make challenges accessible to children
- Include fun, playful elements
- Balance difficulty for mixed age groups`,
};

export const buildSystemPrompt = (): string => {
  return `You are a treasure hunt designer. You create engaging, creative treasure hunts with varied challenge types.

${CHALLENGE_TYPE_DOCS}

${OUTPUT_FORMAT}`;
};

export const buildUserPrompt = (prompt: string, style: GenerateHuntStyle | undefined): string => {
  const styleSection = style ? STYLE_PROMPTS[style] : '';

  return `Create a treasure hunt based on this description:
"${prompt}"

Requirements:
- Determine the appropriate number of steps (3-10) based on the scope and complexity described
- Use a variety of challenge types (clue, quiz, mission, task)
- Make it engaging and coherent
${styleSection}

Remember: Return ONLY the JSON object. No other text.`;
};
