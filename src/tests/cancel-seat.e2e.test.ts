import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinars } from './seeds/webinar-seeds.e2e';
import { ParticipationFixture } from './fixtures/participation-fixture';
import { Participation } from '../webinars/write-side/entities/participation.entity';
import {
  I_PARTICIPATION_REPOSITORY,
  ParticipationRepository,
} from '../webinars/write-side/ports/participation.repository';

describe('Cancel Seat', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinars.webinar1,
      new ParticipationFixture(
        new Participation({
          userId: e2eUsers.bob.entity.props.id,
          webinarId: e2eWebinars.webinar1.entity.props.id,
        }),
      ),
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('should succeed', async () => {
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer())
      .delete(`/webinars/${id}/participations`)
      .set('Authorization', e2eUsers.bob.createAuthorizationToken());

    expect(result.status).toBe(200);

    const participationRepository = app.get<ParticipationRepository>(
      I_PARTICIPATION_REPOSITORY,
    );
    const participation = await participationRepository.findOne(
      e2eUsers.bob.entity.props.id,
      id,
    );

    expect(participation).toBeNull();
  });

  it('should reject', async () => {
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer()).delete(
      `/webinars/${id}/participations`,
    );

    expect(result.status).toBe(403);
  });
});
