import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: { message: "Too many login attempts, please try again in 15 minutes." },
});

export const postLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { message: "Too many posts created, please slow down." },
});

export const commentLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { message: "You are commenting too fast, please slow down." },
});