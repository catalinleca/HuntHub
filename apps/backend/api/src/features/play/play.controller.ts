import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IPlayService } from './play.service';
import { TYPES } from '@/shared/types';
import { parseNumericId } from '@/shared/utils/parseId';
import { ValidationError } from '@/shared/errors';

export interface IPlayController {
  discoverHunts(req: Request, res: Response): Promise<Response>;
  startSession(req: Request, res: Response): Promise<Response>;
  getSession(req: Request, res: Response): Promise<Response>;
  getStep(req: Request, res: Response): Promise<Response>;
  validateAnswer(req: Request, res: Response): Promise<Response>;
  requestHint(req: Request, res: Response): Promise<Response>;
  requestUpload(req: Request, res: Response): Promise<Response>;
  createAsset(req: Request, res: Response): Promise<Response>;
}

/**
 * All endpoints except startSession use sessionId as the primary identifier.
 * Session ID acts as a bearer token - no Firebase auth required.
 */
@injectable()
export class PlayController implements IPlayController {
  constructor(
    @inject(TYPES.PlayService)
    private playService: IPlayService,
  ) {}

  async discoverHunts(req: Request, res: Response): Promise<Response> {
    const { page, limit } = req.query as unknown as { page: number; limit: number };

    const result = await this.playService.discoverHunts(page, limit);

    return res.status(200).json(result);
  }

  async startSession(req: Request, res: Response): Promise<Response> {
    const { playSlug } = req.params;

    if (!playSlug || typeof playSlug !== 'string') {
      throw new ValidationError('Invalid play slug', []);
    }

    const { playerName, email } = req.body;

    if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
      throw new ValidationError('Player name is required', [
        { field: 'playerName', message: 'Player name is required' },
      ]);
    }

    const userId = req.user?.id;

    const result = await this.playService.startSession(playSlug, playerName.trim(), email, userId);

    return res.status(201).json(result);
  }

  async getSession(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const result = await this.playService.getSession(sessionId);

    return res.status(200).json(result);
  }

  async getStep(req: Request, res: Response): Promise<Response> {
    const { sessionId, stepId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const parsedStepId = parseNumericId(stepId);
    if (isNaN(parsedStepId)) {
      throw new ValidationError('Invalid step ID', []);
    }

    const result = await this.playService.getStep(sessionId, parsedStepId);

    return res.status(200).json(result);
  }

  async validateAnswer(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const { answerType, payload } = req.body;

    if (!answerType) {
      throw new ValidationError('Answer type is required', [
        { field: 'answerType', message: 'Answer type is required' },
      ]);
    }

    if (!payload) {
      throw new ValidationError('Payload is required', [{ field: 'payload', message: 'Answer payload is required' }]);
    }

    const result = await this.playService.validateAnswer(sessionId, { answerType, payload });

    return res.status(200).json(result);
  }

  async requestHint(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const result = await this.playService.requestHint(sessionId);

    return res.status(200).json(result);
  }

  async requestUpload(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;
    const { extension } = req.query;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    if (!extension || typeof extension !== 'string') {
      throw new ValidationError('Extension is required', [{ field: 'extension', message: 'Extension is required' }]);
    }

    const result = await this.playService.requestUpload(sessionId, extension);

    return res.status(200).json(result);
  }

  async createAsset(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const result = await this.playService.createAsset(sessionId, req.body);

    return res.status(201).json(result);
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
