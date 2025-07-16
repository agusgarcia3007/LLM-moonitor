import { siteData } from "./constants";
import { sendEmail } from "./send-email";
import * as fs from "fs";
import * as path from "path";

export class EmailService {
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
  }

  private loadEmailTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, "../emails", templateName);
    return fs.readFileSync(templatePath, "utf-8");
  }

  private replaceTemplatePlaceholders(
    template: string,
    replacements: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, "g"), value);
    }
    return result;
  }

  async sendInvitationEmail(
    to: string,
    organizationName: string,
    inviterName: string,
    role: string,
    invitationId: string
  ): Promise<boolean> {
    try {
      const subject = `You're invited to join ${organizationName} on LLMonitor`;

      const acceptUrl = `${siteData.url}/accept-invitation?token=${invitationId}`;

      const template = this.loadEmailTemplate("invitation-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        organizationName,
        inviterName,
        role,
        acceptUrl,
        timestamp: new Date().toLocaleString(),
        siteUrl: siteData.url,
        settingsUrl: `${siteData.url}/settings/invitations`,
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(`Invitation email sent successfully to ${to}:`, result?.id);
      return true;
    } catch (error) {
      console.error("Error sending invitation email:", error);
      return false;
    }
  }

  async sendResetPasswordEmail(
    to: string,
    userName: string,
    resetUrl: string
  ): Promise<boolean> {
    try {
      const subject = "Reset your password - LLMonitor";

      const template = this.loadEmailTemplate("reset-password-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        userName: userName || "User",
        resetUrl,
        timestamp: new Date().toLocaleString(),
        siteUrl: siteData.url,
        supportEmail: "support@llmonitor.com",
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(
        `Reset password email sent successfully to ${to}:`,
        result?.id
      );
      return true;
    } catch (error) {
      console.error("Error sending reset password email:", error);
      return false;
    }
  }

  async sendDailySummaryEmail(
    to: string,
    organizationName: string,
    stats: {
      totalRequests: number;
      totalErrors: number;
      avgLatency: number;
      totalCost: number;
    }
  ): Promise<boolean> {
    try {
      const subject = `📊 Daily Summary for ${organizationName}`;

      const template = this.loadEmailTemplate("daily-summary-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        organizationName,
        date: new Date().toLocaleDateString(),
        totalRequests: stats.totalRequests.toLocaleString(),
        totalErrors: stats.totalErrors.toLocaleString(),
        avgLatency: `${Math.round(stats.avgLatency)}ms`,
        totalCost: `$${stats.totalCost.toFixed(4)}`,
        dashboardUrl: `${siteData.url}/dashboard`,
        settingsUrl: `${siteData.url}/dashboard`,
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(
        `Daily summary email sent successfully to ${to}:`,
        result?.id
      );
      return true;
    } catch (error) {
      console.error("Error sending daily summary email:", error);
      return false;
    }
  }
}
