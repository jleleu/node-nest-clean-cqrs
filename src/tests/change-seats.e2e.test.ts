import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinars } from './seeds/webinar-seeds.e2e';
import {
  I_WEBINAR_REPOSITORY,
  WebinarRepository,
} from '../webinars/write-side/ports/webinar.repository';

describe('Change seats', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe, e2eWebinars.webinar1]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('should succeed', async () => {
    const seats = 100;
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer())
      .post(`/webinars/${id}/seats`)
      .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
      .send({
        seats,
      });

    expect(result.status).toBe(200);

    const webinarRepository = app.get<WebinarRepository>(I_WEBINAR_REPOSITORY);
    const webinar = await webinarRepository.findById(id);

    expect(webinar).toBeDefined();
    expect(webinar!.props.seats).toEqual(seats);
  });

  it('should reject', async () => {
    const seats = 100;
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer())
      .post(`/webinars/${id}/seats`)
      .send({
        seats,
      });

    expect(result.status).toBe(403);
  });
});
