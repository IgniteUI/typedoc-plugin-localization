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
    factory: BaseFactory;
    fileOperations: FileOperations;
    reflection;
    parser: Parser;
    mainDirToExport: string;
    functionsFileName = 'globalFunctions';
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
        this.fileOperations.createFile(this.mainDirToExport, null, this.functionsFileName, 'json');
    }

    private onResolveEnd(...rest) {
        // Add the last resolved object
        if (this.factory && !this.factory.isEmpty()) {
            const filePath = this.reflection.sources[0].fileName;
            this.fileOperations.appendFileData(this.mainDirToExport, filePath, this.jsonObjectName, 'json', this.factory.getJsonContent());
        }

        /**
         * Add all global functions into the file which corresponds for them file; 
         */ 
        const funcObjKeys = Object.keys(this.globalFuncsJson);
        if (funcObjKeys.length) {
            this.fileOperations.appendFileData(this.mainDirToExport, null, this.functionsFileName, 'json', this.globalFuncsJson);
        }
    }

    private resolve(context, reflection) {
        switch(reflection.kind) {
            case ReflectionKind.Enum:
            case ReflectionKind.Class:
            case ReflectionKind.Interface:
                if (this.jsonObjectName !== reflection.name && this.jsonObjectName !== undefined) {
                    if (!this.factory.isEmpty()) {
                        const filePath = this.reflection.sources[0].fileName
                        this.fileOperations.appendFileData(this.mainDirToExport, filePath, this.jsonObjectName, 'json', this.factory.getJsonContent());
                    }
                }

                const data = this.getCommentData(reflection);
                this.jsonObjectName = reflection.name;
                this.reflection = reflection;
                this.factory = this.instanceBuilder(reflection.kind, reflection.name);
                this.factory.buildObjectStructure(data);
                break;
            case ReflectionKind.Property:
            case ReflectionKind.CallSignature:
            case ReflectionKind.EnumMember:
                if (reflection.parent.kind === ReflectionKind.Function) {
                    break;
                }

                const getData = this.getCommentData(reflection);
                this.factory.appendAttribute(this.jsonObjectName, reflection.kind, reflection.name, getData);

                break;
            case ReflectionKind.Function:
                    const funcData = this.getCommentData(reflection.signatures[0]);
                    const funcFactory = this.instanceBuilder(reflection.kind, reflection.name);
                    funcFactory.buildObjectStructure(funcData);
                    if (!funcFactory.isEmpty()) {
                        this.globalFuncsJson = Object.assign(funcFactory.getJsonContent(), this.globalFuncsJson);
                    }
                break;
            case ReflectionKind.GetSignature:
            case ReflectionKind.SetSignature:
                const accessorName = reflection.parent.name;
                const accessorType = reflection.kind;
                const accessorData = this.getCommentData(reflection);
                this.factory.appendAccessorAttributes(this.jsonObjectName, reflection.parent.kind, accessorName, accessorType, accessorData);
            default:
                return;
        }
    }

    private getCommentData(obj) {
        if (!obj.comment) {
            return;
        }

        const comment = {};
        comment[Constants.COMMENT] = {};

        let splittedObj;
        if(obj.comment.text) {
            splittedObj = this.parser.splitByCharacter(obj.comment.text, '\n');
            comment[Constants.COMMENT][Constants.TEXT] = splittedObj;
        }

        if(obj.comment.shortText) {
            splittedObj = this.parser.splitByCharacter(obj.comment.shortText, '\n');
            comment[Constants.COMMENT][Constants.SHORT_TEXT] = splittedObj;
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