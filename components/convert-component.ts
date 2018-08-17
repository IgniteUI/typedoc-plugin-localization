import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Converter } from 'typedoc/dist/lib/converter';
import { ReflectionKind } from 'typedoc/dist/lib/models';
import * as process from 'process';
import { MarkedPlugin } from 'typedoc/dist/lib/output/plugins';
import { FileOperations } from '../utils/file-operations';
import { JsonObjectFactory } from '../utils/factories/class-factory';
import { Factory } from '../utils/factories/factory';
import { JsonObjectEnumFactory } from '../utils/factories/enum-factory';
import { Parser } from '../utils/parser';
import { Constants } from '../utils/constants';

const MAIN_DIR = 'exports'

@Component({ name: 'convert-component' })
export class ConvertComponent extends ConverterComponent {
    jsonObjectName: string;
    factory: Factory;
    fileOperations: FileOperations;
    reflection;
    parser: Parser;

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
        if(!this.fileOperations.ifDirectoryExists(MAIN_DIR)) {
            this.fileOperations.createDir(MAIN_DIR);
        }
    }

    private onBegin(...rest) {
        const options = this.application.options.getRawValues();
        if (!options.generate) {
            return;
        }
    }

    private onEnd(...rest) {
        const options = this.application.options.getRawValues();
        if (options.generate) {
            process.exit(0);
        }
    }

    private onResolveBegin(context) {
        const options = this.application.options.getRawValues();
        if(!options.generate) {
            return;
        }

        const files = context.project.files;
        this.fileOperations.prepareOutputDirectory(MAIN_DIR, files)
    }

    private onResolveEnd(...rest) {
        // Add the last resolved object
        if (this.factory && !this.factory.isEmpty()) {   
            const filePath = this.reflection.sources[0].fileName;                 
            this.fileOperations.createFileJSON(MAIN_DIR, filePath, this.factory);
        }
    }

    private resolve(context, reflection) {
        const options = this.application.options.getRawValues();
        if(!options.generate) {
            return;
        }

        switch(reflection.kind) {
            case ReflectionKind.Enum:
            case ReflectionKind.Class:
            case ReflectionKind.Interface:                
                if (this.jsonObjectName !== reflection.name && this.jsonObjectName !== undefined) {
                    if (!this.factory.isEmpty()) {
                        const filePath = this.reflection.sources[0].fileName
                        this.fileOperations.createFileJSON(MAIN_DIR, filePath, this.factory);                    
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
                const getData = this.getCommentData(reflection);
                this.factory.appendAttribute(reflection.kind, this.jsonObjectName, reflection.name, getData);
                   
                break;
            case ReflectionKind.Function:
                    const funcData = this.getCommentData(reflection.signatures[0]);
                    this.factory.appendAttribute(reflection.kind, this.jsonObjectName, reflection.name, funcData);
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

    private instanceBuilder(objectType, objectName): Factory {
        if (objectType === ReflectionKind.Enum) {
            return new JsonObjectEnumFactory(objectName)
        }

        return new JsonObjectFactory(objectName);
    }
}