import { Next, Request, Response } from "restify";
const { AUTH_SECRET } = process.env;

const authenticateMiddleware = (req: Request, res: Response, next: Next) => {
    const  { authorization } = req.headers;
    if (authorization !== AUTH_SECRET) {
        return res.send(401);
    }
    next();
};

export default authenticateMiddleware;