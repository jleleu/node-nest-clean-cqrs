import * as request from 'supertest';
import { TestApp } from './utils/test-app';
import { e2eUsers } from './seeds/user-seeds.e2e';
import { e2eWebinars } from './seeds/webinar-seeds.e2e';

describe('Get webinar by id', () => {
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
    const webinar = e2eWebinars.webinar1.entity;
    const organizer = e2eUsers.johnDoe.entity;
    const id = webinar.props.id;

    const result = await request(app.getHttpServer())
      .get(`/webinars/${id}`)
      .set('Authorization', e2eUsers.johnDoe.createAuthorizationToken());

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      id: webinar.props.id,
      title: webinar.props.title,
      startDate: webinar.props.startDate.toISOString(),
      endDate: webinar.props.endDate.toISOString(),
      organizer: {
        id: organizer.props.id,
        emailAddress: organizer.props.emailAddress,
      },
      seats: {
        reserved: 0,
        available: webinar.props.seats,
      },
    });
  });

  it('should reject', async () => {
    const id = e2eWebinars.webinar1.entity.props.id;
    const result = await request(app.getHttpServer()).get(`/webinars/${id}`);
    expect(result.status).toBe(403);
  });
});
