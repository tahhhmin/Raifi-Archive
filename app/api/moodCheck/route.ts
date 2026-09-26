import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/utils/sendMail"; // adjust path to your sendEmail file
import { getAuthorizedUser } from "@/lib/auth/authorization";

const ALLOWED_EMAILS = [
  process.env.ALLOWED_EMAIL_1,
  process.env.ALLOWED_EMAIL_2,
]
  .filter((email): email is string => Boolean(email))
  .map((email) => email.trim().toLowerCase());

export async function POST(req: NextRequest) {
  try {
    const { mood } = await req.json();

    if (!mood || typeof mood !== "string") {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const user = await getAuthorizedUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentEmail = user.email.trim().toLowerCase();

    // The "other user" is whichever allowed email isn't the current one
    const recipient = ALLOWED_EMAILS.find((email) => email !== currentEmail);

    if (!recipient) {
      return NextResponse.json({ error: "No recipient found" }, { status: 500 });
    }

    await sendEmail("moodCheck", {
      to: recipient,
      mood,
      senderName: currentEmail === process.env.ALLOWED_EMAIL_1?.trim().toLowerCase()
        ? "User 1"
        : "User 2",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mood check email failed:", error);
    return NextResponse.json({ error: "Failed to send mood update" }, { status: 500 });
  }
}