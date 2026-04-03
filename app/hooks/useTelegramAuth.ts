"use client";

import { useEffect, useState } from "react";
import { buildApiUrl } from "@/app/lib/api";
import { getTelegramUser, getTelegramWebApp } from "@/app/lib/telegram";

type AppUser = {
  id: string | null;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
};

function mapTelegramUserToAppUser(user: ReturnType<typeof getTelegramUser>): AppUser | null {
  if (!user) {
    return null;
  }

  return {
    id: null,
    telegramId: String(user.id),
    username: user.username ?? null,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    photoUrl: user.photo_url ?? null,
  };
}

export function useTelegramAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = async () => {
      const webApp = getTelegramWebApp();
      const telegramUser = getTelegramUser();

      if (telegramUser) {
        setUser(mapTelegramUserToAppUser(telegramUser));
      }

      if (!webApp?.initData) {
        setError("Telegram initData is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(buildApiUrl("/auth/telegram"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: webApp.initData,
          }),
        });

        if (!response.ok) {
          let errorMessage = `Auth failed: ${response.status}`;

          try {
            const errorPayload = (await response.json()) as {
              message?: string | string[];
              error?: string;
            };

            const backendMessage = Array.isArray(errorPayload.message)
              ? errorPayload.message.join(", ")
              : errorPayload.message;

            if (backendMessage) {
              errorMessage = `${errorMessage} - ${backendMessage}`;
            } else if (errorPayload.error) {
              errorMessage = `${errorMessage} - ${errorPayload.error}`;
            }
          } catch {
            // Ignore JSON parse errors and keep the HTTP status message.
          }

          throw new Error(errorMessage);
        }

        const data = (await response.json()) as AppUser;
        setUser(data);
        setError(null);
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error ? error.message : "Telegram authorization failed"
        );
      } finally {
        setLoading(false);
      }
    };

    auth();
  }, []);

  return { user, loading, error };
}
