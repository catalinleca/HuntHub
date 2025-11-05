import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IPublishingService } from './publishing.service';
import { ValidationError } from '@/shared/errors';
import { TYPES } from '@/shared/types';
import { parseNumericId } from '@/shared/utils/parseId';

export interface IPublishingController {
  publishHunt(req: Request, res: Response): Promise<Response>;
}

/**
 * PublishingController - HTTP handlers for publishing workflow
 */
@injectable()
export class PublishingController implements IPublishingController {
  constructor(
    @inject(TYPES.PublishingService)
    private publishingService: IPublishingService,
  ) {}

  async publishHunt(req: Request, res: Response): Promise<Response> {
    const huntId = parseNumericId(req.params.id);

    if (isNaN(huntId)) {
      throw new ValidationError('Invalid hunt ID', []);
    }

    const result = await this.publishingService.publishHunt(huntId, req.user.id);
    return res.status(200).json({
      success: true,
      publishedVersion: result.version,
      newDraftVersion: result.latestVersion,
      hunt: result,
    });
  }
}
