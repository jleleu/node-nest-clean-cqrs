import { ChangeSeats } from './change-seats';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import {testUsers} from "../../../users/tests/user-seeds";

describe('Feature: changing the number of seats', () => {
  function expectSeatsToRemainUnchanged() {
    const webinar = webinarRepository.findByIdSync('id-1');
    expect(webinar!.props.seats).toBe(50);
  }

  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My Webinar',
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
    seats: 50,
  });

  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  describe('Scenario: happy path', () => {
    it('should change the number of seats', async () => {
      const payload = {
        user: testUsers.alice,
        webinarId: 'id-1',
        seats: 100,
      };

      await useCase.execute(payload);

      const webinar = await webinarRepository.findById('id-1');
      expect(webinar!.props.seats).toBe(100);
    });
  });

  describe('Scenario: the webinar does not exist', () => {
    it('should throw an error', async () => {
      const payload = {
        user: testUsers.alice,
        webinarId: 'id-2',
        seats: 100,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar not found',
      );

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: updating the webinar of someone else', () => {
    it('should throw an error', async () => {
      const payload = {
        user: testUsers.bob,
        webinarId: 'id-1',
        seats: 100,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinar',
      );

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: reducing the number of seats', () => {
    it('should throw an error', async () => {
      const payload = {
        user: testUsers.alice,
        webinarId: 'id-1',
        seats: 49,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot reduce the number of seats',
      );

      expectSeatsToRemainUnchanged();
    });
  });

  describe('Scenario: reducing the number of seats', () => {
    it('should throw an error', async () => {
      const payload = {
        user: testUsers.alice,
        webinarId: 'id-1',
        seats: 1001,
      };

      await expect(useCase.execute(payload)).rejects.toThrow(
        'You cannot have more than 1000 seats',
      );

      expectSeatsToRemainUnchanged();
    });
  });
});
