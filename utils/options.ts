import { Options } from 'typedoc/dist/lib/utils/options/options'
import { ParameterType } from 'typedoc/dist/lib/utils/options/declaration';
import { Constants } from './constants';

export function pluginOptions(options: Options) {
    
  options.addDeclaration({
      name: Constants.CONVERT_OPTION,
      short: Constants.SHORT_CONVERT_OPTION,
      help: 'Specifies the directory where the json files have to be generated.',
  });

  options.addDeclaration({
      name: Constants.RENDER_OPTION,
      short: Constants.SHORT_RENDER_OPTION,
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
}