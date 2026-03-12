import { NextResponse } from "next/server";

type ContactPayload = {
  senderName?: string;
  senderEmail?: string;
  subject?: string;
  message?: string;
};

function badRequest(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const recipientEmail = process.env.CONTACT_EMAIL?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!resendApiKey || !recipientEmail || !fromEmail) {
    return badRequest(
      "Set RESEND_API_KEY, CONTACT_EMAIL, and CONTACT_FROM_EMAIL to enable direct sending.",
      503,
    );
  }

  const payload = (await request.json()) as ContactPayload;
  const senderName = payload.senderName?.trim() || "Anonymous";
  const senderEmail = payload.senderEmail?.trim();
  const subject = payload.subject?.trim();
  const message = payload.message?.trim();

  if (!subject || !message) {
    return badRequest("Subject and message are required.");
  }

  const textLines = [`From: ${senderName}`];

  if (senderEmail) {
    textLines.push(`Reply-To: ${senderEmail}`);
  }

  textLines.push("", message);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [recipientEmail],
      ...(senderEmail ? { reply_to: senderEmail } : {}),
      subject,
      text: textLines.join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    return NextResponse.json(
      {
        ok: false,
        error: errorText || "Email provider rejected the request.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
