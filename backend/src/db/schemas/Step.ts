import mongoose from 'mongoose';
export interface IOption {
  id: string;
  content: string;
}

export enum QuizType {
  Choice = 'choice',
  Input = 'input',
}

export enum MissionType {
  UploadMedia = 'upload-media',
  MatchLocation = 'match-location',
}

export enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

export interface IClue {
  type: ChallengeType.Clue;
  title: string;
  text: string;
}

export interface IQuizStep {
  type: ChallengeType.Quiz;
  target: IOption;
  quizType: QuizType;
  distractors?: IOption[];
}

export interface IMissionStep {
  type: ChallengeType.Mission;
  missionType: MissionType;
  targetAsset?: string;
  targetLocation?: Location;
}

export interface ITaskStep {
  type: ChallengeType.Task;
  target: IOption;
}

export type IChallenge = IClue | IQuizStep | IMissionStep | ITaskStep;

export interface IStep {
  huntId: mongoose.Types.ObjectId;
  type: ChallengeType;
  challenge: IChallenge;
  hint?: string;
  requiredLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
  timeLimit?: number;
  maxAttempts?: number;
}
