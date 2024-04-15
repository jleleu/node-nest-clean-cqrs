import { WebinarRepository } from '../ports/webinar.repository';
import { Webinar } from '../entities/webinar.entity';
import { WebinarTooEarlyException } from '../exceptions/webinar-too-early';
import { WebinarTooManySeatsException } from '../exceptions/webinar-too-many-seats';
import { WebinarNotEnoughSeatsException } from '../exceptions/webinar-not-enough-seats';
import { Executable } from '../../../shared/executable';
import { User } from '../../../users/entities/user.entity';
import { IdGenerator } from '../../../core/ports/id-generator';
import { DateGenerator } from '../../../core/ports/date-generator';

type Request = {
  user: User;
  title: string;
  startDate: Date;
  endDate: Date;
  seats: number;
};

type Response = { id: string };

export class OrganizeWebinar implements Executable<Request, Response> {
  constructor(
    private readonly repository: WebinarRepository,
    private readonly idGenerator: IdGenerator,
    private readonly dateGenerator: DateGenerator,
  ) {}

  async execute(data: Request): Promise<Response> {
    const id = this.idGenerator.generate();
    const webinar = new Webinar({
      id,
      organizerId: data.user.props.id,
      title: data.title,
      startDate: data.startDate,
      endDate: data.endDate,
      seats: data.seats,
    });

    if (webinar.isTooClose(this.dateGenerator.now()))
      throw new WebinarTooEarlyException();
    if (webinar.hasTooManySeats()) throw new WebinarTooManySeatsException();
    if (webinar.hasNoSeat()) throw new WebinarNotEnoughSeatsException();

    await this.repository.create(webinar);

    return { id };
  }
}
