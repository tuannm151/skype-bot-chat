import winston, { createLogger } from "winston";
import { ZodError } from "zod";

const errorFormat = winston.format((info) => {  
    if (info instanceof ZodError) {
        return Object.assign({
            message: "ZodError"
        }, info);
    }
    return info;
})();

const logger = createLogger({
    format: winston.format.combine(
        errorFormat,
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json(),
        winston.format.errors({ stack: true }),
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