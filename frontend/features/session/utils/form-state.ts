import type { User } from "@/types/user";
import type {
  AuthFormState,
  ProfileFormState,
} from "@/features/session/types/forms";

export function createEmptyAuthForm(): AuthFormState {
  return {
    email: "",
    password: "",
    name: "",
  };
}

export function createEmptyProfileForm(): ProfileFormState {
  return {
    email: "",
    name: "",
    password: "",
  };
}

export function toProfileForm(user: User): ProfileFormState {
  return {
    email: user.email,
    name: user.name ?? "",
    password: "",
  };
}
