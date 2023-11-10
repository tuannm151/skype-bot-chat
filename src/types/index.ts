import { TurnContext } from "botbuilder";

type ObjectData = {
    [key: string] : string;
};

enum Lang {
    en_US = 'en_US',
    vi_VN = 'vi_VN'
} 

interface Config {
    name: string;
    description: string;
    usage: string;
    cooldown?: number;
    disabled?: boolean;
}

interface LangData {
    [key : string] : {
        [key: string] : string;
    }
}

interface CommandHandlerArgs {
    context: TurnContext;
    params: string[];
    getLang: (key: string, objectData?: ObjectData) => string;
}

interface Plugin {
    config: Config;
    langData: LangData;
    onCall: (args: CommandHandlerArgs) => unknown;
    onLoad?: () => unknown;
}

export {
    Lang,
    Config,
    LangData,
    ObjectData,
    Plugin,
    CommandHandlerArgs
};