import process from 'process';
import fs from 'fs-extra';
import { Application, Converter, Renderer } from 'typedoc'
import { ConvertComponent } from './components/convert-component.js';
import { RenderComponenet } from './components/render-component.js';
import { Constants } from './utils/constants.js';
import { HardcodedStrings } from './utils/template-strings.js';
import { ThemeComponent } from './components/theme-component.js';
import { pluginOptions } from './utils/options.js';

export * from './utils/helpers/localize.js';

export function load(PluginHost: Application) {
    const app = PluginHost.owner;
    /**
     * Add Options register Component.
     */
    pluginOptions(app.options);

    let startConverter = false; 
    let startRenderer = false;
    const processArgs = process.argv;

    /**
     * Determines it it is necessary to run Conversion or Render process based on the 
     * Command line arguments(Options).
     */
    processArgs.forEach(command => {
        if (command.indexOf(Constants.CONVERT_OPTION) >= 0) {
                startConverter = true;
        }

        if (command.indexOf(Constants.RENDER_OPTION) >= 0) {
                startRenderer = true;
        }
    });

    if (startConverter) {
        /**
         * We set the 'default' value of 'out' option because this option is checked before the converter has been started. 
         * As we kill the process after the convertion of the json's we or not interested in the value of the 'out' option.
         */
        app.options.setValue('out', 'defult');

        /**
         * Register component responsible for the convertion.
         */
        new ConvertComponent(app);
        // app.converter.('test', ConvertComponent(app));
    }

    if (startRenderer) {
        /**
         * Register component responsible for the Renderer.
         */
        new RenderComponenet(app)
    }
    
    /**
     * Register theme component.
     */
    new ThemeComponent(app);

    /**
     * Build the Cache containing all localized template strings.
     */
    const registerTemplateStrings = () => {
        const shellStringsFilePath = app.options.getValue(Constants.TEMPLATE_STRINGS_OPTION);
        const locale = app.options.getValue(Constants.LOCALIZE_OPTION) as string;

        if (!shellStringsFilePath || !locale) {
            return;
        }

        const templateStrings = fs.readJsonSync(shellStringsFilePath);
        
        HardcodedStrings.setLocal(locale);
        HardcodedStrings.setTemplateStrings(templateStrings);
    }

    app.converter.on(Converter.EVENT_RESOLVE, registerTemplateStrings);
    app.renderer.on(Renderer.EVENT_BEGIN, registerTemplateStrings);
}
