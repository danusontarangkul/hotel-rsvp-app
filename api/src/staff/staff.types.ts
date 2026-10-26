import type { Types } from 'mongoose';
import type { Staff } from './staff.schema';

export type StaffRecord = Staff & { _id: Types.ObjectId };

export type NewStaff = {
  name: string;
  email: string;
  passwordHash: string;
};
