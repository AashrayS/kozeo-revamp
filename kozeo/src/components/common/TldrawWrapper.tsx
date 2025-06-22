"use client";

import { Tldraw, useEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useEffect } from "react";

function ThemeSetter() {
  const editor = useEditor();

  useEffect(() => {
    editor.user.updateUserPreferences({
      colorScheme: "dark",
    });
  }, [editor]);

  return null;
}

interface TldrawWrapperProps {
  height?: string; // e.g. '600px', '100%', 'calc(100vh - 64px)'
}

export default function TldrawWrapper({ height = "100%" }: TldrawWrapperProps) {
  return (
    <div
      className="bg-neutral-900 rounded-lg overflow-hidden shadow-lg border border-neutral-700"
      style={{ height }}
    >
      <Tldraw>
        <ThemeSetter />
      </Tldraw>
    </div>
  );
}
