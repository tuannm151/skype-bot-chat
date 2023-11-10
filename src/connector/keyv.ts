import Keyv from "keyv";
const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

class KeyvSingleton {
    private static instance: KeyvSingleton;
    private keyv: Keyv;
  
    private constructor() {
        const dbURI = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`;
        this.keyv = new Keyv(dbURI);
    }
  
    public static getInstance(): KeyvSingleton {
        if (!KeyvSingleton.instance) {
            KeyvSingleton.instance = new KeyvSingleton();
        }
        return KeyvSingleton.instance;
    }
  
    public getKeyv(): Keyv {
        return this.keyv;
    }
}
  
const keyv = KeyvSingleton.getInstance().getKeyv();
export default keyv;
   