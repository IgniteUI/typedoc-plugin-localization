import * as process from 'process';
import * as fs from 'fs-extra';

import { Application } from 'typedoc/dist/lib/application'
import { ConvertComponent } from './components/convert-component';
import { RenderComponenet } from './components/render-component';
import { Constants } from './utils/constants';
import { GlobalFuncs } from './utils/global-funcs';
import { HardcodedStrings } from './utils/template-strings';
import { ThemeComponent } from './components/theme-component';
import { pluginOptions } from './utils/options';

module.exports = (PluginHost: Application) => {
    const app = PluginHost.owner; 

    /**
     * Add Options register Component.
     */
    pluginOptions(app.options)

    let startConverter = false; 
    let startRenderer = false;

    const processArgs = process.argv;
    /**
     * Determines it it is necessary to run Conversion or Render process based on the 
     * Command line arguments(Options).
     */
    processArgs.forEach(command => {
        if (command.indexOf(Constants.CONVERT_OPTION) >= 0 ||
            command.indexOf(Constants.SHORT_CONVERT_OPTION) >= 0) {
                startConverter = true;
        }

        if (command.indexOf(Constants.RENDER_OPTION) >= 0 ||
            command.indexOf(Constants.SHORT_RENDER_OPTION) >= 0) {
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
        app.converter.addComponent('convert-component', new ConvertComponent(app.converter));
    }

    if (startRenderer) {
        /**
         * Register component responsible for the Renderer.
         */
        app.renderer.addComponent('render-component', new RenderComponenet(app.renderer));
    }
    
    /**
     * Register theme component.
     */
    app.renderer.addComponent('theme-component', new ThemeComponent(app.renderer));
    registerHardcodedTemplateStrings(processArgs);
}

/**
 * Build the Cache containing all localized template strings.
 */
function registerHardcodedTemplateStrings(options) {
    const shellStringsFilePath = GlobalFuncs.getCmdLineArgumentValue(options, Constants.TEMPLATE_STRINGS_OPTION);
    const local = GlobalFuncs.getCmdLineArgumentValue(options, Constants.LOCALIZE_OPTION);

    if (!shellStringsFilePath || !local) {
        return;
    }

    const templateStrings = fs.readJsonSync(shellStringsFilePath);
    
    HardcodedStrings.setLocal(local);
    HardcodedStrings.setTemplateStrings(templateStrings);
}