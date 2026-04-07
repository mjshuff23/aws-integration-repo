"use client";

import {
  useEffect,
  useEffectEvent,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { apiRequest, getErrorMessage } from "@/lib/api/api-request";
import { API_BASE_URL } from "@/lib/env/api-base-url";
import type { User } from "@/types/user";
import type {
  AuthFormState,
  AuthMode,
  ProfileFormState,
} from "@/features/session/types/forms";
import {
  createEmptyAuthForm,
  createEmptyProfileForm,
  toProfileForm,
} from "@/features/session/utils/form-state";

export function useUserSession() {
  const [mode, setModeState] = useState<AuthMode>("signup");
  const [user, setUser] = useState<User | null>(null);
  const [authForm, setAuthForm] = useState<AuthFormState>(createEmptyAuthForm);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(
    createEmptyProfileForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadCurrentUser = useEffectEvent(async () => {
    try {
      const currentUser = await apiRequest<User>("/auth/me", {
        method: "GET",
      });

      startTransition(() => {
        setUser(currentUser);
        setProfileForm(toProfileForm(currentUser));
      });
    } catch (requestError) {
      const requestMessage = getErrorMessage(requestError);

      startTransition(() => {
        setUser(null);
        if (requestMessage !== "Your session is not active.") {
          setError(requestMessage);
        }
      });
    } finally {
      setIsBootstrapping(false);
    }
  });

  useEffect(() => {
    void loadCurrentUser();
  }, []);

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function setMode(mode: AuthMode) {
    setModeState(mode);
    clearFeedback();
  }

  function setAuthName(name: string) {
    setAuthForm((current) => ({
      ...current,
      name,
    }));
  }

  function setAuthEmail(email: string) {
    setAuthForm((current) => ({
      ...current,
      email,
    }));
  }

  function setAuthPassword(password: string) {
    setAuthForm((current) => ({
      ...current,
      password,
    }));
  }

  function setProfileName(name: string) {
    setProfileForm((current) => ({
      ...current,
      name,
    }));
  }

  function setProfileEmail(email: string) {
    setProfileForm((current) => ({
      ...current,
      email,
    }));
  }

  function setProfilePassword(password: string) {
    setProfileForm((current) => ({
      ...current,
      password,
    }));
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    try {
      const payload =
        mode === "signup"
          ? {
              email: authForm.email,
              password: authForm.password,
              name: authForm.name || undefined,
            }
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const nextUser = await apiRequest<User>(
        mode === "signup" ? "/auth/signup" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      startTransition(() => {
        setUser(nextUser);
        setProfileForm(toProfileForm(nextUser));
        setAuthForm((current) => ({
          ...current,
          password: "",
        }));
        setMessage(
          mode === "signup"
            ? "Your account is ready."
            : "You are logged in.",
        );
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    try {
      const nextUser = await apiRequest<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          email: profileForm.email,
          name: profileForm.name || undefined,
          password: profileForm.password || undefined,
        }),
      });

      startTransition(() => {
        setUser(nextUser);
        setProfileForm(toProfileForm(nextUser));
        setMessage("Your profile has been updated.");
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleLogout() {
    clearFeedback();

    try {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
      });

      startTransition(() => {
        setUser(null);
        setProfileForm(createEmptyProfileForm());
        setMessage("You have been logged out.");
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your account? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    clearFeedback();

    try {
      await apiRequest<User>("/users/me", {
        method: "DELETE",
      });

      startTransition(() => {
        setUser(null);
        setProfileForm(createEmptyProfileForm());
        setAuthForm(createEmptyAuthForm());
        setMessage("Your account has been deleted.");
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return {
    apiBaseUrl: API_BASE_URL,
    mode,
    user,
    authForm,
    profileForm,
    error,
    message,
    isBootstrapping,
    isBusy: isPending || isBootstrapping,
    setMode,
    setAuthName,
    setAuthEmail,
    setAuthPassword,
    setProfileName,
    setProfileEmail,
    setProfilePassword,
    handleAuthSubmit,
    handleProfileSubmit,
    handleLogout,
    handleDeleteAccount,
  };
}
