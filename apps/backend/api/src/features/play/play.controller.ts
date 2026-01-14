import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IPlayService } from './play.service';
import { TYPES } from '@/shared/types';
import { parseNumericId } from '@/shared/utils/parseId';
import { ValidationError } from '@/shared/errors';

export interface IPlayController {
  startSession(req: Request, res: Response): Promise<Response>;
  getSession(req: Request, res: Response): Promise<Response>;
  getCurrentStep(req: Request, res: Response): Promise<Response>;
  getNextStep(req: Request, res: Response): Promise<Response>;
  validateAnswer(req: Request, res: Response): Promise<Response>;
  requestHint(req: Request, res: Response): Promise<Response>;
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

  async startSession(req: Request, res: Response): Promise<Response> {
    const huntId = parseNumericId(req.params.huntId);

    if (isNaN(huntId)) {
      throw new ValidationError('Invalid hunt ID', []);
    }

    const { playerName } = req.body;

    if (!playerName || typeof playerName !== 'string' || !playerName.trim()) {
      throw new ValidationError('Player name is required', [
        { field: 'playerName', message: 'Player name is required' },
      ]);
    }

    const userId = req.user?.id;

    const result = await this.playService.startSession(huntId, playerName.trim(), userId);

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

  async getCurrentStep(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const result = await this.playService.getCurrentStep(sessionId);

    return res.status(200).json(result);
  }

  async getNextStep(req: Request, res: Response): Promise<Response> {
    const { sessionId } = req.params;

    if (!sessionId || !this.isValidUUID(sessionId)) {
      throw new ValidationError('Invalid session ID', []);
    }

    const result = await this.playService.getNextStep(sessionId);

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

  // TODO: I am sure we can use a built in library or something
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
}
