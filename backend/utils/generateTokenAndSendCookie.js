import jwt from "jsonwebtoken";

export const generateTokenAndSendCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 86400 * 1000),
    sameSite: "none",
  });

  return token;
};
