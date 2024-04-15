import { InMemoryWebinarRepository } from '../adapters/in-memory.webinar.repository';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden';
import { InMemoryParticipationRepository } from '../adapters/in-memory.participation.repository';
import { Webinar } from '../entities/webinar.entity';
import { InMemoryUserRepository } from '../../../users/adapters/in-memory.user-repository';
import { User } from '../../../users/entities/user.entity';
import { Executable } from '../../../shared/executable';
import { InMemoryMailer } from '../../../core/adapters/in-memory-mailer';

type Request = {
  user: User;
  webinarId: string;
};

type Response = void;

export class CancelWebinar implements Executable<Request, Response> {
  constructor(
    private readonly webinarRepository: InMemoryWebinarRepository,
    private readonly participationRepository: InMemoryParticipationRepository,
    private readonly userRepository: InMemoryUserRepository,
    private readonly mailer: InMemoryMailer,
  ) {}

  async execute({ user, webinarId }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (!webinar) throw new WebinarNotFoundException();
    if (!webinar.isOrganizer(user)) throw new WebinarUpdateForbiddenException();

    await this.webinarRepository.delete(webinar);
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
          subject: 'Webinar Canceled',
          body: `The webinar "${webinar.props.title}" has been canceled.`,
        }),
      ),
    );
  }
}
