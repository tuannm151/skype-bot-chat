import Keyv from "keyv";
const { POSTGRES_URI } = process.env;

class KeyvSingleton {
    private static instance: KeyvSingleton;
    private keyv: Keyv;
  
    private constructor() {
        this.keyv = new Keyv(POSTGRES_URI);
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

const initKeyv = () => {
    KeyvSingleton.getInstance().getKeyv();
};

export {
    initKeyv,
    keyv,
    KeyvSingleton
};
   