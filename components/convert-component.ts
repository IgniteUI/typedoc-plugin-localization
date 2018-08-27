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
    mainDir: string;
    functionsFileName = 'globalFunctions';
    funcJson = {};

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
        this.mainDir = options[Constants.CONVERT_COMMAND];

        if(!this.fileOperations.ifDirectoryExists(this.mainDir)) {
            this.fileOperations.createDir(this.mainDir);
        }
    }

    private onEnd(...rest) {
        process.exit(0);
    }

    private onResolveBegin(context) {
        const files = context.project.files;
        this.fileOperations.prepareOutputDirectory(this.mainDir, files);
        this.fileOperations.createFile(this.mainDir, null, this.functionsFileName, 'json');
    }

    private onResolveEnd(...rest) {
        // Add the last resolved object
        if (this.factory && !this.factory.isEmpty()) {
            const filePath = this.reflection.sources[0].fileName;
            this.fileOperations.appendFileData(this.mainDir, filePath, this.jsonObjectName, 'json', this.factory.getFileClassContent());
        }

        const funcObjKeys = Object.keys(this.funcJson);
        if (funcObjKeys.length) {
            this.fileOperations.appendFileData(this.mainDir, null, this.functionsFileName, 'json', this.funcJson);
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
                        this.fileOperations.appendFileData(this.mainDir, filePath, this.jsonObjectName, 'json', this.factory.getFileClassContent());
                    }
                }

                this.jsonObjectName = reflection.name;
                this.reflection = reflection;
                this.factory = this.instanceBuilder(reflection.kind, this.jsonObjectName);
                const data = this.getCommentData(reflection);
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
                    // const path = `${this.mainDir}\\${this.functionsFileName}.json`;
                    const obj = new FunctionFactory(reflection.name);
                    obj.buildObjectStructure(funcData);
                    if (!obj.isEmpty()) {
                        this.funcJson = Object.assign(obj.getFileClassContent(), this.funcJson);
                        // this.funcJson.push(obj.getFileClassContent);
                        // this.fileOperations.appendFileData(this.mainDir, null, this.functionsFileName, 'json', obj.getFileClassContent());
                    }

                    // this.factory.appendAttribute(reflection.kind, this.jsonObjectName, reflection.name, funcData);
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
        if (objectType === ReflectionKind.Enum) {
            return new EnumFactory(objectName)
        } else if (objectType === ReflectionKind.Interface) {
            return new InterfaceFactory(objectName);
        }

        return new ClassFactory(objectName);
    }
}