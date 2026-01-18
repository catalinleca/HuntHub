import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IPlayerInvitation } from '../types/PlayerInvitation';

const playerInvitationSchema: Schema<IPlayerInvitation> = new Schema<IPlayerInvitation>(
  {
    huntId: {
      type: Number,
      required: true,
      ref: 'Hunt',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: 'PlayerInvitation',
  },
);

playerInvitationSchema.index({ huntId: 1, email: 1 }, { unique: true });
playerInvitationSchema.index({ email: 1 });
playerInvitationSchema.index({ huntId: 1 });

interface IPlayerInvitationModel extends Model<IPlayerInvitation> {
  findByHunt(huntId: number): Promise<HydratedDocument<IPlayerInvitation>[]>;
  isInvited(huntId: number, email: string): Promise<boolean>;
}

playerInvitationSchema.statics.findByHunt = function (huntId: number) {
  return this.find({ huntId }).sort({ invitedAt: -1 }).exec();
};

playerInvitationSchema.statics.isInvited = async function (huntId: number, email: string): Promise<boolean> {
  const count = await this.countDocuments({ huntId, email: email.toLowerCase() }).limit(1);
  return count > 0;
};

const PlayerInvitationModel = model<IPlayerInvitation, IPlayerInvitationModel>(
  'PlayerInvitation',
  playerInvitationSchema,
);

export default PlayerInvitationModel;
