import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, type Types } from 'mongoose';

@Schema({ collection: 'nights', versionKey: false })
export class Night {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  bookingId: Types.ObjectId;
}

export const NightSchema = SchemaFactory.createForClass(Night);
