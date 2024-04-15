import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { addDays } from 'date-fns';
import { e2eWebinars } from './seeds/webinar-seeds.e2e';
import {
  I_WEBINAR_REPOSITORY,
  WebinarRepository,
} from '../webinars/write-side/ports/webinar.repository';

describe('Change dates', () => {
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
    const startDate = addDays(new Date(), 5);
    const endDate = addDays(new Date(), 6);
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer())
      .post(`/webinars/${id}/dates`)
      .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
      .send({
        startDate,
        endDate,
      });

    expect(result.status).toBe(200);

    const webinarRepository = app.get<WebinarRepository>(I_WEBINAR_REPOSITORY);
    const webinar = await webinarRepository.findById(id);

    expect(webinar).toBeDefined();
    expect(webinar!.props.startDate).toEqual(startDate);
    expect(webinar!.props.endDate).toEqual(endDate);
  });

  it('should reject', async () => {
    const startDate = addDays(new Date(), 5);
    const endDate = addDays(new Date(), 6);
    const id = e2eWebinars.webinar1.entity.props.id;

    const result = await request(app.getHttpServer())
      .post(`/webinars/${id}/dates`)
      .send({
        startDate,
        endDate,
      });

    expect(result.status).toBe(403);
  });
});
