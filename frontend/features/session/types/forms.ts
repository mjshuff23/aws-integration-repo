export type AuthMode = "login" | "signup";

export type AuthFormState = {
  email: string;
  password: string;
  name: string;
};

export type ProfileFormState = {
  email: string;
  name: string;
  password: string;
};
