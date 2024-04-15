import { ReserveSeatCommand, ReserveSeatCommandHandler } from "./reserve-seat";
import { InMemoryParticipationRepository } from "../adapters/in-memory.participation.repository";
import { Webinar } from "../entities/webinar.entity";
import { InMemoryWebinarRepository } from "../adapters/in-memory.webinar.repository";
import { Participation } from "../entities/participation.entity";
import { testUsers } from "../../../users/tests/user-seeds";
import { InMemoryUserRepository } from "../../../users/adapters/in-memory.user-repository";
import { InMemoryMailer } from "../../../core/adapters/in-memory-mailer";

describe("Feature: Reserve seat", () => {
  function expectParticipationNotToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );

    expect(storedParticipation).toBeNull();
  }

  function expectParticipationToBeCreated() {
    const storedParticipation = participationRepository.findOneSync(
      testUsers.bob.props.id,
      webinar.props.id,
    );

    expect(storedParticipation).not.toBeNull();
  }

  const webinar = new Webinar({
    id: "id-1",
    organizerId: "alice",
    title: "My Webinar",
    startDate: new Date("2023-01-10T10:00:00.000Z"),
    endDate: new Date("2023-01-10T11:00:00.000Z"),
    seats: 50,
  });

  const webinarWithFewSeats = new Webinar({
    id: "id-2",
    organizerId: "alice",
    title: "My Webinar",
    startDate: new Date("2023-01-10T10:00:00.000Z"),
    endDate: new Date("2023-01-10T11:00:00.000Z"),
    seats: 1,
  });

  const charlesParticipation = new Participation({
    userId: testUsers.charles.props.id,
    webinarId: webinarWithFewSeats.props.id,
  });

  let participationRepository: InMemoryParticipationRepository;
  let webinarRepository: InMemoryWebinarRepository;
  let userRepository: InMemoryUserRepository;
  let mailer: InMemoryMailer;
  let useCase: ReserveSeatCommandHandler;

  beforeEach(() => {
    participationRepository = new InMemoryParticipationRepository([
      charlesParticipation,
    ]);
    webinarRepository = new InMemoryWebinarRepository([
      webinar,
      webinarWithFewSeats,
    ]);
    userRepository = new InMemoryUserRepository([
      testUsers.alice,
      testUsers.bob,
      testUsers.charles,
    ]);
    mailer = new InMemoryMailer();
    useCase = new ReserveSeatCommandHandler(
      participationRepository,
      webinarRepository,
      userRepository,
      mailer,
    );
  });

  describe("Scenario: happy path", () => {
    const payload = new ReserveSeatCommand(testUsers.bob, webinar.props.id);

    it("should reserve a seat", async () => {
      await useCase.execute(payload);

      expectParticipationToBeCreated();
    });

    it("should send an email to the organizer", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[0]).toEqual({
        to: testUsers.alice.props.emailAddress,
        subject: "New participation",
        body: `A new user has reserved a seat for your webinar "${webinar.props.title}"`,
      });
    });

    it("should send an email to the participant", async () => {
      await useCase.execute(payload);

      expect(mailer.sentEmails[1]).toEqual({
        to: testUsers.bob.props.emailAddress,
        subject: "Your participation to a webinar",
        body: `You have reserved a seat for the webinar "${webinar.props.title}"`,
      });
    });
  });

  describe("Scenario: webinar does not exist", () => {
    const payload = new ReserveSeatCommand(testUsers.bob, "random-id");

    it("should fail", async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        "Webinar not found",
      );

      expectParticipationNotToBeCreated();
    });
  });

  describe("Scenario: webinar does not have enough seats", () => {
    const payload = new ReserveSeatCommand(
      testUsers.bob,
      webinarWithFewSeats.props.id,
    );

    it("should fail", async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        "No more seats available",
      );

      expectParticipationNotToBeCreated();
    });
  });
  describe("Scenario: the user already participates in the webinar", () => {
    const payload = new ReserveSeatCommand(
      testUsers.charles,
      webinarWithFewSeats.props.id,
    );

    it("should fail", async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(
        "You already participate in this webinar",
      );

      expectParticipationNotToBeCreated();
    });
  });
});
