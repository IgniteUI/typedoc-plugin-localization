import * as path from 'path';

import { RendererEvent } from "typedoc/dist/lib/output/events";
import { Component } from 'typedoc/dist/lib/utils';
import { RendererComponent } from 'typedoc/dist/lib/output/components';
import { Constants } from '../utils/constants';
import { GlobalFuncs } from '../utils/global-funcs';
import { HardcodedStrings } from '../utils/template-strings';
import { ReflectionKind } from 'typedoc/dist/lib/models';

@Component({ name: 'theme-component' })
export class ThemeComponent extends RendererComponent {
    initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRenderBegin
        });
    }

    private onRenderBegin(event) {
        this.registerHelpers();

        this.run(event.project.reflections);
    }

    private run(reflections) {
        const keys = Object.keys(reflections);
        keys.forEach(key => {
            const reflection = reflections[key];
            this.updateTemplateRepresentations(reflection)
        })
    }

    private updateTemplateRepresentations(reflection) {
        if (reflection.kind === ReflectionKind.Class ||
            reflection.kind === ReflectionKind.Enum ||
            reflection.kind === ReflectionKind.Interface) {        
                if (reflection.groups) {
                    this.replaceGroupsTitle(reflection.groups);
                }

                this.updateReflectionAbbreviation(reflection);
            }
    }

    private updateReflectionAbbreviation(reflection) {
        reflection.kindString = this.getLocaleValue(reflection.kindString);
    }

    private replaceGroupsTitle(groups) {
        groups.forEach(element => {
            element.title = this.getLocaleValue(element.title);
        });
    }

    private getLocaleValue(value) {
        return GlobalFuncs.getKeyValuePairRes(
            HardcodedStrings.getTemplateStrings(), 
            HardcodedStrings.getLocal(), 
            value);
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