import { createTransport, SendMailOptions, Transporter } from "nodemailer";

import Logger from "./logger";

// Define global variables
let globalTransporter: Transporter | null = null;

const getEmailTransporter = function (): Transporter | null | undefined {
  // Check to see if an transporter is already defined
  if (globalTransporter) {
    return globalTransporter;
  }

  // Import the environment variables
  const zohoHost: string = process.env.ZOHO_HOST || "";
  const zohoPort: number = !isNaN(Number(process.env.ZOHO_PORT))
    ? Number(process.env.ZOHO_PORT)
    : 0;
  const zohoUser: string = process.env.ZOHO_USER || "";
  const zohoPassword: string = process.env.ZOHO_PASSWORD || "";
  if (!zohoHost || !zohoPort || !zohoUser || !zohoPassword) {
    Logger.error(
      "Missing required environment variables: ZOHO_HOST, ZOHO_HOST, ZOHO_USER, or ZOHO_PASSWORD."
    );
    return;
  }

  try {
    // Define the transporter configuration
    const transporterConfiguration = {
      host: zohoHost,
      port: zohoPort,
      secure: zohoPort === 465 ? true : false,
      auth: {
        user: zohoUser,
        pass: zohoPassword,
      },
    };

    // Create an SMTP transporter
    globalTransporter = createTransport(transporterConfiguration) || null;
    Logger.info("SMTP Transporter was successfully created.");

    return globalTransporter;
  } catch (error) {
    Logger.error(`Failed to create SMTP Transporter: ${error}.`);
    return;
  }
};

export type Email = {
  from: string;
  to: string | string[];
  subject: string;
  html: string; // e.g. "<h1>Hello Eli</h1>
  text?: string; // Plain-text fallback
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
};

export async function sendEmail(email: Email): Promise<void> {
  // Retrieve the SMTP transporter
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("Unable to retrieve the SMTP EMAIL transporter.");
  }

  const mailOptions: SendMailOptions = {
    ...email,
  };

  try {
    // Send the email object
    const result = await transporter.sendMail(mailOptions);
    Logger.info(
      `Email was correctly received by SMTP transporter with identfier: ${result.messageId}.`
    );
    return;
  } catch (error) {
    Logger.error(`Email could not be received by SMTP transporter: ${error}.`);
    return;
  }
}
