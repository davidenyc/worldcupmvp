"use client";

import { useEffect } from "react";

import { useUpdateUser, useUser } from "@/lib/store/user";

export function GoogleTranslate() {
  const { language } = useUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    const host = window.location.hostname;

    document.cookie = `googtrans=; ${expires}; path=/`;
    document.cookie = `googtrans=; ${expires}; path=/; domain=${host}`;
    document.cookie = `googtrans=; ${expires}; path=/; domain=.${host}`;

    document.documentElement.classList.remove("translated-ltr", "translated-rtl");
    document.body.classList.remove("translated-ltr", "translated-rtl");

    document.querySelectorAll("#google_translate_element, #gt-script, .goog-te-banner-frame, .goog-te-balloon-frame, .skiptranslate").forEach((node) => {
      node.remove();
    });

    if (language !== "en") {
      updateUser({ language: "en" });
    }
  }, [language, updateUser]);

  return null;
}
