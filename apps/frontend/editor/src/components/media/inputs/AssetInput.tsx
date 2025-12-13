import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MediaType } from '@hunthub/shared';
import type { Asset } from '@hunthub/shared';
import { MediaHelper } from '@/utils/data/media';
import { MediaPreview } from '../MediaPreview';
import { AssetLibraryDrawer } from '../AssetLibraryDrawer';

export interface AssetInputProps {
  name: string;
  type: 'image' | 'audio' | 'video';
  height?: number;
}

const typeToMediaType = (type: 'image' | 'audio' | 'video'): MediaType => {
  switch (type) {
    case 'image':
      return MediaType.Image;
    case 'audio':
      return MediaType.Audio;
    case 'video':
      return MediaType.Video;
  }
};

export const AssetInput = ({ name, type, height = 180 }: AssetInputProps) => {
  const { setValue, watch } = useFormContext();
  const [libraryOpen, setLibraryOpen] = useState(false);

  const asset = watch(name);

  const handleSelect = (selectedAsset: Asset) => {
    setValue(name, MediaHelper.assetToSnapshot(selectedAsset), { shouldDirty: true });
    setLibraryOpen(false);
  };

  return (
    <>
      <MediaPreview
        asset={asset}
        mediaType={typeToMediaType(type)}
        onClick={() => setLibraryOpen(true)}
        height={height}
      />
      <AssetLibraryDrawer
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handleSelect}
        filterType={type}
      />
    </>
  );
};
