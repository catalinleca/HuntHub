import { Hunt } from '@hunthub/shared';
import { usePublishHunt, useReleaseHunt, useTakeOfflineHunt } from '@/api/Hunt';
import { useDialogStore, useSnackbarStore, DialogVariants } from '@/stores';

interface UsePublishingParams {
  hunt: Hunt;
}

export const usePublishing = ({ hunt }: UsePublishingParams) => {
  const { confirm } = useDialogStore();
  const snackbar = useSnackbarStore();

  const publishMutation = usePublishHunt();
  const releaseMutation = useReleaseHunt();
  const takeOfflineMutation = useTakeOfflineHunt();

  const handlePublish = () => {
    confirm({
      title: 'Publish Version?',
      message: `This will create an immutable snapshot (v${hunt.latestVersion}) of your hunt. You can then release it from the version panel to make it visible to players.`,
      confirmText: 'Publish',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        const result = await publishMutation.mutateAsync(hunt.huntId);
        snackbar.success(`Published v${result.publishedVersion}! Ready to release.`);
      },
    });
  };

  const handlePublishAndRelease = () => {
    confirm({
      title: 'Publish & Go Live?',
      message: `This will create version ${hunt.latestVersion} and immediately make it live for players.${hunt.liveVersion ? ` This will replace the currently live version (v${hunt.liveVersion}).` : ''}`,
      confirmText: 'Publish & Go Live',
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
          snackbar.success(`v${publishedVersion} is now live!`);
        } catch {
          snackbar.warning(`Published v${publishedVersion}, but release failed. Try releasing from version panel.`);
        }
      },
    });
  };

  const handleRelease = (versionToRelease: number) => {
    confirm({
      title: 'Release to Players?',
      message: `Players will be able to find and play version ${versionToRelease} of this hunt immediately.${hunt.liveVersion ? ` This will replace the currently live version (v${hunt.liveVersion}).` : ''}`,
      confirmText: 'Go Live',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        await releaseMutation.mutateAsync({
          huntId: hunt.huntId,
          request: {
            version: versionToRelease,
            currentLiveVersion: hunt.liveVersion ?? null,
          },
        });
        snackbar.success(`v${versionToRelease} is now live!`);
      },
    });
  };

  const handleTakeOffline = () => {
    confirm({
      title: 'Take Hunt Offline?',
      message: `This will remove "${hunt.name}" from player discovery. Players won't be able to find or start new sessions. Active sessions will continue, and you can release again anytime.`,
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
    handlePublish,
    handlePublishAndRelease,
    handleRelease,
    handleTakeOffline,

    isPublishing: publishMutation.isPending,
    isReleasing: releaseMutation.isPending,
    isTakingOffline: takeOfflineMutation.isPending,

    version: hunt.version,
    latestVersion: hunt.latestVersion,
    liveVersion: hunt.liveVersion ?? null,
    isLive: hunt.isLive ?? false,
  };
};
