import { OrganizeWebinar } from './organize-webinar';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { Webinar } from '../entities/webinar.entity';
import {FixedIdGenerator} from "../../../core/adapters/fixed-id-generator";
import {FixedDateGenerator} from "../../../core/adapters/fixed-date-generator";
import {testUsers} from "../../../users/tests/user-seeds";

describe('Organize Webinar', () => {
  function expectWebinarToEqual(webinar: Webinar) {
    expect(webinar.props).toEqual({
      id: 'id-1',
      organizerId: 'alice',
      title: 'My Webinar',
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      seats: 100,
    });
  }

  let repository: InMemoryWebinarRepository;
  let idGenerator: FixedIdGenerator;
  let dateGenerator: FixedDateGenerator;
  let usecase: OrganizeWebinar;

  beforeEach(() => {
    repository = new InMemoryWebinarRepository();
    idGenerator = new FixedIdGenerator();
    dateGenerator = new FixedDateGenerator();
    usecase = new OrganizeWebinar(repository, idGenerator, dateGenerator);
  });

  describe('happy path', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My Webinar',
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      seats: 100,
    };

    it('should return the id', async () => {
      const result = await usecase.execute(payload);
      expect(result.id).toBe('id-1');
    });

    it('should save webinar into database', async () => {
      await usecase.execute(payload);

      expect(repository.database).toHaveLength(1);

      const createdWebinar = repository.database[0];
      expectWebinarToEqual(createdWebinar);
    });
  });

  describe('The webinar happens too soon', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My Webinar',
      startDate: new Date('2023-01-01T10:00:00.000Z'),
      endDate: new Date('2023-01-01T11:00:00.000Z'),
      seats: 100,
    };

    it('should throw an error', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrow(
        'The webinar must happen in at least 3 days',
      );
    });

    it('should not create a webinar', async () => {
      try {
        await usecase.execute(payload);
      } catch (error) {}
      expect(repository.database).toHaveLength(0);
    });
  });

  describe('The webinar has too many seats', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My Webinar',
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      seats: 1001,
    };

    it('should throw an error', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrow(
        'You cannot have more than 1000 seats',
      );
    });

    it('should not create a webinar', async () => {
      try {
        await usecase.execute(payload);
      } catch (error) {}
      expect(repository.database).toHaveLength(0);
    });
  });

  describe('The webinar does not have enough seats', () => {
    const payload = {
      user: testUsers.alice,
      title: 'My Webinar',
      startDate: new Date('2023-01-10T10:00:00.000Z'),
      endDate: new Date('2023-01-10T11:00:00.000Z'),
      seats: 0,
    };

    it('should throw an error', async () => {
      await expect(() => usecase.execute(payload)).rejects.toThrow(
        'The webinar must have at least 1 seat',
      );
    });

    it('should not create a webinar', async () => {
      try {
        await usecase.execute(payload);
      } catch (error) {}
      expect(repository.database).toHaveLength(0);
    });
  });
});
