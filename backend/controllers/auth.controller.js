import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import crypto from "crypto";
import { generateTokenAndSendCookie } from "../utils/generateTokenAndSendCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPasswordResetSuccessfulEmail,
} from "../mailtrap/emails.js";

// Signup
export const signup = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;
  try {
    // check if all fields are filled
    if (!email || !password || !name || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // generate verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpire: Date.now() + 86400 * 1000,
    });

    // generate token and send cookie before sending response
    generateTokenAndSendCookie(res, user._id);

    // send verification email
    await sendVerificationEmail(email, verificationToken);

    // send success response
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    // Find the user with the matching verification code and a valid expiry time
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpire: { $gt: Date.now() },
    });

    // Check if user exists and the code is valid
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    // Update user's verification status
    user.isUserVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Respond with success
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error during email verification:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Login
// export const login = (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     if (!user.isUserVerified) {
//       return res
//         .status(400)
//         .json({ message: "User is not verified . Please verify your email" });
//     }

//     const isPasswordMatch = bcryptjs.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     generateTokenAndSendCookie(res, user._id);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isUserVerified) {
      return res
        .status(400)
        .json({ message: "User is not verified. Please verify your email" });
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    generateTokenAndSendCookie(res, user._id);
    await user.save();

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "logout successfully" });
};

// Forget Password

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Await the result of findOne to ensure `user` is the document, not a Promise
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate reset password token
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire = Date.now() + 86400 * 1000; // 1 day

    // Update user's reset password token and expire time
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;

    // Save the updated user
    await user.save();

    // Send reset password email
    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetPasswordToken}`;
    await sendResetPasswordEmail(user.email, user.name, resetURL);

    // Send success response
    res.status(200).json({ message: "Reset password email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    // Check if both passwords are provided and match
    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Both password fields are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Find the user by reset token
    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    // Check if the reset token has expired
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        message: "Token expired. Please request a new password reset.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user
    await user.save();

    // Send success email
    await sendPasswordResetSuccessfulEmail(user.email);

    // Send success response
    res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
