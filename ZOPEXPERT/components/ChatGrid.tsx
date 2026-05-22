"use client";

import { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import type { Chat } from "@/lib/types";

type Props = { chats: Chat[] };

export function ChatGrid({ chats }: Props) {
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: 12,
        minHeight: 0,
      }}
    >
      {chats.map((chat) => (
        <ChatPanel
          key={chat.id}
          chat={chat}
          isFullscreen={fullscreenId === chat.id}
          onToggleFullscreen={() =>
            setFullscreenId((prev) => (prev === chat.id ? null : chat.id))
          }
        />
      ))}
    </div>
  );
}
