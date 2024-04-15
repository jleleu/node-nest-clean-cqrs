import {
  Prop,
  Schema as MongooseSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export namespace MongoWebinar {
  export const CollectionName = 'webinars';

  @MongooseSchema({ collection: CollectionName })
  export class SchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop({ type: String })
    organizerId: string;

    @Prop({ type: String })
    title: string;

    @Prop({ type: Date })
    startDate: Date;

    @Prop({ type: Date })
    endDate: Date;

    @Prop({ type: Number })
    seats: number;
  }

  export const Schema = SchemaFactory.createForClass(SchemaClass);
  export type Document = HydratedDocument<SchemaClass>;
}
