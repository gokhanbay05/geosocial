import jwt from "jsonwebtoken";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
};

const generateToken = (res, userId) => {
  const cookieName = process.env.COOKIE_NAME || "geosocial_jwt";
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie(cookieName, token, getCookieOptions());

  return token;
};

export default generateToken;
