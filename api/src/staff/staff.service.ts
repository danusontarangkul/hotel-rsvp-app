import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { normalizeEmail } from '../common/email';
import { Staff } from './staff.schema';
import type { NewStaff, StaffRecord } from './staff.types';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private readonly staffModel: Model<Staff>,
  ) {}

  findByEmail(email: string): Promise<StaffRecord | null> {
    return this.staffModel
      .findOne({ email: normalizeEmail(email) })
      .lean<StaffRecord>()
      .exec();
  }

  findById(id: string): Promise<StaffRecord | null> {
    return this.staffModel.findById(id).lean<StaffRecord>().exec();
  }

  async create(staff: NewStaff): Promise<StaffRecord> {
    const created = await this.staffModel.create({
      ...staff,
      email: normalizeEmail(staff.email),
    });
    return created.toObject<StaffRecord>();
  }
}
