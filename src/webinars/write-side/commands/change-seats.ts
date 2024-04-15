import { WebinarRepository } from '../ports/webinar.repository';
import { WebinarNotFoundException } from '../exceptions/webinar-not-found';
import { WebinarUpdateForbiddenException } from '../exceptions/webinar-update-forbidden';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats';
import { Executable } from '../../../shared/executable';
import { DomainException } from '../../../shared/exception';
import { User } from '../../../users/entities/user.entity';

type Request = {
  user: User;
  webinarId: string;
  seats: number;
};

type Response = void;

export class ChangeSeats implements Executable<Request, Response> {
  constructor(private readonly webinarRepository: WebinarRepository) {}

  async execute({ user, webinarId, seats }: Request): Promise<Response> {
    const webinar = await this.webinarRepository.findById(webinarId);

    if (!webinar) throw new WebinarNotFoundException();
    if (!webinar.isOrganizer(user)) throw new WebinarUpdateForbiddenException();
    if (seats < webinar.props.seats)
      throw new DomainException('You cannot reduce the number of seats');

    webinar!.update({ seats });

    if (webinar.hasTooManySeats()) throw new WebinarTooManySeatsException();

    await this.webinarRepository.update(webinar);
  }
}
