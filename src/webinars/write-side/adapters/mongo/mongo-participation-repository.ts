import { Model } from 'mongoose';
import { MongoParticipation } from './mongo-participation';
import { ParticipationRepository } from '../../ports/participation.repository';
import { Participation } from '../../entities/participation.entity';

export class MongoParticipationRepository implements ParticipationRepository {
  constructor(private readonly model: Model<MongoParticipation.SchemaClass>) {}

  async findOne(
    userId: string,
    webinarId: string,
  ): Promise<Participation | null> {
    const record = await this.model.findOne({
      userId,
      webinarId,
    });
    if (!record) return null;

    return new Participation({
      userId: record.userId,
      webinarId: record.webinarId,
    });
  }

  async findByWebinarId(id: string): Promise<Participation[]> {
    const records = await this.model.find({ webinarId: id });
    return records.map(
      (record) =>
        new Participation({
          userId: record.userId,
          webinarId: record.webinarId,
        }),
    );
  }

  async findParticipationCount(webinarId: string): Promise<number> {
    return this.model.countDocuments({ webinarId });
  }

  async create(participation: Participation): Promise<void> {
    await this.model.create({
      _id: MongoParticipation.SchemaClass.makeId(participation),
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
  }

  async delete(participation: Participation): Promise<void> {
    await this.model.deleteOne({
      userId: participation.props.userId,
      webinarId: participation.props.webinarId,
    });
  }
}
