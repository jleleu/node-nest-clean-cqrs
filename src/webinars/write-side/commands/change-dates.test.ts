import { ChangeDates } from './change-dates';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { Participation } from '../entities/participation.entity';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import {FixedDateGenerator} from "../../../core/adapters/fixed-date-generator";
import {testUsers} from "../../../users/tests/user-seeds";
import {InMemoryUserRepository} from "../../../users/adapters/in-memory.user-repository";
import {InMemoryMailer} from "../../../core/adapters/in-memory-mailer";

describe('Feature: Change dates', () => {
  function expectDatesToRemainUnchanged() {
    const updatedWebinar = webinarRepository.findByIdSync('id-1');
    expect(updatedWebinar!.props.startDate).toEqual(webinar.props.startDate);
    expect(updatedWebinar!.props.endDate).toEqual(webinar.props.endDate);
  }

  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My Webinar',
    startDate: new Date('2023-01-10T10:00:00.000Z'),
    endDate: new Date('2023-01-10T11:00:00.000Z'),
    seats: 50,
  });

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinarId: webinar.props.id,
  });

  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let dateGenerator: FixedDateGenerator;
  let mailer: InMemoryMailer;
  let useCase: ChangeDates;

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    dateGenerator = new FixedDateGenerator();
    mailer = new InMemoryMailer();

    useCase = new ChangeDates(
      webinarRepository,
      participationRepository,
      userRepository,
      dateGenerator,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00Z'),
      endDate: new Date('2023-01-21T08:00:00Z'),
    };

    it('should change dates of a webinar', async () => {
      await useCase.execute(payload);

      const updatedWebinar = webinarRepository.findByIdSync('id-1');
      expect(updatedWebinar!.props.startDate).toEqual(payload.startDate);
      expect(updatedWebinar!.props.endDate).toEqual(payload.endDate);
    });

    it('should send an email to the participants', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Webinar dates changed',
          body: `The dates of the webinar "My Webinar" have been changed.`,
        },
      ]);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'not-found-id',
      startDate: new Date('2023-01-20T07:00:00Z'),
      endDate: new Date('2023-01-21T08:00:00Z'),
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar not found',
      );

      expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: updating webinar of someone else', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'id-1',
      startDate: new Date('2023-01-20T07:00:00Z'),
      endDate: new Date('2023-01-21T08:00:00Z'),
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'You are not allowed to update this webinar',
      );

      expectDatesToRemainUnchanged();
    });
  });

  describe('Scenario: ', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: 'id-1',
      startDate: new Date('2023-01-03T00:00:00.000Z'),
      endDate: new Date('2023-01-01T01:00:00.000Z'),
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'The webinar must happen in at least 3 days',
      );

      expectDatesToRemainUnchanged();
    });
  });
});
