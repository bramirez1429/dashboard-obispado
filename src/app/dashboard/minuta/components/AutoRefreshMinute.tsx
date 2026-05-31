"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const TWO_MINUTES = 120000;
const RECENT_EDIT_WINDOW = 30000;

function isFormFieldFocused() {
  const activeElement = document.activeElement;

  if (!activeElement) {
    return false;
  }

  return (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.getAttribute("contenteditable") === "true" ||
    activeElement.getAttribute("role") === "combobox"
  );
}

export default function AutoRefreshMinute() {
  const router = useRouter();
  const lastEditAtRef = useRef(0);

  useEffect(() => {
    const markEditing = () => {
      lastEditAtRef.current = Date.now();
    };

    window.addEventListener("minute-form-editing", markEditing);

    const intervalId = window.setInterval(() => {
      const recentlyEdited =
        Date.now() - lastEditAtRef.current < RECENT_EDIT_WINDOW;

      if (isFormFieldFocused() || recentlyEdited) {
        return;
      }

      router.refresh();
    }, TWO_MINUTES);

    return () => {
      window.removeEventListener("minute-form-editing", markEditing);
      window.clearInterval(intervalId);
    };
  }, [router]);

  return null;
}
