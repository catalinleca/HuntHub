import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Asset } from '@hunthub/shared';
import { MediaHelper, typeToMediaType } from '@/components/media/data';
import type { SimpleAssetType } from '@/components/media/data';
import { MediaPreview } from '@/components/media';
import { AssetLibraryDrawer } from '@/components/asset';

export interface FormAssetInputProps {
  name: string;
  type: SimpleAssetType;
  height?: number;
}

export const FormAssetInput = ({ name, type, height = 180 }: FormAssetInputProps) => {
  const { setValue } = useFormContext();
  const [libraryOpen, setLibraryOpen] = useState(false);

  const asset = useWatch({ name });

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
