declare global {
    namespace NodeJS {
        interface ProcessEnv {
          [key: string]: string | undefined,
          MicrosoftAppId: string,
          BROWSER_WS_ENDPOINT: string,
          AUTH_SECRET: string,
        }
    }
}

export {};