import { Participation } from '../entities/participation.entity';
import { ParticipationRepository } from '../ports/participation.repository';

export class InMemoryParticipationRepository
  implements ParticipationRepository
{
  constructor(public readonly database: Participation[] = []) {}

  async findByWebinarId(id: string): Promise<Participation[]> {
    return this.database.filter((p) => p.props.webinarId === id);
  }

  async findOne(
    userId: string,
    webinarId: string,
  ): Promise<Participation | null> {
    return this.findOneSync(userId, webinarId);
  }

  findOneSync(userId: string, webinarId: string): Participation | null {
    return (
      this.database.find(
        (p) => p.props.userId === userId && p.props.webinarId === webinarId,
      ) ?? null
    );
  }

  async create(participation: Participation): Promise<void> {
    this.database.push(participation);
  }

  async findParticipationCount(webinarId: string): Promise<number> {
    return this.database.reduce((count, participation) => {
      return participation.props.webinarId === webinarId ? count + 1 : count;
    }, 0);
  }

  async delete(participation: Participation): Promise<void> {
    const index = this.database.findIndex(
      (p) =>
        p.props.userId === participation.props.userId &&
        p.props.webinarId === participation.props.webinarId,
    );

    this.database.splice(index, 1);
  }
}
