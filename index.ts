import { Application } from 'typedoc/dist/lib/application'
import { ConvertComponent } from './components/convert-component';
import { RenderComponenet } from './components/render-component';
import { OptComponent } from './components/options-component';
import * as process from 'process';
import { Constants } from './utils/constants';


module.exports = (PluginHost: Application) => {
    const app = PluginHost.owner;
    console.log('from index');
    app.options.addComponent('options-component', OptComponent);

    let startConverter = false; 
    let startRenderer = false;

    const processArgs = process.argv;
    processArgs.forEach(command => {
        if (command.indexOf(Constants.CONVERT_COMMAND) >= 0 ||
            command.indexOf(Constants.SHORT_CONVERT_COMMAND) >= 0) {
                startConverter = true;
        }

        if (command.indexOf(Constants.RENDER_COMMAND) >= 0 ||
            command.indexOf(Constants.SHORT_RENDER_COMMAND) >= 0) {
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
        app.renderer.addComponent('render-component', RenderComponenet)
    }
}

