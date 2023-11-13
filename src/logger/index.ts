import winston, { createLogger } from "winston";

const logger = createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
    ),
    defaultMeta: { service: "skype-bot" },
    transports: [
        new winston.transports.Console(
            {
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                ),
            },
        ),
        new winston.transports.File({ 
            filename: "./logs/error.log", 
            level: "error", 
            maxsize: 5242880,
        }),
        new winston.transports.File({ 
            filename: "./logs/combined.log",
            maxsize: 5242880,
        }),
    ],
});

export default logger;