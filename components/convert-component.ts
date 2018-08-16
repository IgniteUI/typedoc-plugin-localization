import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Converter } from 'typedoc/dist/lib/converter';
import { ReflectionKind } from 'typedoc/dist/lib/models';
import * as process from 'process';
import { MarkedPlugin } from 'typedoc/dist/lib/output/plugins';
import { FileOperations } from '../utils/file-operations';
import { JsonObjectFactory } from '../utils/factories/class-factory';
import { Factory } from '../utils/factories/factory';
import { JsonObjectEnumFactory } from '../utils/factories/enum-factory';

const MAIN_DIR = 'exports'

@Component({ name: 'convert-component' })
export class ConvertComponent extends ConverterComponent {
    jsonObjectName;
    factory: Factory;
    fileOperations: FileOperations;
    reflection;

    public initialize() {

        this.listenTo(this.owner, {
            [Converter.EVENT_RESOLVE]: this.resolve,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onResolveBegin,
            [Converter.EVENT_RESOLVE_END]: this.onResolveEnd,
            [Converter.EVENT_END]: this.onEnd,
            [Converter.EVENT_BEGIN]: this.onBegin
        });

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

        if (this.fileOperations.ifDirectoryExists(options.out) || this.fileOperations.ifFileExists(options.out)) {
            this.fileOperations.removeDirectoryOrFile(options.out);
        }
    }

    private onResolveBegin(context) {
        const options = this.application.options.getRawValues();
        if(!options.generate) {
            return;
        }

        const files = context.project.files;
        this.fileOperations.prepareOutputDirectory(files, MAIN_DIR)
    }

    private onResolveEnd(...rest) {
        // Add the last resolved object
        if (this.factory && !this.factory.isEmpty()) {                    
            this.fileOperations.createFileJSON(this.reflection, this.factory, MAIN_DIR);
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
                        this.fileOperations.createFileJSON(this.reflection, this.factory, MAIN_DIR);                    
                    }
                }

                this.jsonObjectName = reflection.name;
                this.reflection = reflection;
                this.factory = this.instanceBuilder(reflection.kind, this.jsonObjectName);
                const data = this.getCommentText(reflection);
                this.factory.buildObjectStructure(data);
                break;
            case ReflectionKind.Property:
            case ReflectionKind.CallSignature:
            case ReflectionKind.EnumMember:
                const getData = this.getCommentText(reflection);
                this.factory.appendAttribute(reflection.kind, this.jsonObjectName, reflection.name, getData);
                   
                break;
            case ReflectionKind.Function:
                    const funcData = this.getCommentText(reflection.signatures[0]);
                    this.factory.appendAttribute(reflection.kind, this.jsonObjectName, reflection.name, funcData);
                break;
            case ReflectionKind.GetSignature:
            case ReflectionKind.SetSignature:
                const accessorName = reflection.parent.name;
                const accessorType = reflection.kind;
                const accessorData = this.getCommentText(reflection);
                this.factory.appendAccessorsAttribute(reflection.parent.kind, this.jsonObjectName, accessorType, accessorName, accessorData);
            default:
                return;
        }
    }

    private getCommentText(obj) {
        if (!obj.comment) {
            return;
        }

        const comment = {};
        comment['comment'] = {};
        
        if(obj.comment.text) {
            comment['comment']['text'] = obj.comment.text;
        }

        if(obj.comment.shortText) {
            comment['comment']['shortText'] = obj.comment.shortText;
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