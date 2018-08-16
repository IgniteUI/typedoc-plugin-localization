import { Component } from 'typedoc/dist/lib/output/components'
import { OptionsComponent, DiscoverEvent } from 'typedoc/dist/lib/utils/options/options'
import { OptionDeclaration, DeclarationOption, ParameterType } from 'typedoc/dist/lib/utils/options/declaration';

@Component({ name: 'options-component' })
export class OptComponent extends OptionsComponent {
    public initialize() {
        const data:DeclarationOption = {
            name: 'generate',
            help: 'Specify whether to generate the doc',
            defaultValue: true,
            type: ParameterType.Boolean
        };

        const newOption: OptionDeclaration = new OptionDeclaration(data);
        this.owner.addDeclaration(newOption);
    }

}