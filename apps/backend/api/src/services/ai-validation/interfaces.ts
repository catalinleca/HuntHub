export interface TextValidationParams {
  userResponse: string;
  instructions: string;
  aiInstructions?: string;
}

export interface AudioValidationParams {
  audioBuffer: Buffer;
  mimeType: string;
  instructions: string;
  aiInstructions?: string;
}

export interface ValidationResponse {
  isValid: boolean;
  confidence: number;
  feedback: string;
}

export interface AudioValidationResponse extends ValidationResponse {
  transcript?: string;
}

export interface ITextValidationProvider {
  readonly name: string;
  validateText(params: TextValidationParams): Promise<ValidationResponse>;
}

export interface IAudioValidationProvider {
  readonly name: string;
  validateAudio(params: AudioValidationParams): Promise<AudioValidationResponse>;
}
