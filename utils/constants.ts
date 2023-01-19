export class Constants {
    static readonly PROJ_NAME = 'typedoc-plugin-localization';

    /**
     * JSON keys
     */
    static readonly PARAMS = 'parameters';
    static readonly RETURNS = 'returns';
    static readonly TAGS = 'tags';
    static readonly WARNS = 'warns';
    static readonly TAG_NAME = 'tagName';
    static readonly COMMENT = 'comment';
    static readonly TEXT = 'text';
    static readonly SHORT_TEXT = 'shortText';
    static readonly SUMMARY = 'summary';
    static readonly BLOCK_TAGS = 'blockTags';

    /**
     * Options
     */
    static readonly CONVERT_OPTION = 'generate-json';
    static readonly RENDER_OPTION = 'generate-from-json';
    static readonly INCLUDE_TAGS_OPTION = 'tags';
    static readonly INCLUDE_WARNS_OPTION = 'warns';
    static readonly INCLUDE_PARAMS_OPTION = 'params';
    static readonly LOCALIZE_OPTION = 'localize'
    static readonly TEMPLATE_STRINGS_OPTION = 'templateStrings';
    static readonly INCLUDE_VERSIONS_OPTION = 'versioning';
    static readonly PRODUCT_OPTION = 'product';

    static readonly GLOBAL_FUNCS_FILE_NAME = 'globalFunctions';
}