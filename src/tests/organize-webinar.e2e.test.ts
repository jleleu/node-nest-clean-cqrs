import * as request from 'supertest';
import { addDays } from 'date-fns';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import {
  I_WEBINAR_REPOSITORY,
  WebinarRepository,
} from '../webinars/write-side/ports/webinar.repository';

describe('Organize Webinar', () => {
  let app: TestApp;

  beforeEach(async () => {
    app = new TestApp();
    await app.setup();
    await app.loadFixtures([e2eUsers.johnDoe]);
  });

  afterEach(async () => {
    await app.cleanup();
  });

  it('should organize a webinar', async () => {
    const startDate = addDays(new Date(), 4);
    const endDate = addDays(new Date(), 5);

    const result = await request(app.getHttpServer())
      .post('/webinars')
      .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken())
      .send({
        title: 'My Webinar',
        seats: 100,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

    expect(result.status).toBe(201);
    expect(result.body).toEqual({ id: expect.any(String) });

    const webinarRepository = app.get<WebinarRepository>(I_WEBINAR_REPOSITORY);
    const webinar = await webinarRepository.findById(result.body.id);

    expect(webinar).toBeDefined();
    expect(webinar!.props).toEqual({
      id: result.body.id,
      organizerId: 'john-doe',
      title: 'My Webinar',
      seats: 100,
      startDate,
      endDate,
    });
  });

  it('should reject', async () => {
    const result = await request(app.getHttpServer())
      .post('/webinars')
      .send({
        title: 'My Webinar',
        seats: 100,
        startDate: addDays(new Date(), 4).toISOString(),
        endDate: addDays(new Date(), 5).toISOString(),
      });

    expect(result.status).toBe(403);
  });
});
