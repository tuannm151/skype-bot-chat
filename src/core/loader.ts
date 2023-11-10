import { readdirSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { pathToFileURL } from 'url';
import pluginHandler from './handler.js';
import { Plugin } from '~/types';

const commandsPath = resolvePath(__dirname, '../plugins/commands');

export async function loadCommands() {
    const categories = readdirSync(commandsPath);
    for (const category of categories) {
        const categoryPath = resolvePath(commandsPath, category);

        const categoryFiles = readdirSync(categoryPath).filter((file) => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));

        for (const plugin of categoryFiles) {
            const fileName = plugin;
            try {
                const pluginPath = resolvePath(categoryPath, fileName);
                const pluginModule = await import(pluginPath);
                const pluginExport : Plugin = pluginModule.default || pluginModule;

                const { config, onLoad } = pluginExport;

                if (config.disabled) {
                    console.log(`Plugin ${fileName} is disabled`);
                    continue;
                }

                if (onLoad) {
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
