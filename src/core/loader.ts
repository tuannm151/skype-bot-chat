import { readdirSync } from 'fs';
import { resolve as resolvePath } from 'path';
import pluginHandler from './handler.js';
import { Plugin } from '~/types';
import logger from '~/logger/index.js';

const commandsPath = resolvePath(__dirname, '../plugins/commands');

export async function loadCommands() {
    const categories = readdirSync(commandsPath);
    for (const category of categories) {
        const categoryPath = resolvePath(commandsPath, category);

        const categoryFiles = readdirSync(categoryPath).filter((file) => file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs'));

        let loadedCount = 0;
        for (const plugin of categoryFiles) {
            const fileName = plugin;
            try {
                const pluginPath = resolvePath(categoryPath, fileName);
                const pluginModule = await import(pluginPath);
                const pluginExport : Plugin = pluginModule.default || pluginModule;

                const { config, onLoad } = pluginExport;

                if (config.disabled) {
                    logger.info(`Plugin ${fileName} is disabled`);
                    continue;
                }

                if (onLoad) {
                    await onLoad();
                }
                pluginHandler.setCommand(pluginExport);
                loadedCount++;
            } catch (err) {
                logger.error(`Error loading plugin ${fileName}`, err);
            }
        }
        if (loadedCount > 0) {
            logger.info(`Loaded ${loadedCount} plugins from ${category}`);
        }   
    }
}
