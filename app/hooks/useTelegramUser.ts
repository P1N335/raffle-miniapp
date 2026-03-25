"use client";

import { useEffect, useState } from "react";
import { getTelegramUser, getTelegramWebApp, TelegramMiniAppUser } from "@/app/lib/telegram";

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramMiniAppUser | null>(null);

  useEffect(() => {
    const webApp = getTelegramWebApp();

    if (webApp) {
      webApp.ready();
      webApp.expand();
      setUser(getTelegramUser());
    }
  }, []);

  return user;
}