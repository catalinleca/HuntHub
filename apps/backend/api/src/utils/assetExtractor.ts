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
        if (media.content.image?.asset?.id) {
          sources.push({
            assetId: media.content.image.asset.id,
            path: `${basePath}.content.image.asset.id`,
          });
        }
        break;

      case 'audio':
        if (media.content.audio?.asset?.id) {
          sources.push({
            assetId: media.content.audio.asset.id,
            path: `${basePath}.content.audio.asset.id`,
          });
        }
        break;

      case 'video':
        if (media.content.video?.asset?.id) {
          sources.push({
            assetId: media.content.video.asset.id,
            path: `${basePath}.content.video.asset.id`,
          });
        }
        break;

      case 'image-audio':
        if (media.content.imageAudio?.image?.asset?.id) {
          sources.push({
            assetId: media.content.imageAudio.image.asset.id,
            path: `${basePath}.content.imageAudio.image.asset.id`,
          });
        }
        if (media.content.imageAudio?.audio?.asset?.id) {
          sources.push({
            assetId: media.content.imageAudio.audio.asset.id,
            path: `${basePath}.content.imageAudio.audio.asset.id`,
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
