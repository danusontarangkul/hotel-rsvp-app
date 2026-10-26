import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, type Types } from 'mongoose';
import type { BookingStatus } from './bookings.types';

@Schema({
  collection: 'bookings',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Booking {
  @Prop({ required: true, unique: true })
  bookingNumber: string;

  @Prop({ required: true, trim: true })
  guestName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  guestEmail: string;

  @Prop({ required: true, trim: true })
  guestPhone: string;

  @Prop({ required: true })
  checkIn: string;

  @Prop({ required: true })
  checkOut: string;

  @Prop({
    type: String,
    required: true,
    enum: ['active', 'cancelled'],
    default: 'active',
  })
  status: BookingStatus;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  cancelledBy: Types.ObjectId | null;

  createdAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ checkIn: 1, createdAt: 1 });
