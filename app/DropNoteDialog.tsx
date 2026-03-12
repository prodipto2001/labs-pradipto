"use client";

import { useEffect, useMemo, useState } from "react";

type DropNoteDialogProps = {
  recipientEmail?: string;
};

export default function DropNoteDialog({
  recipientEmail,
}: DropNoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("A note from Labs");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const canSend = useMemo(() => {
    return Boolean(subject.trim() && message.trim() && status !== "sending");
  }, [message, status, subject]);

  async function handleSend() {
    if (!recipientEmail) {
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderName,
        senderEmail,
        subject,
        message,
      }),
    });

    const payload = (await response.json()) as { ok: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      setStatus("error");
      setErrorMessage(payload.error ?? "Unable to send the note.");
      return;
    }

    setStatus("sent");
    setSenderName("");
    setSenderEmail("");
    setSubject("A note from Labs");
    setMessage("");
  }

  return (
    <>
      <button
        className="rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-bold text-white shadow-md hover:opacity-90"
        type="button"
        onClick={() => {
          setIsOpen(true);
          setStatus("idle");
          setErrorMessage("");
        }}
      >
        Drop a Note
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(35_24_15_/_0.45)] p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[#fffdfa] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Compose
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Write a note
                </h2>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-900"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            {status === "sent" ? (
              <div className="flex min-h-[28rem] flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(240,108,0,0.16),transparent_40%)] px-6 py-10 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[color:rgb(240_108_0_/_0.18)]" />
                  <div className="relative flex size-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 6h16v12H4z" />
                      <path d="m5 7 7 6 7-6" />
                    </svg>
                  </div>
                </div>
                <div className="mb-5 text-6xl leading-none animate-bounce">^_^</div>
                <h3 className="text-3xl font-bold text-slate-900">
                  Note sent to the admin
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                  The message is on its way and the admin is clearly happy about it.
                </p>
                <button
                  className="mt-8 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Your Name (Optional)
                      </span>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[var(--color-primary)]"
                        placeholder="Your name"
                        value={senderName}
                        onChange={(event) => setSenderName(event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                        Your Email (Optional)
                      </span>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[var(--color-primary)]"
                        placeholder="you@example.com"
                        type="email"
                        value={senderEmail}
                        onChange={(event) => setSenderEmail(event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Message
                    </span>
                    <textarea
                      className="min-h-72 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--color-primary)]"
                      placeholder="Write your note here..."
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                  <p className="text-sm text-slate-500">
                    {recipientEmail
                      ? "Send delivers this note directly to the admin inbox."
                      : "Set CONTACT_EMAIL in your env file to enable sending."}
                  </p>
                  <div className="flex items-center gap-3">
                    {status === "error" ? (
                      <p className="max-w-xs text-sm text-red-500">{errorMessage}</p>
                    ) : null}
                    <button
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                      type="button"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      type="button"
                      onClick={handleSend}
                      disabled={!canSend}
                    >
                      {status === "sending" ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
