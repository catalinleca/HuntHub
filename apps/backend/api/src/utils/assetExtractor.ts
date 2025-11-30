import { StepCreate, StepUpdate, Media, MediaType } from '@hunthub/shared';
import { ExtractedAssets, AssetSource } from '@/services/asset-usage';

/**
 * AssetExtractor - Pure utility for extracting asset references from step data
 *
 * Single source of truth for finding assetIds in step documents.
 * Update this when adding new media locations to steps.
 *
 * Benefits:
 * - Centralized extraction logic
 * - Easy to extend for new media fields
 * - Pure functions (testable, predictable)
 */
export const AssetExtractor = {
  /**
   * Extract all asset references from step data.
   *
   * @param step - StepCreate or StepUpdate data
   * @returns Object with deduplicated assetIds and detailed sources
   */
  fromDTO(step: StepCreate | StepUpdate): ExtractedAssets {
    const sources: AssetSource[] = [];

    // 1. Step.media (universal media field)
    if (step.media) {
      this.extractFromMedia(step.media, 'media', sources);
    }

    // 2. Mission.referenceAssetIds (challenge-specific)
    const mission = step.challenge?.mission;
    if (mission?.referenceAssetIds) {
      mission.referenceAssetIds.forEach((id, i) => {
        sources.push({
          assetId: id,
          path: `challenge.mission.referenceAssetIds[${i}]`,
        });
      });
    }

    // Deduplicate assetIds (same asset may be referenced multiple times)
    const assetIds = [...new Set(sources.map((s) => s.assetId))];

    return { assetIds, sources };
  },

  /**
   * Extract asset references from Media object.
   *
   * @param media - Media object to extract from
   * @param basePath - Base path for field reference (e.g., 'media')
   * @param sources - Array to push sources into
   */
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
        // Unknown media type - log warning but don't fail
        console.warn(`Unknown media type: ${mediaType}`);
    }
  },

  /**
   * Check if step has any asset references
   *
   * @param step - StepCreate or StepUpdate data
   * @returns True if step references at least one asset
   */
  hasAssets(step: StepCreate | StepUpdate): boolean {
    const { assetIds } = this.fromDTO(step);
    return assetIds.length > 0;
  },

  /**
   * Get count of unique assets referenced by step
   *
   * @param step - StepCreate or StepUpdate data
   * @returns Number of unique assets referenced
   */
  getAssetCount(step: StepCreate | StepUpdate): number {
    const { assetIds } = this.fromDTO(step);
    return assetIds.length;
  },
};
