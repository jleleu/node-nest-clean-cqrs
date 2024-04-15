import { WebinarRepository } from '../ports/webinar.repository';
import { ParticipationRepository } from '../ports/participation.repository';
import { Webinar } from '../entities/webinar.entity';
import { ParticipationNotFoundException } from '../exceptions/participation-not-found';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { UserRepository } from '../../../users/ports/user-repository.interface';
import { User } from '../../../users/entities/user.entity';
import { Executable } from '../../../shared/executable';
import { Mailer } from '../../../core/ports/mailer.interface';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;

export class CancelSeat implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: WebinarRepository,
    private readonly participationRepository: ParticipationRepository,
    private readonly userRepository: UserRepository,
    private readonly mailer: Mailer,
  ) {}

  async execute({ user, webinarId }: Request): Promise<void> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (!webinar) throw new WebinarNotFoundException();

    const participation = await this.participationRepository.findOne(
      user.props.id,
      webinarId,
    );

    if (!participation) throw new ParticipationNotFoundException();

    await this.participationRepository.delete(participation);

    await this.sendEmailToOrganizer(webinar);
    await this.sendEmailToParticipant(user, webinar);
  }

  private async sendEmailToOrganizer(webinar: Webinar) {
    const organizer = await this.userRepository.findById(
      webinar!.props.organizerId,
    );

    await this.mailer.send({
      to: organizer!.props.emailAddress,
      subject: 'A participant has canceled their seat',
      body: `A participant has canceled their seat to the webinar "${
        webinar!.props.title
      }"`,
    });
  }

  private async sendEmailToParticipant(user: User, webinar: Webinar) {
    await this.mailer.send({
      to: user!.props.emailAddress,
      subject: 'Your participation cancellation',
      body: `You have canceled your participation to the webinar`,
    });
  }
}
