import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinars } from './seeds/webinar-seeds.e2e';
import {
  I_PARTICIPATION_REPOSITORY,
  ParticipationRepository,
} from '../webinars/write-side/ports/participation.repository';

describe('Reserve Seat', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([
      e2eUsers.johnDoe,
      e2eUsers.bob,
      e2eWebinars.webinar1,
    ]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('should succeed', async () => {
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer())
      .post(`/webinars/${id}/participations`)
      .set('Authorization', e2eUsers.bob.createAuthorizationToken());

    expect(result.status).toBe(201);

    const participationRepository = app.get<ParticipationRepository>(
      I_PARTICIPATION_REPOSITORY,
    );
    const participation = await participationRepository.findOne(
      e2eUsers.bob.entity.props.id,
      id,
    );

    expect(participation).not.toBeNull();
  });

  it('should reject', async () => {
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer()).post(
      `/webinars/${id}/participations`,
    );

    expect(result.status).toBe(403);
  });
});
