"use client";

import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useEffect } from "react";
import { useSyncDemo } from "../../../lib/useSyncDemo"
import { defaultShapeUtils } from "@tldraw/tldraw";

declare global {
  interface Window {
    tldraw?: {
      useEditor?: () => any;
    };
  }
}

function ThemeSetter() {
  const editor = window.tldraw?.useEditor?.(); // fallback if useEditor fails
  useEffect(() => {
    editor?.user.updateUserPreferences({
      colorScheme: "dark",
    });
  }, [editor]);
  return null;
}

interface TldrawWrapperProps {
  gigId: string;
  height?: string;
}

export default function TldrawWrapper({ gigId, height = "100%" }: TldrawWrapperProps) {
  const { store } = useSyncDemo({
  roomId: gigId, // ✅ no shapeUtils here!
});

  return (
    <div
      className="bg-forge-bg-raised rounded-sm overflow-hidden shadow-[0_4px_20px_rgba(21,18,13,0.5)] border border-forge-line"
      style={{ height }}
    >
      <Tldraw store={store} autoFocus inferDarkMode>
        <ThemeSetter />
      </Tldraw>
    </div>
  );
}
