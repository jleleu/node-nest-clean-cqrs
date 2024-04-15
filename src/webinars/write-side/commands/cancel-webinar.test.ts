import { CancelWebinar } from './cancel-webinar';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { Participation } from '../entities/participation.entity';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import {InMemoryUserRepository} from "../../../users/adapters/in-memory.user-repository";
import {InMemoryMailer} from "../../../core/adapters/in-memory-mailer";
import {testUsers} from "../../../users/tests/user-seeds";

describe('Feature: Cancel webinar', () => {
  function expectWebinarToBeDeleted() {
    const deletedWebinar = webinarRepository.findByIdSync(webinar.props.id);
    expect(deletedWebinar).toBeNull();
  }

  function expectWebinarToNotBeDeleted() {
    const deletedWebinar = webinarRepository.findByIdSync(webinar.props.id);
    expect(deletedWebinar).not.toBeNull();
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
  let mailer: InMemoryMailer;
  let useCase: CancelWebinar;

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
    useCase = new CancelWebinar(
      webinarRepository,
      participationRepository,
      userRepository,
      mailer,
    );
  });

  describe('Scenario: happy path', () => {
    const payload = {
      user: testUsers.alice,
      webinarId: webinar.props.id,
    };

    it('should cancel a webinar', async () => {
      await useCase.execute(payload);

      expectWebinarToBeDeleted();
    });

    it('should send an email to the participants', async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails).toEqual([
        {
          to: testUsers.bob.props.emailAddress,
          subject: 'Webinar Canceled',
          body: 'The webinar "My Webinar" has been canceled.',
        },
      ]);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    it('should fail', async () => {
      await expect(
        useCase.execute({
          user: testUsers.alice,
          webinarId: 'non-existing-id',
        }),
      ).rejects.toThrow('Webinar not found');

      expectWebinarToNotBeDeleted();
    });
  });

  describe('Scenario: deleting webinar of someone else', () => {
    it('should fail', async () => {
      await expect(
        useCase.execute({
          user: testUsers.bob,
          webinarId: webinar.props.id,
        }),
      ).rejects.toThrow('You are not allowed to update this webinar');

      expectWebinarToNotBeDeleted();
    });
  });
});
