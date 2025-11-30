import { StepCreate, StepUpdate, Media, MediaType } from '@hunthub/shared';
import { ExtractedAssets, AssetSource } from '@/services/asset-usage';

export const AssetExtractor = {
  fromDTO(step: StepCreate | StepUpdate): ExtractedAssets {
    const sources: AssetSource[] = [];

    if (step.media) {
      this.extractFromMedia(step.media, 'media', sources);
    }

    const mission = step.challenge?.mission;
    if (mission?.referenceAssetIds) {
      mission.referenceAssetIds.forEach((id, i) => {
        sources.push({
          assetId: id,
          path: `challenge.mission.referenceAssetIds[${i}]`,
        });
      });
    }

    const assetIds = [...new Set(sources.map((s) => s.assetId))];

    return { assetIds, sources };
  },

  extractFromMedia(media: Media, basePath: string, sources: AssetSource[]): void {
    const mediaType = media.type as MediaType;

    switch (mediaType) {
      case 'image':
        if (media.content.image?.assetId) {
          sources.push({
            assetId: media.content.image.assetId,
            path: `${basePath}.content.image.assetId`,
          });
        }
        break;

      case 'audio':
        if (media.content.audio?.assetId) {
          sources.push({
            assetId: media.content.audio.assetId,
            path: `${basePath}.content.audio.assetId`,
          });
        }
        break;

      case 'video':
        if (media.content.video?.assetId) {
          sources.push({
            assetId: media.content.video.assetId,
            path: `${basePath}.content.video.assetId`,
          });
        }
        break;

      case 'image-audio':
        if (media.content.imageAudio?.imageAssetId) {
          sources.push({
            assetId: media.content.imageAudio.imageAssetId,
            path: `${basePath}.content.imageAudio.imageAssetId`,
          });
        }
        if (media.content.imageAudio?.audioAssetId) {
          sources.push({
            assetId: media.content.imageAudio.audioAssetId,
            path: `${basePath}.content.imageAudio.audioAssetId`,
          });
        }
        break;

      default:
        console.warn(`Unknown media type: ${mediaType}`);
    }
  },

  hasAssets(step: StepCreate | StepUpdate): boolean {
    const { assetIds } = this.fromDTO(step);
    return assetIds.length > 0;
  },

  getAssetCount(step: StepCreate | StepUpdate): number {
    const { assetIds } = this.fromDTO(step);
    return assetIds.length;
  },
};
