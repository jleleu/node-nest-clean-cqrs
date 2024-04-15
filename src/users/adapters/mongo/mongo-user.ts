import {
  Prop,
  Schema as MongooseSchema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export namespace MongoUser {
  export const CollectionName = 'users';

  @MongooseSchema({ collection: CollectionName })
  export class SchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop({ type: String })
    emailAddress: string;

    @Prop({ type: String })
    password: string;
  }

  export const Schema = SchemaFactory.createForClass(SchemaClass);
  export type Document = HydratedDocument<SchemaClass>;
}
