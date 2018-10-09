import * as process from 'process';
import * as fs from 'fs-extra';

import { Application } from 'typedoc/dist/lib/application'
import { ConvertComponent } from './components/convert-component';
import { RenderComponenet } from './components/render-component';
import { OptComponent } from './components/options-component';
import { Constants } from './utils/constants';
import { GlobalFuncs } from './utils/global-funcs';
import { HardcodedStrings } from './utils/template-strings';
import { ThemeComponent } from './components/theme-component';

module.exports = (PluginHost: Application) => {
    const app = PluginHost.owner; 

    app.options.addComponent('options-component', OptComponent);

    let startConverter = false; 
    let startRenderer = false;

    const processArgs = process.argv;
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
         * As we kill the process after the convertion of the json's we or not interested in the value of the option.
         */
        app.options.setValue('out', 'defult');
        app.converter.addComponent('convert-component', ConvertComponent);
    }

    if (startRenderer) {
        app.renderer.addComponent('render-component', RenderComponenet);
    }
    
    app.renderer.addComponent('theme-component', ThemeComponent);
    registerHardcodedTemplateStrings(processArgs);
}

function registerHardcodedTemplateStrings(options) {
    const shellStringsFilePath = GlobalFuncs.getOptionValue(options, Constants.TEMPLATE_STRINGS_OPTION);
    const local = GlobalFuncs.getOptionValue(options, Constants.LOCALIZE_OPTION);

    if (!shellStringsFilePath || !local) {
        return;
    }

    const templateStrings = fs.readJsonSync(shellStringsFilePath);
    
    HardcodedStrings.setLocal(local);
    HardcodedStrings.setTemplateStrings(templateStrings);
}