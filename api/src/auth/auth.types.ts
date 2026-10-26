export type StaffResponse = {
  id: string;
  name: string;
  email: string;
};

export type AuthResult = {
  staff: StaffResponse;
  token: string;
};
