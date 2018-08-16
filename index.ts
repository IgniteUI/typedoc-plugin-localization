import { Application } from 'typedoc/dist/lib/application'
import { ConvertComponent } from './components/convert-component';
import { RenderComponenet } from './components/render-component';
import { OptComponent } from './components/options-component';

module.exports = (PluginHost: Application) => {
    const app = PluginHost.owner;

    console.log("TEST");
    app.options.addComponent('options-component', OptComponent);
    app.converter.addComponent('convert-component', ConvertComponent);
    app.renderer.addComponent('render-component', RenderComponenet)
}

