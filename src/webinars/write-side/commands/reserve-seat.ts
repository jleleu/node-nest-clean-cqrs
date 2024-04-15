import { Participation } from '../entities/participation.entity';
import { ParticipationRepository } from '../ports/participation.repository';
import { WebinarRepository } from '../ports/webinar.repository';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { NoMoreSeatsAvailableException } from '../exceptions/no-more-seat-available';
import { SeatAlreadyReservedException } from '../exceptions/seat-already-reserved';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../../users/ports/user-repository.interface';
import { User } from '../../../users/entities/user.entity';
import { Mailer } from '../../../core/ports/mailer.interface';

type Response = void;

export class ReserveSeatCommand implements ICommand {
  constructor(
    public readonly user: User,
    public readonly webinarId: string,
  ) {}
}

@CommandHandler(ReserveSeatCommand)
export class ReserveSeatCommandHandler
  implements ICommandHandler<ReserveSeatCommand, Response>
{
  constructor(
    private readonly participationRepository: ParticipationRepository,
    private readonly webinarRepository: WebinarRepository,
    private readonly userRepository: UserRepository,
    private readonly mailer: Mailer,
  ) {}

  async execute({ user, webinarId }: ReserveSeatCommand): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (!webinar) throw new WebinarNotFoundException();

    await this.assertUSerIsNotAlreadyParticipating(user, webinar);
    await this.assertHasEnoughSeats(webinar);

    const participation = new Participation({
      userId: user.props.id,
      webinarId: webinarId,
    });

    await this.participationRepository.create(participation);

    await this.sendEmailToOrganizer(webinar);
    await this.sendEmailToParticipant(user, webinar);
  }

  private async assertHasEnoughSeats(webinar: Webinar) {
    const participationCount =
      await this.participationRepository.findParticipationCount(
        webinar.props.id,
      );

    if (participationCount >= webinar.props.seats)
      throw new NoMoreSeatsAvailableException();
  }

  private async assertUSerIsNotAlreadyParticipating(
    user: User,
    webinar: Webinar,
  ) {
    const existingParticipation = await this.participationRepository.findOne(
      user.props.id,
      webinar.props.id,
    );

    if (existingParticipation) throw new SeatAlreadyReservedException();
  }

  private async sendEmailToOrganizer(webinar: Webinar) {
    const organizer = await this.userRepository.findById(
      webinar!.props.organizerId,
    );

    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: 'New participation',
      body: `A new user has reserved a seat for your webinar "${
        webinar!.props.title
      }"`,
    });
  }

  private async sendEmailToParticipant(user: User, webinar: Webinar) {
    await this.mailer.send({
      to: user!.props.emailAddress,
      subject: 'Your participation to a webinar',
      body: `You have reserved a seat for the webinar "${
        webinar!.props.title
      }"`,
    });
  }
}
