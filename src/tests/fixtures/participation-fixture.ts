import { IFixture } from '../utils/fixture';
import { TestApp } from '../utils/test-app';
import {
  I_PARTICIPATION_REPOSITORY,
  ParticipationRepository,
} from '../../webinars/write-side/ports/participation.repository';
import { Participation } from '../../webinars/write-side/entities/participation.entity';

export class ParticipationFixture implements IFixture {
  constructor(public entity: Participation) {}

  async load(app: TestApp): Promise<void> {
    const participationRepository = app.get<ParticipationRepository>(
      I_PARTICIPATION_REPOSITORY,
    );
    await participationRepository.create(this.entity);
  }
}
