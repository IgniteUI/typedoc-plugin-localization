import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Converter } from 'typedoc/dist/lib/converter';
import { ReflectionKind } from 'typedoc/dist/lib/models';
import { FileOperations } from '../utils/file-operations';
import { ClassFactory } from '../utils/factories/class-factory';
import { BaseFactory } from '../utils/factories/base-factory';
import { EnumFactory } from '../utils/factories/enum-factory';
import { Parser } from '../utils/parser';
import { Constants } from '../utils/constants';
import { InterfaceFactory } from '../utils/factories/interface-factory';
import { FunctionFactory } from '../utils/factories/function-factory';
  
@Component({ name: 'convert-component' })
export class ConvertComponent extends ConverterComponent {
    /**
     * Contains current name per every Class, Interface, Enum.
     */
    jsonObjectName: string;
    /**
     * Contains current Object instance.
     */
    factoryInstance: BaseFactory;
    fileOperations: FileOperations;
    /**
     * Current @Reflection instance.
     */
    reflection;
    parser: Parser;
    /**
     * Main process dir
     */
    mainDirToExport: string;
    /**
     * Global functions data.
     */
    globalFuncsJson = {};

    public initialize() {

        this.listenTo(this.owner, {
            [Converter.EVENT_RESOLVE]: this.resolve,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onResolveBegin,
            [Converter.EVENT_RESOLVE_END]: this.onResolveEnd,
            [Converter.EVENT_END]: this.onEnd,
            [Converter.EVENT_BEGIN]: this.onBegin
        });

        this.parser = new Parser();
        this.fileOperations = new FileOperations(this.application.logger);
    }

    /**
     * Executes when the file convertion begins.
     */
    private onBegin() {
        /**
         * Command line arguments
         */
        const options = this.application.options.getRawValues();
        /**
         * Get json's directory. Where json files should be exported.
         */
        this.mainDirToExport = options[Constants.CONVERT_OPTION];

        if(!this.fileOperations.ifDirectoryExists(this.mainDirToExport)) {
            this.fileOperations.createDir(this.mainDirToExport);
        }
    }

    /**
     * Execute when the convertion of the files end.
     */
    private onEnd() {
        /**
         * Stop the process after all json's are created.
         * 
         * It isn't necessary to continue execution because json's have to be translated first
         * then execute the generation of the documentation.
         */
        process.exit(0);
    }


    private onResolveBegin(context) {
        const files = context.project.files;
        /**
         * Creates the directory structure of the json's generetion.
         */
        this.fileOperations.prepareOutputDirectory(this.mainDirToExport, files);
        /**
         * Create main file which would contains all global functions.
         */
        this.fileOperations.createFile(this.mainDirToExport, null, Constants.GLOBAL_FUNCS_FILE_NAME, 'json');
    }

    private onResolveEnd(...rest) {
        /**
         * Write the last built json file.
         * 
         * It happens here because we are unable to track into the 
         * @reslove handler when exactly the execution stops.
         * And we know for sure that the last step before stropping the conversion is here.
         */
        if (this.factoryInstance && !this.factoryInstance.isEmpty()) {
            const filePath = this.reflection.sources[0].fileName;
            this.fileOperations.appendFileData(this.mainDirToExport, filePath, this.jsonObjectName, 'json', this.factoryInstance.getJsonContent());
        }

        /**
         * Write all collected data for all global functions into corresponding file. 
         */ 
        const funcObjKeys = Object.keys(this.globalFuncsJson);
        if (funcObjKeys.length) {
            this.fileOperations.appendFileData(this.mainDirToExport, null, Constants.GLOBAL_FUNCS_FILE_NAME, 'json', this.globalFuncsJson);
        }
    }

