import { readdirSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { pathToFileURL } from 'url';
import pluginHandler from './handler.js';

const commandsPath = resolvePath(process.cwd(), 'plugins', 'commands');

export async function loadCommands() {
    const categories = readdirSync(commandsPath);
    for (const category of categories) {
        const categoryPath = resolvePath(commandsPath, category);

        const categoryFiles = readdirSync(categoryPath).filter((file) => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));

        for (const plugin of categoryFiles) {
            const fileName = plugin;
            try {
                const pluginPath = resolvePath(categoryPath, fileName);
                const pluginURL = pathToFileURL(pluginPath);
                const pluginModule = await import(pluginURL);

                const pluginExport = pluginModule.default || pluginModule;

                if (typeof pluginExport !== 'object') {
                    throw new Error(`Plugin ${fileName} does not export an object`);
                }

                const { config, langData, onCall, onLoad } = pluginExport;

                if (typeof config !== 'object') {
                    throw new Error(`Plugin ${fileName} does not export a config object`);
                }

                if (typeof langData !== 'object') {
                    throw new Error(`Plugin ${fileName} does not export a langData object`);
                }
                if (typeof onCall !== 'function') {
                    throw new Error(`Plugin ${fileName} does not export an onCall function`);
                }
                if (typeof onLoad === 'function') {
                    try {
                        await onLoad();
                    } catch (err) {
                        console.error(`Error running onLoad for plugin ${fileName}: ${err}`);
                    }
                }
                pluginHandler.setCommand(pluginExport);
            } catch (err) {
                console.error(`Error loading plugin ${fileName}: ${err}`);
            }
        }
    }
}
