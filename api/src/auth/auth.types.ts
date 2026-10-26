import type { Request } from 'express';

export type StaffResponse = {
  id: string;
  name: string;
  email: string;
};

export type AuthenticatedRequest = Request & {
  staffId: string;
};

export type JwtPayload = {
  sub: string;
};

export type AuthResult = {
  staff: StaffResponse;
  token: string;
};
