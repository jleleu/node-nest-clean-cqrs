import { Model } from 'mongoose';
import { MongoWebinar } from './mongo-webinar';
import { WebinarRepository } from '../../ports/webinar.repository';
import { Webinar } from '../../entities/webinar.entity';
import * as deepObjectDiff from 'deep-object-diff';

export class MongoWebinarRepository implements WebinarRepository {
  private mapper = new WebinarMapper();

  constructor(private readonly model: Model<MongoWebinar.SchemaClass>) {}

  async findById(id: string): Promise<Webinar | null> {
    const webinar = await this.model.findById(id);
    if (!webinar) return null;
    return this.mapper.toDomain(webinar);
  }

  async create(webinar: Webinar): Promise<void> {
    const record = new this.model(this.mapper.toPersistence(webinar));
    await record.save();
  }

  async update(webinar: Webinar): Promise<void> {
    const record = await this.model.findById(webinar.props.id);
    if (!record) return;

    const diff = deepObjectDiff.diff(webinar.initialState, webinar.props);

    await record.updateOne(diff);
    webinar.commit();
  }

  async delete(webinar: Webinar): Promise<void> {
    await this.model.findByIdAndDelete(webinar.props.id);
  }
}

class WebinarMapper {
  toDomain(webinar: MongoWebinar.Document): Webinar {
    return new Webinar({
      id: webinar._id,
      organizerId: webinar.organizerId,
      title: webinar.title,
      seats: webinar.seats,
      startDate: webinar.startDate,
      endDate: webinar.endDate,
    });
  }

  toPersistence(webinar: Webinar): MongoWebinar.SchemaClass {
    return {
      _id: webinar.props.id,
      organizerId: webinar.props.organizerId,
      title: webinar.props.title,
      seats: webinar.props.seats,
      startDate: webinar.props.startDate,
      endDate: webinar.props.endDate,
    };
  }
}
