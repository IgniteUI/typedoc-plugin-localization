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

        this.application.options.addDeclaration(new OptionDeclaration(generateToOption));
        this.application.options.addDeclaration(new OptionDeclaration(generateFromOption));
    }
}