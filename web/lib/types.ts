export type Staff = {
  id: string;
  name: string;
  email: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
};
