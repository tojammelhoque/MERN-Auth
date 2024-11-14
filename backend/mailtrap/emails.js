import { mailtrapClient, sender } from "./mailtrap.config.js";

import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipients = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Verify your email",
      text: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
  } catch (error) {
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipients = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Welcome Email",
      text: "Welcome To MERN AUTH",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name),
      category: "Welcome Message",
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error("Email sending failed");
  }
};

export const sendResetPasswordEmail = async (email, name, resetURL) => {
  const recipients = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Reset Password",
      text: "Reset Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{name}", name).replace(
        "{resetURL}",
        resetURL
      ),
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    throw new Error("Email sending failed");
  }
};

export const sendPasswordResetSuccessfulEmail = async (email) => {
  const recipients = [{ email }];
  try {
    await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: "Password Reset Successful",
      text: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Failed to send password reset successful email:", error);
    throw new Error("Email sending failed");
  }
};