    /**
     * Triggers per every reflection object.
     * @param context 
     * @param reflection 
     */
    private resolve(context, reflection) {
        switch(reflection.kind) {
            case ReflectionKind.Enum:
            case ReflectionKind.Class:
            case ReflectionKind.Interface:
                /**
                 * Writes file content when the resolve process for to Object ends 
                 * per(Class, Enum, Interface).
                 */
                if (this.jsonObjectName !== reflection.name && this.jsonObjectName !== undefined) {
                    if (!this.factoryInstance.isEmpty()) {
                        const filePath = this.reflection.sources[0].fileName
                        this.fileOperations.appendFileData(this.mainDirToExport, filePath, this.jsonObjectName, 'json', this.factoryInstance.getJsonContent());
                    }
                }

                const data = this.getCommentInfo(reflection);
                this.jsonObjectName = reflection.name;
                this.reflection = reflection;
                this.factoryInstance = this.instanceBuilder(reflection.kind, reflection.name);
                this.factoryInstance.buildObjectStructure(data);
                break;
            case ReflectionKind.Property:
            case ReflectionKind.CallSignature:
            case ReflectionKind.EnumMember:
                /**
                 * Skip reflections with type @ReflectionKind.Function because they are aslo @ReflectionKInd.CallSignature
                 * but the handling process here is not appropriate for them.
                 */
                if (reflection.parent.kind === ReflectionKind.Function) {
                    break;
                }

                const getData = this.getCommentInfo(reflection);
                this.factoryInstance.appendAttribute(this.jsonObjectName, reflection.kind, reflection.name, getData);
                break;
            case ReflectionKind.Function:
                    const funcData = this.getCommentInfo(reflection.signatures[0]);
                    const funcInstance = this.instanceBuilder(reflection.kind, reflection.name);
                    funcInstance.buildObjectStructure(funcData);
                    if (!funcInstance.isEmpty()) {
                        this.globalFuncsJson = Object.assign(funcInstance.getJsonContent(), this.globalFuncsJson);
                    }
                break;
            case ReflectionKind.GetSignature:
            case ReflectionKind.SetSignature:
                const accessorName = reflection.parent.name;
                const accessorType = reflection.kind;
                const accessorData = this.getCommentInfo(reflection);
                this.factoryInstance.appendAccessorAttributes(this.jsonObjectName, reflection.parent.kind, accessorName, accessorType, accessorData);
            default:
                return;
        }
    }

    /**
     * Returns all comment info including tags and parameters.
     * @param reflection 
     */
    private getCommentInfo(reflection) {
        const options = this.application.options.getRawValues();
        if (!reflection.comment) {
            return;
        }

        let comment = this.getCommentData(reflection.comment);

        if (options[Constants.INCLUDE_TAGS_OPTION] && reflection.comment.tags) {
            comment[Constants.COMMENT] = Object.assign(this.getTagsComments(reflection.comment), comment[Constants.COMMENT]);            
        }

        if (options[Constants.INCLUDE_PARAMS_OPTION] && reflection.parameters) {
            comment[Constants.COMMENT] = Object.assign(this.getParamsComments(reflection), comment[Constants.COMMENT]);
        }

        return comment;
    }

    /**
     * Returns all parameters per comment.
     * @param reflection 
     */
    private getParamsComments(reflection) {
        let params = {};
        params[Constants.PARAMS] = {};
        reflection.parameters.forEach(param => {
            if (!param.comment) {
                return;
            }

            const paramComment = this.getCommentData(param.comment);
            const paramCommentKeys = Object.keys(paramComment[Constants.COMMENT]);
            if (paramCommentKeys.length) {
                params[Constants.PARAMS][param.name] = paramComment;
            }
        });

        return Object.keys(params[Constants.PARAMS]).length ? params : {};
    }

    /**
     * Returns all tags per comment.
     * @param comment 
     */
    private getTagsComments(comment) {
        let tags = {};
        tags[Constants.TAGS] = {};
        comment.tags.forEach(tag => {
            let tagComment = this.getCommentData(tag);
            if (tag.tagName) {
                tags[Constants.TAGS][tag.tagName] = tagComment;
            }
        });

        return tags;
    }

    /**
     * Returns comment content.
     * @param obj 
     */
    private getCommentData(obj) {
        const comment = {};
        comment[Constants.COMMENT] = {};


        let splittedObj;
        if(obj.text && obj.text.trim().length) {
            splittedObj = this.parser.splitByCharacter(obj.text, '\n');
            comment[Constants.COMMENT][Constants.TEXT] = splittedObj;
        }

        if(obj.shortText && obj.shortText.trim().length) {
            splittedObj = this.parser.splitByCharacter(obj.shortText, '\n');
            comment[Constants.COMMENT][Constants.SHORT_TEXT] = splittedObj;
        }

        if(obj.tagName) {
            comment[Constants.COMMENT][Constants.TAG_NAME] = obj.tagName;
        }

        return comment;
    }

    /**
     * Builds a instance depending on the Object type.
     * @param objectType 
     * @param objectName 
     */
    private instanceBuilder(objectType, objectName): BaseFactory {
        switch(objectType) {
            case ReflectionKind.Enum:
                return new EnumFactory(objectName);
            case ReflectionKind.Interface:
                return new InterfaceFactory(objectName);
            case ReflectionKind.Function:
                return new FunctionFactory(objectName);
            case ReflectionKind.Class:
                return new ClassFactory(objectName);
            default:
                null;
        }
    }
}