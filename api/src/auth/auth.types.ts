export type StaffResponse = {
  id: string;
  name: string;
  email: string;
};

export type JwtPayload = {
  sub: string;
};

export type AuthResult = {
  staff: StaffResponse;
  token: string;
};
