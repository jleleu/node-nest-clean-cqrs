import { Model } from 'mongoose';
import { MongoUser } from '../../../users/adapters/mongo/mongo-user';
import { NotFoundException } from '@nestjs/common';
import { WebinarDto } from '../dto/webinar.dto';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MongoParticipation } from '../../write-side/adapters/mongo/mongo-participation';
import { MongoWebinar } from '../../write-side/adapters/mongo/mongo-webinar';

export class GetWebinarByIdQuery implements IQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetWebinarByIdQuery)
export class GetWebinarByIdQueryHandler
  implements IQueryHandler<GetWebinarByIdQuery, WebinarDto>
{
  constructor(
    private readonly webinarModel: Model<MongoWebinar.SchemaClass>,
    private readonly participationModel: Model<MongoParticipation.SchemaClass>,
    private readonly userModel: Model<MongoUser.SchemaClass>,
  ) {}

  async execute({ id }: GetWebinarByIdQuery): Promise<WebinarDto> {
    const webinar = await this.webinarModel.findById(id);
    if (!webinar) throw new NotFoundException();

    const organizer = await this.userModel.findById(webinar.organizerId);
    if (!organizer) throw new NotFoundException();

    const participationsCount = await this.participationModel.countDocuments({
      webinarId: webinar.id,
    });

    return {
      id: webinar.id,
      organizer: {
        id: organizer.id,
        emailAddress: organizer.emailAddress,
      },
      title: webinar.title,
      startDate: webinar.startDate,
      endDate: webinar.endDate,
      seats: {
        reserved: participationsCount,
        available: webinar.seats - participationsCount,
      },
    };
  }
}
