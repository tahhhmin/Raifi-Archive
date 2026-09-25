"use client";

import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CornerDownLeft } from "lucide-react";

type Message = {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
};

type Profile = {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [currentUserId, setCurrentUserId] = useState<string | null>(
        null
    );

    const [profiles, setProfiles] = useState<Profile[]>([]);

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

        async function loadProfiles() {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
            console.error(
            "Failed to get current user:",
            userError
            );

            return;
        }

        if (!user) {
            return;
        }

        setCurrentUserId(user.id);

        const { data, error } = await supabase
            .from("profiles")
            .select(
            "id, email, display_name, avatar_url"
            );

        if (error) {
            console.error(
            "Failed to load profiles:",
            error
            );

            return;
        }

        setProfiles(data ?? []);
        }

        loadProfiles();
    }, []);

    useEffect(() => {
        const supabase = createClient();

        let channel: ReturnType<
        typeof supabase.channel
        > | null = null;

        let cancelled = false;

        async function setupRealtime() {
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
            setCurrentUserId(session.user.id);
        }

        console.log("Realtime auth session:", {
            hasSession: !!session,
            userId: session?.user?.id,
        });

        if (sessionError) {
            console.error(
            "Realtime session error:",
            sessionError
            );
        }

        if (session?.access_token) {
            await supabase.realtime.setAuth(
            session.access_token
            );

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
                console.log(
                "REALTIME INSERT RECEIVED:",
                payload
                );

                const newMessage =
                payload.new as Message;

                setMessages((current) => {
                /*
                * Prevent duplicates.
                */

                if (
                    current.some(
                    (message) =>
                        message.id === newMessage.id
                    )
                ) {
                    return current;
                }

                return [
                    ...current,
                    newMessage,
                ];
                });
            }
            )
            .subscribe((status, error) => {
            console.log(
                "Realtime status:",
                status
            );

            if (error) {
                console.error(
                "Realtime subscription error:",
                error
                );
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
        const trimmedContent =
        content.trim();

        if (!trimmedContent || sending) {
        return;
        }

        setSending(true);

        try {
        const response = await fetch(
            "/api/messages",
            {
            method: "POST",
            headers: {
                "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
                content: trimmedContent,
            }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
            data.error ||
                "Failed to send message"
            );
        }

        setContent("");
        } catch (error) {
        console.error(
            "Failed to send message:",
            error
        );
        } finally {
        setSending(false);
        }
    }

  /*
   * ---------------------------------------------------------
   * ENTER KEY
   * ---------------------------------------------------------
   */

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  /*
   * ---------------------------------------------------------
   * TIME FORMAT
   * ---------------------------------------------------------
   */

  function formatTime(date: string) {
    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  /*
   * ---------------------------------------------------------
   * DATE HELPERS
   * ---------------------------------------------------------
   */

  function isSameDay(
    date1: string,
    date2: string
  ) {
    const first = new Date(date1);
    const second = new Date(date2);

    return (
      first.getFullYear() ===
        second.getFullYear() &&
      first.getMonth() ===
        second.getMonth() &&
      first.getDate() ===
        second.getDate()
    );
  }

  function isToday(date: string) {
    const messageDate =
      new Date(date);

    const today = new Date();

    return (
      messageDate.getFullYear() ===
        today.getFullYear() &&
      messageDate.getMonth() ===
        today.getMonth() &&
      messageDate.getDate() ===
        today.getDate()
    );
  }

  function isYesterday(date: string) {
    const messageDate =
      new Date(date);

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    return (
      messageDate.getFullYear() ===
        yesterday.getFullYear() &&
      messageDate.getMonth() ===
        yesterday.getMonth() &&
      messageDate.getDate() ===
        yesterday.getDate()
    );
  }

  function formatDateSeparator(
    date: string
  ) {
    const messageDate =
      new Date(date);

    if (isToday(date)) {
      return "Today";
    }

    if (isYesterday(date)) {
      return "Yesterday";
    }

    return messageDate.toLocaleDateString(
      [],
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  /*
   * ---------------------------------------------------------
   * PROFILE HELPERS
   * ---------------------------------------------------------
   */

  function getProfile(
    userId: string
  ) {
    return profiles.find(
      (profile) =>
        profile.id === userId
    );
  }

  const currentUser =
    currentUserId
      ? getProfile(
          currentUserId
        )
      : null;

  const otherUser =
    profiles.find(
      (profile) =>
        profile.id !==
        currentUserId
    );

    return (
        <main className={styles.main}>
            <div className={styles.chatContainer}>
                <section className={styles.messages}>
                    {loading ? (
                        <div className={styles.emptyState}></div>
                    ) : messages.length ===0 ? (
                        <div className={styles.emptyState}></div>
                    ) : (
                        <>
                        {messages.map((message, index) => {
                            const isMine = message.sender_id === currentUserId;
                            const previousMessage = messages[index - 1];
                            const nextMessage = messages[index + 1];
                            const isFirstInGroup = !previousMessage || previousMessage.sender_id !== message.sender_id;
                            const isLastInGroup = !nextMessage || nextMessage.sender_id !== message.sender_id;
                            const isFirstMessageOfDay = !previousMessage || !isSameDay(previousMessage.created_at, message.created_at);
                            const sender = getProfile(message.sender_id);

                        return (
                            <div key={message.id}>
                                {isFirstMessageOfDay && (
                                    <div className={styles.dateSeparator}>
                                        <span>{formatDateSeparator(message.created_at)}</span>
                                    </div>
                                )}
                                <div className={`${styles.messageRow}
                                ${isMine ? styles.mine : styles.theirs}
                                ${isFirstInGroup ? styles.firstInGroup : ""}
                                ${!isFirstInGroup ? styles.middleInGroup : ""}
                                ${isLastInGroup ? styles.lastInGroup: ""}`}>

                                {!isMine &&
                                isFirstInGroup && (
                                <div
                                className={
                                    styles.messageAvatar
                                }
                                >
                                {sender?.avatar_url ? (
                                    <img
                                    src={
                                        sender.avatar_url
                                    }
                                    alt={
                                        sender.display_name
                                    }
                                    />
                                ) : (
                                    "♥"
                                )}
                                </div>
                            )}

                            {/* AVATAR PLACEHOLDER */}

                            {!isMine &&
                            !isFirstInGroup && (
                                <div
                                className={
                                    styles.messageAvatarPlaceholder
                                }
                                />
                            )}

                            {/* MESSAGE CONTENT */}

                            <div
                            className={
                                styles.messageContent
                            }
                            >
                            <div
                                className={
                                styles.messageBubble
                                }
                            >
                                {
                                message.content
                                }
                            </div>

                            {/* TIME ONLY ON LAST MESSAGE */}

                            {isLastInGroup && (
                                <span
                                className={
                                    styles.messageTime
                                }
                                >
                                {formatTime(
                                    message.created_at
                                )}
                                </span>
                            )}
                            </div>
                        </div>
                        </div>
                    );
                    }
                )}

                <div
                    ref={
                    messagesEndRef
                    }
                />
                </>
            )}
            </section>

            {/* -------------------------------------------------
                COMPOSER
            ------------------------------------------------- */}

                        <div className={styles.composer}>
                            <div className={styles.inputWrapper}>
                                <input 
                                    type="text" 
                                    value={content} 
                                    onChange={(event) => setContent(event.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Message..."
                                    disabled={sending}
                                />

                                <button 
                                    onClick={sendMessage}
                                    disabled={sending || !content.trim()}
                                    aria-label="Send message"
                                >
                                    <CornerDownLeft className={styles.buttonIcon} size={22} strokeWidth={1.8} />
                                </button>
                            </div>
                        </div>
        </div>
        </main>
    );
}