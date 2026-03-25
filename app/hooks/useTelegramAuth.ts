"use client";

import { useEffect, useState } from "react";
import { getTelegramWebApp } from "@/app/lib/telegram";
import { API_BASE_URL } from "@/app/lib/api";

export function useTelegramAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = async () => {
      const webApp = getTelegramWebApp();

      if (!webApp?.initData) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: webApp.initData,
          }),
        });

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Telegram auth failed", error);
      } finally {
        setLoading(false);
      }
    };

    auth();
  }, []);

  return { user, loading };
}