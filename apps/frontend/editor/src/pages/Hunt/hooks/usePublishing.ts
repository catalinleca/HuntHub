import { useState } from 'react';
import { Hunt } from '@hunthub/shared';
import { usePublishHunt, useReleaseHunt, useTakeOfflineHunt } from '@/api/Hunt';
import { useDialogStore, useSnackbarStore, DialogVariants } from '@/stores';

interface UsePublishingParams {
  hunt: Hunt;
}

export const usePublishing = ({ hunt }: UsePublishingParams) => {
  const { confirm } = useDialogStore();
  const snackbar = useSnackbarStore();
  const [settingLiveVersion, setSettingLiveVersion] = useState<number | null>(null);

  const publishMutation = usePublishHunt();
  const releaseMutation = useReleaseHunt();
  const takeOfflineMutation = useTakeOfflineHunt();

  const handleRelease = () => {
    confirm({
      title: 'Release Hunt?',
      message: `This will publish your current draft and make it live for players.${hunt.liveVersion ? ` This replaces the currently live version (v${hunt.liveVersion}).` : ''}`,
      confirmText: 'Release',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        let publishedVersion: number | null = null;

        try {
          const publishResult = await publishMutation.mutateAsync(hunt.huntId);
          publishedVersion = publishResult.publishedVersion;
        } catch {
          snackbar.error('Failed to publish');
          return;
        }

        try {
          await releaseMutation.mutateAsync({
            huntId: hunt.huntId,
            request: {
              version: publishedVersion,
              currentLiveVersion: hunt.liveVersion ?? null,
            },
          });
          snackbar.success(`Your hunt is now live!`);
        } catch {
          snackbar.warning(`Published v${publishedVersion}, but release failed. Try from version panel.`);
        }
      },
    });
  };

  const handleSetAsLive = (versionToRelease: number) => {
    confirm({
      title: 'Set as Live?',
      message: `Players will see version ${versionToRelease} of this hunt.${hunt.liveVersion ? ` This replaces the currently live version (v${hunt.liveVersion}).` : ''}`,
      confirmText: 'Set as Live',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        setSettingLiveVersion(versionToRelease);
        try {
          await releaseMutation.mutateAsync({
            huntId: hunt.huntId,
            request: {
              version: versionToRelease,
              currentLiveVersion: hunt.liveVersion ?? null,
            },
          });
          snackbar.success(`v${versionToRelease} is now live!`);
        } finally {
          setSettingLiveVersion(null);
        }
      },
    });
  };

  const handleTakeOffline = () => {
    confirm({
      title: 'Take Hunt Offline?',
      message: `This removes "${hunt.name}" from player discovery. Active sessions continue, and you can release again anytime.`,
      confirmText: 'Take Offline',
      cancelText: 'Cancel',
      variant: DialogVariants.Warning,
      onConfirm: async () => {
        await takeOfflineMutation.mutateAsync({
          huntId: hunt.huntId,
          request: {
            currentLiveVersion: hunt.liveVersion ?? null,
          },
        });
        snackbar.success('Hunt is now offline');
      },
    });
  };

  return {
    handleRelease,
    handleSetAsLive,
    handleTakeOffline,

    isPublishing: publishMutation.isPending,
    isReleasing: releaseMutation.isPending,
    isTakingOffline: takeOfflineMutation.isPending,
    settingLiveVersion,

    latestVersion: hunt.latestVersion,
    liveVersion: hunt.liveVersion ?? null,
  };
};
