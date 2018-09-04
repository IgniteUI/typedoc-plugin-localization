import * as process from 'process';

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
    jsonObjectName: string;
    factoryInstance: BaseFactory;
    fileOperations: FileOperations;
    reflection;
    parser: Parser;
    mainDirToExport: string;
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

    private onBegin(...rest) {
        const options = this.application.options.getRawValues();
        this.mainDirToExport = options[Constants.CONVERT_COMMAND];

        if(!this.fileOperations.ifDirectoryExists(this.mainDirToExport)) {
            this.fileOperations.createDir(this.mainDirToExport);
        }
    }

    private onEnd(...rest) {
        process.exit(0);
    }

    private onResolveBegin(context) {
        const files = context.project.files;
        this.fileOperations.prepareOutputDirectory(this.mainDirToExport, files);
        /**
         * Create main file for all global functions.
         */
        this.fileOperations.createFile(this.mainDirToExport, null, Constants.GLOBAL_FUNCS_FILE_NAME, 'json');
    }

    private onResolveEnd(...rest) {
        // Add the last resolved object
        if (this.factoryInstance && !this.factoryInstance.isEmpty()) {
            const filePath = this.reflection.sources[0].fileName;
            this.fileOperations.appendFileData(this.mainDirToExport, filePath, this.jsonObjectName, 'json', this.factoryInstance.getJsonContent());
        }

        /**
         * Add all global functions into the file which corresponds for them file; 
         */ 
        const funcObjKeys = Object.keys(this.globalFuncsJson);
        if (funcObjKeys.length) {
            this.fileOperations.appendFileData(this.mainDirToExport, null, Constants.GLOBAL_FUNCS_FILE_NAME, 'json', this.globalFuncsJson);
        }
    }

    private resolve(context, reflection) {
        switch(reflection.kind) {
            case ReflectionKind.Enum:
            case ReflectionKind.Class:
            case ReflectionKind.Interface:
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

    
    private getCommentInfo(reflection) {
        if (!reflection.comment) {
            return;
        }

        let comment = this.getCommentData(reflection.comment);

        if (reflection.comment.tags) {
            comment[Constants.COMMENT] = Object.assign(this.getTagComments(reflection.comment), comment[Constants.COMMENT]);            
        }

        if (reflection.parameters) {
            comment[Constants.COMMENT] = Object.assign(this.getParamsComments(reflection), comment[Constants.COMMENT]);
        }

        return comment;
    }

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

    private getTagComments(comment) {
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