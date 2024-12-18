import { Options, ParameterType } from 'typedoc'
import { Constants } from './constants.js';

export function pluginOptions(options: Pick<Options, "addDeclaration">) {

    options.addDeclaration({
        name: Constants.CONVERT_OPTION,
        help: 'Specifies the directory where the json files have to be generated.'
    });

    options.addDeclaration({
        name: Constants.RENDER_OPTION,
        help: 'Specify from where to get the loclized json data.'
    });

    options.addDeclaration({
        name: Constants.INCLUDE_TAGS_OPTION,
        help: 'Specify whether to include tags per comment.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    options.addDeclaration({
        name: Constants.INCLUDE_PARAMS_OPTION,
        help: 'Specify whether to include params per comment.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    options.addDeclaration({
        name: Constants.INCLUDE_WARNS_OPTION,
        help: 'Specify whether to throw warnings of missed tags and parameters into the json\'s.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    options.addDeclaration({
        name: Constants.LOCALIZE_OPTION,
        help: 'Specify your localization for instance (jp)'
    });

    options.addDeclaration({
        name: Constants.TEMPLATE_STRINGS_OPTION,
        help: 'Path to the json file which contains your localized template strings'
    });

    options.addDeclaration({
        name: Constants.INCLUDE_VERSIONS_OPTION,
        help: 'Specify whether to include versions dropdown into the header.',
        type: ParameterType.Boolean,
        defaultValue: false
    });

    options.addDeclaration({
        name: Constants.PRODUCT_OPTION,
        help: 'Specify product name.'
    });

        options.addDeclaration({
        name: Constants.CONFIG_OPTION,
        help: 'Specify config json file name to use for url configurations.'
    });
}