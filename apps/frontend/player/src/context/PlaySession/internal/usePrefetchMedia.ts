import { useEffect } from 'react';
import { MediaType, type Media } from '@hunthub/shared';

type PrefetchAsset = {
  url: string;
  kind: 'image' | 'audio' | 'video';
};

const prefetchedAssets = new Map<string, HTMLImageElement | HTMLMediaElement>();

const extractPrefetchAssets = (media?: Media | null): PrefetchAsset[] => {
  if (!media) {
    return [];
  }

  switch (media.type) {
    case MediaType.Image: {
      const image = media.content.image;
      return image ? [{ url: image.asset.url, kind: 'image' }] : [];
    }
    case MediaType.Audio: {
      const audio = media.content.audio;
      return audio ? [{ url: audio.asset.url, kind: 'audio' }] : [];
    }
    case MediaType.Video: {
      const video = media.content.video;
      return video ? [{ url: video.asset.url, kind: 'video' }] : [];
    }
    case MediaType.ImageAudio: {
      const imageAudio = media.content.imageAudio;
      if (!imageAudio) {
        return [];
      }

      return [
        { url: imageAudio.image.asset.url, kind: 'image' },
        { url: imageAudio.audio.asset.url, kind: 'audio' },
      ];
    }
    default:
      return [];
  }
};

const prefetchAsset = ({ url, kind }: PrefetchAsset) => {
  if (!url || prefetchedAssets.has(url)) {
    return;
  }

  if (kind === 'image') {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    prefetchedAssets.set(url, img);
    return;
  }

  const element = document.createElement(kind);
  element.preload = 'auto';
  element.src = url;
  element.load();
  prefetchedAssets.set(url, element);
};

export const usePrefetchMedia = (media?: Media | null) => {
  useEffect(() => {
    if (!media || typeof window === 'undefined') {
      return;
    }

    const assets = extractPrefetchAssets(media);
    assets.forEach(prefetchAsset);
  }, [media]);
};
