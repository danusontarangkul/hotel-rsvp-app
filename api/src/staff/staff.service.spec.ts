import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Types, type Model } from 'mongoose';
import { Staff, StaffSchema } from './staff.schema';
import { StaffService } from './staff.service';

const DATABASE_TIMEOUT_MS = 60_000;

describe('StaffService', () => {
  let mongo: MongoMemoryServer;
  let moduleRef: TestingModule;
  let service: StaffService;
  let staffModel: Model<Staff>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongo.getUri()),
        MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
      ],
      providers: [StaffService],
    }).compile();
    service = moduleRef.get(StaffService);
    staffModel = moduleRef.get(getModelToken(Staff.name));
    await staffModel.syncIndexes();
  }, DATABASE_TIMEOUT_MS);

  afterEach(async () => {
    await staffModel.deleteMany({});
  });

  afterAll(async () => {
    await moduleRef.close();
    await mongo.stop();
  });

  describe('create', () => {
    it('saves the staff member with a lowercase email and a created date', async () => {
      const staff = await service.create({
        name: 'Sam Lee',
        email: 'Sam@Hotel.com',
        passwordHash: 'hash',
      });

      expect(staff).toMatchObject({
        name: 'Sam Lee',
        email: 'sam@hotel.com',
        passwordHash: 'hash',
      });
      expect(staff._id).toBeDefined();
      expect(staff.createdAt).toBeInstanceOf(Date);
    });

    it('fails with a duplicate key error for an email that is taken', async () => {
      await service.create({
        name: 'Sam Lee',
        email: 'sam@hotel.com',
        passwordHash: 'hash',
      });

      await expect(
        service.create({
          name: 'Sam Two',
          email: 'SAM@hotel.com',
          passwordHash: 'hash',
        }),
      ).rejects.toMatchObject({ code: 11000 });
    });
  });

  describe('findByEmail', () => {
    it('finds a staff member whatever the email case', async () => {
      await service.create({
        name: 'Sam Lee',
        email: 'sam@hotel.com',
        passwordHash: 'hash',
      });

      await expect(service.findByEmail('SAM@Hotel.com')).resolves.toMatchObject(
        { name: 'Sam Lee', email: 'sam@hotel.com' },
      );
    });

    it('returns null for an unknown email', async () => {
      await expect(service.findByEmail('nobody@hotel.com')).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('finds a staff member by their id', async () => {
      const created = await service.create({
        name: 'Sam Lee',
        email: 'sam@hotel.com',
        passwordHash: 'hash',
      });

      await expect(
        service.findById(created._id.toString()),
      ).resolves.toMatchObject({ name: 'Sam Lee', email: 'sam@hotel.com' });
    });

    it('returns null for an unknown id', async () => {
      await expect(
        service.findById(new Types.ObjectId().toString()),
      ).resolves.toBeNull();
    });
  });
});
