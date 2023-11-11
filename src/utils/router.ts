import { RequestHandler, Server } from "restify";

interface RouterOptions {
    prefix?: string;
}

type Route = (server: Server) => void;

class Router {
    private prefix: string;
    private handlers: RequestHandler[] = [];
    public routes: Route[] = [];
    constructor(options: RouterOptions = {}) {
        this.prefix = options.prefix || "";
    }
    public use(...handlers: RequestHandler[]) {
        this.handlers.push(...handlers);
    }

    public get(path: string, ...handlers: RequestHandler[]) {
        this.routes.push((server: Server) => {
            server.get(this.prefix + path, ...this.handlers, ...handlers);
        });
    }

    public post(path: string, ...handlers: RequestHandler[]) {
        this.routes.push((server: Server) => {
            server.post(this.prefix + path, ...this.handlers, ...handlers);
        });
    }

    public put(path: string, ...handlers: RequestHandler[]) {
        this.routes.push((server: Server) => {
            server.put(this.prefix + path, ...this.handlers, ...handlers);
        });
    }

    public delete(path: string, ...handlers: RequestHandler[]) {
        this.routes.push((server: Server) => {
            server.del(this.prefix + path, ...this.handlers, ...handlers);
        });
    }

    public patch(path: string, ...handlers: RequestHandler[]) {
        this.routes.push((server: Server) => {
            server.patch(this.prefix + path, ...this.handlers, ...handlers);
        });
    }
}

function combineRouters(routers: Router[]) {
    return (server: Server) => {
        routers.forEach(router => {
            router.routes.forEach(route => {
                route(server);
            });
        });
    };
}

export { Router, combineRouters };