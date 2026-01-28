import path from "path";
import { createTransport, SendMailOptions, Transporter } from "nodemailer";

import { logger } from "./logger";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const LOGGER = logger.get({
  source: "utils",
  module: path.basename(__filename)
});

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

export class EmailTranporter {

    private transporter: Transporter;

    constructor(config?: SMTPTransport.Options) {
        
        if (!config) {
            const zohoHost = process.env.ZOHO_HOST;
            const zohoPort = Number(process.env.ZOHO_PORT);
            const zohoUser = process.env.ZOHO_USER;
            const zohoPassword = process.env.ZOHO_PASSWORD;

            if (!zohoHost || !zohoPort || !zohoUser || !zohoPassword) {
                throw new Error("Missing required environment variables: ZOHO_HOST, ZOHO_HOST, ZOHO_USER, or ZOHO_PASSWORD.");
            }

            config = {
                host: zohoHost,
                port: zohoPort,
                secure: zohoPort === 465 ? true : false,
                auth: {
                    user: zohoUser,
                    pass: zohoPassword,
                }
            }
        }

        try {
            this.transporter = createTransport(config);
            LOGGER.info("SMTP Transporter was successfully created.");
        } catch (error) {
            LOGGER.error("Failed to create SMTP Transporter.");
            throw error;
        }
    }

    async send(email: Email) {
        const mailOptions: SendMailOptions = {
            ...email,
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            LOGGER.info(`Email was correctly received by SMTP transporter with identfier: ${result.messageId}.`);
            return;

        } catch (error) {
            LOGGER.error("Email could not be received by SMTP transporter.", `from - ${mailOptions.from}`, `to - ${mailOptions.to}`, `subject - ${mailOptions.subject}`);
            return;
        }
    }
}

export const email = new EmailTranporter();
