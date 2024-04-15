import { WebinarRepository } from '../ports/webinar.repository';
import { ParticipationRepository } from '../ports/participation.repository';
import { Webinar } from '../entities/webinar.entity';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden';
import { WebinarTooEarlyException } from '../exceptions/webinar-too-early';
import { UserRepository } from '../../../users/ports/user-repository.interface';
import { User } from '../../../users/entities/user.entity';
import { Executable } from '../../../shared/executable';
import { DateGenerator } from '../../../core/ports/date-generator';
import { Mailer } from '../../../core/ports/mailer.interface';

type Request = {
  user: User;
  webinarId: string;
  startDate: Date;
  endDate: Date;
};

type Response = void;

export class ChangeDates implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: WebinarRepository,
    private readonly participationRepository: ParticipationRepository,
    private readonly userRepository: UserRepository,
    private readonly dateGenerator: DateGenerator,
    private readonly mailer: Mailer,
  ) {}

  async execute({
    user,
    webinarId,
    startDate,
    endDate,
  }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (!webinar) throw new WebinarNotFoundException();

    if (!webinar.isOrganizer(user)) throw new WebinarUpdateForbiddenException();

    webinar!.update({ startDate, endDate });

    if (webinar.isTooClose(this.dateGenerator.now()))
      throw new WebinarTooEarlyException();

    await this.webinarRepository.update(webinar);
    await this.sendEmailToParticipants(webinar);
  }

  private async sendEmailToParticipants(webinar: Webinar) {
    const participations = await this.participationRepository.findByWebinarId(
      webinar!.props.id,
    );

    const users = await Promise.all(
      participations.map((p) => this.userRepository.findById(p.props.userId)),
    );

    await Promise.all(
      users.map((user) =>
        this.mailer.send({
          to: user!.props.emailAddress,
          subject: 'Webinar dates changed',
          body: `The dates of the webinar "${
            webinar!.props.title
          }" have been changed.`,
        }),
      ),
    );
  }
}
