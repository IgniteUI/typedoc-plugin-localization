import { Component } from 'typedoc/dist/lib/output/components'
import { OptionsComponent,  } from 'typedoc/dist/lib/utils/options/options'
import { DeclarationOption, ParameterType } from 'typedoc/dist/lib/utils/options/declaration';
import { Constants } from '../utils/constants';

@Component({ name: 'options-component' })
export class OptComponent extends OptionsComponent {
    public initialize() {
        const generateToOption: DeclarationOption = {
            name: Constants.CONVERT_OPTION,
            short: Constants.SHORT_CONVERT_OPTION,
            help: 'Specifies the directory where the json files have to be generated.',
        };

        const generateFromOption: DeclarationOption = {
            name: Constants.RENDER_OPTION,
            short: Constants.SHORT_RENDER_OPTION,
            help: 'Specify from where to get the loclized json data.'
        }

        const includeTagsOption: DeclarationOption = {
            name: Constants.INCLUDE_TAGS_OPTION,
            help: 'Specify whether to include tags per comment.',
            type: ParameterType.Boolean,
            defaultValue: true
        }        

        const includeParamsOption: DeclarationOption = {
            name: Constants.INCLUDE_PARAMS_OPTION,
            help: 'Specify whether to include params per comment.',
            type: ParameterType.Boolean,
            defaultValue: true
        }

        const localizeOption: DeclarationOption = {
            name: Constants.LOCALIZE_OPTION,
            help: 'Specify your localization for instance (jp)'
        }

        const shellStringsOption: DeclarationOption = {
            name: Constants.TEMPLATE_STRINGS_OPTION,
            help: 'Path to the json file which contains your localized template strings'
        }

        /**
         * Custom options registration
         */
        this.application.options.addDeclarations([
            generateToOption, 
            generateFromOption, 
            includeTagsOption, 
            includeParamsOption,
            localizeOption,
            shellStringsOption]);
    }
}