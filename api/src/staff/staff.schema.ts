import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'staff',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Staff {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  createdAt: Date;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
