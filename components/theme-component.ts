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

    /**
     * Triggers localizaiton of template groups(Accessors, Constructor, Methods, Properties, etc.) 
     * and Object abbreviations(Class, Interface, Enum).
     * @param reflection 
     */
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

    /**
     * Localize Object abbreviatons(Class, Interface, Enum)
     * @param reflection 
     */
    private updateReflectionAbbreviation(reflection) {
        reflection.kindString = this.getLocaleValue(reflection.kindString);
    }

    /**
     * Localize template groups like (Accessors, Methods, Properties, etc.)
     * @param groups 
     */
    private replaceGroupsTitle(groups) {
        groups.forEach(element => {
            element.title = this.getLocaleValue(element.title);
        });
    }

    /**
     * Get template localized string from cached translations.
     * @param value 
     */
    private getLocaleValue(value) {
        return GlobalFuncs.getKeyValuePairRes(
            HardcodedStrings.getTemplateStrings(), 
            HardcodedStrings.getLocal(), 
            value);
    }

    /**
     * Register helper function responsible
     * for hardcoded template strings localization.
     */
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