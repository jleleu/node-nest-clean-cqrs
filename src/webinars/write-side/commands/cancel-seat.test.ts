import { CancelSeat } from './cancel-seat';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import { Webinar } from '../entities/webinar.entity';
import { Participation } from '../entities/participation.entity';
import {testUsers} from "../../../users/tests/user-seeds";
import {InMemoryUserRepository} from "../../../users/adapters/in-memory.user-repository";
import {InMemoryMailer} from "../../../core/adapters/in-memory-mailer";

describe('Feature: cancel seat', () => {
  function expectParticipationNotToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );

    expect(storedParticipation).not.toBeNull();
  }
  function expectParticipationToBeDeleted() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );

    expect(storedParticipation).toBeNull();
  }

  const webinar = new Webinar({
    id: 'id-1',
    organizerId: 'alice',
    title: 'My Webinar',
    seats: 50,
    startDate: new Date('2023-01-10T10:00:00Z'),
    endDate: new Date('2023-01-10T11:00:00Z'),
  });

  const bobParticipation = new Participation({
    userId: testUsers.bob.props.id,
    webinarId: webinar.props.id,
  });

  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;

  let useCase: CancelSeat;

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    participationRepository = new InMemoryParticipationRepository([
      bobParticipation,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
    ]);
    mailer = new InMemoryMailer();

    useCase = new CancelSeat(
      webinarRepository,
      participationRepository,
      userRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: webinar.props.id,
    };

    it('should cancel seat', async () => {
      await useCase.execute(payload);

      expectParticipationToBeDeleted();
    });

    it('should send email to the organizer', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: 'A participant has canceled their seat',
        body: `A participant has canceled their seat to the webinar "${webinar.props.title}"`,
      });
    });

    it('should send email to the participant', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: 'Your participation cancellation',
        body: `You have canceled your participation to the webinar`,
      });
    });
  });

  describe('Scenario: webinar not found', () => {
    const payload = {
      user: testUsers.bob,
      webinarId: 'random-id',
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Webinar not found',
      );

      expectParticipationNotToBeDeleted();
    });
  });

  describe('Scenario: the user did not reserve a seat', () => {
    const payload = {
      user: testUsers.charles,
      webinarId: webinar.props.id,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        'Participation not found',
      );

      expectParticipationNotToBeDeleted();
    });
  });
});
