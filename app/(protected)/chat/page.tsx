"use client";
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const MY_USER_ID = "3cc62825-4611-45ea-a4c5-8a74a47bbb97";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch("/api/messages");

        if (!response.ok) {
          throw new Error("Failed to load messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function setupRealtime() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Realtime auth session:", {
        hasSession: !!session,
        userId: session?.user?.id,
      });

      if (sessionError) {
        console.error("Realtime session error:", sessionError);
      }

      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);

        console.log("Realtime JWT configured");
      }

      if (cancelled) {
        return;
      }

      channel = supabase.channel(
        `messages-realtime-${Date.now()}`
      );

      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          (payload) => {
            console.log("🔥 REALTIME INSERT RECEIVED:", payload);

            const newMessage = payload.new as Message;

            setMessages((current) => {
              if (
                current.some(
                  (message) => message.id === newMessage.id
                )
              ) {
                return current;
              }

              return [...current, newMessage];
            });
          }
        )
        .subscribe((status, error) => {
          console.log("Realtime status:", status);

          if (error) {
            console.error("Realtime subscription error:", error);
          }
        });
    }

    setupRealtime();

    return () => {
      cancelled = true;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    const trimmedContent = content.trim();

    if (!trimmedContent || sending) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to send message"
        );
      }

      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

return (
  <main className={styles.page}>
    <div className={styles.chatContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.avatar}>♥</div>

        <div className={styles.headerInfo}>
          <h1>Us</h1>
          <p>Just you & me</p>
        </div>

        <div className={styles.onlineIndicator} />
      </header>

      {/* Messages */}
      <section className={styles.messages}>
        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.loadingHeart}>♥</div>
            <p>Loading our conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyHeart}>♡</div>
            <h2>Nothing here yet</h2>
            <p>Send the first message.</p>
          </div>
        ) : (
          <>
            <div className={styles.conversationStart}>
              <span>Our little corner of the internet</span>
            </div>

            {messages.map((message) => {
              const isMine =
                message.sender_id === MY_USER_ID;

              return (
                <div
                  key={message.id}
                  className={`${styles.messageRow} ${
                    isMine
                      ? styles.mine
                      : styles.theirs
                  }`}
                >
                  <div className={styles.messageContent}>
                    <div className={styles.messageBubble}>
                      {message.content}
                    </div>

                    <span className={styles.messageTime}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </>
        )}
      </section>

      {/* Composer */}
      <div className={styles.composer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Write something..."
            disabled={sending}
          />

          <button
            onClick={sendMessage}
            disabled={sending || !content.trim()}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </main>
);
}