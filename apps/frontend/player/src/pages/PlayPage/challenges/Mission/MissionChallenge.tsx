import { MissionType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { PhotoMission, AudioMission, LocationMission } from './missions';
import type { ChallengeProps } from '@/types';

type MissionComponent = React.ComponentType<ChallengeProps<MissionPF>>;

const missionComponents: Record<MissionType, MissionComponent> = {
  [MissionType.UploadMedia]: PhotoMission,
  [MissionType.UploadAudio]: AudioMission,
  [MissionType.MatchLocation]: LocationMission,
};

export const MissionChallenge = (props: ChallengeProps<MissionPF>) => {
  const MissionComponent = missionComponents[props.challenge.type];
  return <MissionComponent {...props} />;
};
