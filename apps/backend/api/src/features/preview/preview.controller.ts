import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IPreviewService } from './preview.service';
import { TYPES } from '@/shared/types';
import { parseNumericId } from '@/shared/utils/parseId';
import { ValidationError } from '@/shared/errors';

export interface IPreviewController {
  generatePreviewLink(req: Request, res: Response): Promise<Response>;
  startPreviewSession(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class PreviewController implements IPreviewController {
  constructor(
    @inject(TYPES.PreviewService)
    private previewService: IPreviewService,
  ) {}

  async generatePreviewLink(req: Request, res: Response): Promise<Response> {
    const huntId = parseNumericId(req.params.id);
    const userId = req.user!.id;

    const result = await this.previewService.generatePreviewLink(huntId, userId);

    return res.status(200).json(result);
  }

  async startPreviewSession(req: Request, res: Response): Promise<Response> {
    const { previewToken } = req.body;

    if (!previewToken || typeof previewToken !== 'string') {
      throw new ValidationError('Preview token is required', [
        { field: 'previewToken', message: 'Preview token is required' },
      ]);
    }

    const result = await this.previewService.startPreviewSession(previewToken);

    return res.status(201).json(result);
  }
}
