import { Component } from 'typedoc/dist/lib/output/components'
import { OptionsComponent, DiscoverEvent } from 'typedoc/dist/lib/utils/options/options'
import { OptionDeclaration, DeclarationOption, ParameterType, ParameterHint } from 'typedoc/dist/lib/utils/options/declaration';
import { Option } from 'typedoc/dist/lib/utils/component';
import { Constants } from '../utils/constants';

@Component({ name: 'options-component' })
export class OptComponent extends OptionsComponent {
    public initialize() {            
        const generateToOption: DeclarationOption = {
            name: Constants.CONVERT_COMMAND,
            short: Constants.SHORT_CONVERT_COMMAND,
            help: 'Specifies the directory where the json files have to be generated.',
        };

        const generateFromOption: DeclarationOption = {
            name: Constants.RENDER_COMMAND,
            short: Constants.SHORT_RENDER_COMMAND,
            help: 'Specify from where to get the loclized json data.'
        }

        const includeTagsOption: DeclarationOption = {
            name: Constants.TAGS_INCLUDE_COMMAND,
            help: 'Specify whether to include tags per comment.',
            defaultValue: true
        }        

        const includeParamsOption: DeclarationOption = {
            name: Constants.PARAMS_INCLUDE_COMMAND,
            help: 'Specify whether to include params per comment.',
            defaultValue: true
        }

        this.application.options.addDeclaration(new OptionDeclaration(generateToOption));
        this.application.options.addDeclaration(new OptionDeclaration(generateFromOption));
        this.application.options.addDeclaration(new OptionDeclaration(includeTagsOption));
        this.application.options.addDeclaration(new OptionDeclaration(includeParamsOption));
    }
}