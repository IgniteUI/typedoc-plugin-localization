import {
    Application,
    Converter,
    ReflectionKind,
} from 'typedoc';
import { FileOperations } from '../utils/file-operations';
import { ClassFactory } from '../utils/factories/class-factory';
import { BaseFactory } from '../utils/factories/base-factory';
import { EnumFactory } from '../utils/factories/enum-factory';
import { Parser } from '../utils/parser';
import { Constants } from '../utils/constants';
import { InterfaceFactory } from '../utils/factories/interface-factory';
import { FunctionFactory } from '../utils/factories/function-factory';

export class ConvertComponent {
    /**
     * Contains current name per every Class, Interface, Enum.
     */
    public jsonObjectName: string;
    /**
     * Contains current Object instance.
     */
    public factoryInstance: BaseFactory;
    public fileOperations: FileOperations;
    /**
     * Current @Reflection instance.
     */
    public reflection;
    public parser: Parser;
    /**
     * Main process dir
     */
    public mainDirToExport: string;
    /**
     * Global functions data.
     */
    public globalFuncsJson = {};

    public application: Application

    public constructor(application: Application) {
        this.application = application;
        this.initialize();
    }

    public initialize() {

        this.application.converter.on(Converter.EVENT_RESOLVE, this.resolve.bind(this));
        this.application.converter.on(Converter.EVENT_RESOLVE_BEGIN, this.onResolveBegin.bind(this));
        this.application.converter.on(Converter.EVENT_RESOLVE_END, this.onResolveEnd.bind(this));
        this.application.converter.on(Converter.EVENT_END, this.onEnd.bind(this));
        this.application.converter.on(Converter.EVENT_BEGIN, this.onBegin.bind(this));

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

        if (!this.fileOperations.ifDirectoryExists(this.mainDirToExport)) {
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
        /**
         * Create main file which would contains all global functions.
         */
        this.fileOperations.createFile(this.mainDirToExport, null, Constants.GLOBAL_FUNCS_FILE_NAME, 'json');
        this.fileOperations.appendFileData(this.mainDirToExport, null, Constants.GLOBAL_FUNCS_FILE_NAME, 'json', {});
    }

    private onResolveEnd() {
        /**
         * Write the last built json file.
         * 
         * It happens here because we are unable to track into the 
         * @reslove handler when exactly the execution stops.
         * And we know for sure that the last step before stropping the conversion is here.
         */
        if (this.factoryInstance && !this.factoryInstance.isEmpty()) {
            const filePath = this.reflection.sources[0].fileName;
            const processedDir = this.fileOperations.getFileDir(filePath);
            this.fileOperations.createFile(this.mainDirToExport, processedDir, this.jsonObjectName, 'json');
            this.fileOperations.appendFileData(this.mainDirToExport, processedDir, this.jsonObjectName, 'json', this.factoryInstance.getJsonContent());
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
        switch (reflection.kind) {
            case ReflectionKind.Enum:
            case ReflectionKind.Class:
            case ReflectionKind.Interface:
                /**
                 * Writes file content when the resolve process for to Object ends 
                 * per(Class, Enum, Interface).
                 */
                if (this.jsonObjectName !== reflection.name && this.jsonObjectName !== undefined) {
                    if (!this.factoryInstance.isEmpty()) {
                        const filePath = this.reflection.sources[0].fileName;
                        const processedDir = this.fileOperations.getFileDir(filePath);
                        this.fileOperations.createFile(this.mainDirToExport, processedDir, this.jsonObjectName, 'json');
                        this.fileOperations.appendFileData(this.mainDirToExport, processedDir, this.jsonObjectName, 'json', this.factoryInstance.getJsonContent());
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
                if (getData) {
                    this.factoryInstance.appendAttribute(this.jsonObjectName, reflection.kind, reflection.name, getData);
                }
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

        if (options[Constants.INCLUDE_TAGS_OPTION] && reflection.comment.returns) {
            comment[Constants.COMMENT] = Object.assign(this.getReturnsComment(reflection), comment[Constants.COMMENT]);
        }

        return comment;
    }

    /**
     * Extract the comment from the @return parameter.
     * @param reflection 
     */
    private getReturnsComment(reflection) {
        let returns = {};
        returns[Constants.RETURNS] = this.getCommentData(reflection.comment);
        return returns;
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

        if (obj.summary) {
            comment[Constants.COMMENT] = obj;
        }

        return comment;
    }

    /**
     * Builds a instance depending on the Object type.
     * @param objectType 
     * @param objectName 
     */
    private instanceBuilder(objectType, objectName): BaseFactory {
        switch (objectType) {
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