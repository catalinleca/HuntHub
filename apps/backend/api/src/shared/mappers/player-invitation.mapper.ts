import { PlayerInvitation } from '@hunthub/shared';
import { IPlayerInvitation } from '@/database/types/PlayerInvitation';
import { HydratedDocument } from 'mongoose';

export class PlayerInvitationMapper {
  static toDTO(doc: HydratedDocument<IPlayerInvitation>): PlayerInvitation {
    return {
      huntId: doc.huntId,
      email: doc.email,
      invitedBy: doc.invitedBy.toString(),
      invitedAt: doc.invitedAt.toISOString(),
    };
  }
}
