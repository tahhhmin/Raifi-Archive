import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Use project root path to access /public/mails/
const ROOT_DIR = process.cwd();

interface EmailData {
  to: string;
  [key: string]: string;
}

/**
 * Send an email using a specified template and data replacements
 * @param type - Template name (e.g., 'userSignupCode')
 * @param data - Object with 'to' and placeholders like { code, name, etc. }
 */
export async function sendEmail(type: string, data: EmailData): Promise<void> {
  try {
    const templatePath = path.join(ROOT_DIR, "public", "mailTemplate", `${type}.html`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Email template "${type}" not found at ${templatePath}`);
    }

    let html = fs.readFileSync(templatePath, "utf8");

    // Extract subject from <title>
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const subject = titleMatch ? titleMatch[1].trim() : "No Subject";

    // Replace all {{placeholder}} with corresponding data
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      html = html.replace(regex, String(value));
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Raifi.archive" <${process.env.SMTP_USER}>`,
      to: data.to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email "${type}" sent to ${data.to}: ${info.messageId}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Failed to send email (${type}) to ${data.to}:`, error.message);
      throw new Error("Failed to send email");
    } else {
      console.error(`Failed to send email (${type}) to ${data.to}:`, error);
      throw new Error("Failed to send email");
    }
  }
}