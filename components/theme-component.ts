import * as path from 'path';

import { RendererEvent } from "typedoc/dist/lib/output/events";
import { Component } from 'typedoc/dist/lib/utils';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { Constants } from '../utils/constants';

@Component({ name: 'theme-component' })
export class ThemeComponent extends RendererComponent {
    initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRenderBegin
        });
    }

    private onRenderBegin() {
        this.registerHelpers();
    }

    private registerHelpers() {
        let module;
        try {
            module = require.resolve(Constants.PROJ_NAME);
        } catch(e) {
            this.application.logger.error(e.message);
            return;
        }

        const pluginDist = path.dirname(require.resolve(module));
        if (pluginDist) {
            this.owner.theme.resources.deactivate();
            this.owner.theme.resources.helpers.addOrigin('custom-helpers', `${pluginDist}\\utils\\helpers`);
            this.owner.theme.resources.activate();
        }
    }
}