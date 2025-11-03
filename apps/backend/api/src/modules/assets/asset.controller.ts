import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IAssetService } from './asset.service';
import { MimeTypes } from '@/database/types';
import { ValidationError } from '@/shared/errors';
import { ALLOWED_MIME_TYPES } from '@/shared/utils/mimeTypes';
import { TYPES } from '@/shared/types';

export interface IAssetController {
  requestUpload(req: Request, res: Response): Promise<Response>;
  createAsset(req: Request, res: Response): Promise<Response>;
  getAssets(req: Request, res: Response): Promise<Response>;
  getAsset(req: Request, res: Response): Promise<Response>;
  deleteAsset(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class AssetController implements IAssetController {
  constructor(@inject(TYPES.AssetService) private assetService: IAssetService) {}

  requestUpload = async (req: Request, res: Response) => {
    const { extension } = req.query;
    const userId = req.user.id;

    if (!extension || typeof extension !== 'string') {
      return res.status(400).json({
        message: 'extension query parameter required',
      });
    }

    const urls = await this.assetService.requestUpload(userId, extension);

    return res.status(200).json(urls);
  };

  createAsset = async (req: Request, res: Response) => {
    const assetData = req.body;
    const asset = await this.assetService.createAsset(req.user.id, assetData);

    return res.status(201).json(asset);
  };

  getAssets = async (req: Request, res: Response) => {
    const { type } = req.query;

    if (type && typeof type === 'string' && !ALLOWED_MIME_TYPES.includes(type as MimeTypes)) {
      throw new ValidationError(`MIME type '${type}' not allowed`, []);
    }

    const assets = await this.assetService.getUserAssets(
      req.user.id,
      type ? (type as MimeTypes) : undefined
    );

    return res.status(200).json(assets);
  };

  getAsset = async (req: Request, res: Response) => {
    const { id } = req.params;
    const asset = await this.assetService.getAssetById(Number(id), req.user.id);

    return res.status(200).json(asset);
  };

  deleteAsset = async (req: Request, res: Response) => {
    const { id } = req.params;

    await this.assetService.deleteAsset(Number(id), req.user.id);

    return res.status(204).send();
  };
}
