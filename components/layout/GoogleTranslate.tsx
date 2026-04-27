"use client";

import { useEffect } from "react";

import { useUser } from "@/lib/store/user";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (config: object, elementId: string) => void;
      };
    };
  }
}

export function GoogleTranslate() {
  const { language } = useUser();

  useEffect(() => {
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);
    }

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "es,pt,fr,de,ar,nl,ja,ko,zh-CN,pl,hr",
          autoDisplay: false
        },
        "google_translate_element"
      );
    };

    if (!document.getElementById("gt-script")) {
      const script = document.createElement("script");
      script.id = "gt-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    if (language && language !== "en") {
      document.cookie = `googtrans=/en/${language}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=/en/${language}; path=/`;
    }
  }, [language]);

  return null;
}
