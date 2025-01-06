import { RendererEvent, ReflectionKind, Application } from "typedoc";
import { GlobalFuncs } from '../utils/global-funcs.js';
import { HardcodedStrings } from '../utils/template-strings.js';

export class ThemeComponent {
    public app: Application;

    public constructor(app: Application) {
        this.app = app
        this.initialize();
    }

    initialize() {
        this.app.renderer.on(
            RendererEvent.BEGIN, this.onRenderBegin.bind(this)
        );
    }

    private onRenderBegin(event) {
        if (!event.project.groups) {
            return;
        }

        this.localizeGroupTitles(event.project.groups);
        this.run(event.project.reflections);
    }
    
    private run(reflections) {
        const keys = Object.keys(reflections);
        keys.forEach(key => {
            const reflection = reflections[key];
            this.localizeReflectionDeffinitions(reflection)
        })
    }

    /**
     * Triggers localizaiton of template groups(Accessors, Constructor, Methods, Properties, etc.) 
     * and Object abbreviations(Class, Interface, Enum).
     * @param reflection 
     */
    private localizeReflectionDeffinitions(reflection) {
        if (reflection.kind === ReflectionKind.Class ||
            reflection.kind === ReflectionKind.Enum ||
            reflection.kind === ReflectionKind.Interface) {        
                if (reflection.groups) {
                    this.localizeGroupTitles(reflection.groups);
                }

                this.localizeReflectionAbbriviation(reflection);
        }

        if (reflection.parameters && reflection.parameters.length) {
            reflection.parameters.forEach(e => {
                this.localizeParameterFlags(e);
            });
        }
    }

    /**
     * Localize Object abbreviatons(Class, Interface, Enum)
     * @param reflection 
     */
    private localizeReflectionAbbriviation(reflection) {
        reflection.kindString = this.getLocaleValue(reflection.kindString);
    }

    /**
     * Localize template groups like (Accessors, Methods, Properties, etc.)
     * @param groups 
     */
    private localizeGroupTitles(groups) {
        groups.forEach(element => {
            element.title = this.getLocaleValue(element.title);
        });
    }

    private localizeParameterFlags(param) {
        if (param.flags && param.flags.length) {
            param.flags.forEach((f, idx) => {
                param.flags[idx] = this.getLocaleValue(f);
            });
        }
    }

    /**
     * Get template localized string from cached translations.
     * @param value 
     */
    private getLocaleValue(value) {
        return GlobalFuncs.getKeyValuePairVal(
            HardcodedStrings.getTemplateStrings(), 
            HardcodedStrings.getLocal(), 
            value);
    }
}