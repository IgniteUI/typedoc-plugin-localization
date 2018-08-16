import { Component, RendererComponent } from 'typedoc/dist/lib/output/components';
import { Renderer } from 'typedoc/dist/lib/output/renderer';
import { RendererEvent, MarkdownEvent } from 'typedoc/dist/lib/output/events';
import * as fs from 'fs';
import * as path from 'path';
import { MarkedPlugin } from 'typedoc/dist/lib/output/plugins';
import { ReflectionKind } from 'typedoc/dist/lib/models';
import { Options } from 'typedoc/dist/lib/utils/options';
import { DiscoverEvent } from 'typedoc/dist/lib/utils/options/options';
import { FileOperations } from '../utils/file-operations';
import { JSONObjectKind } from '../utils/enums/json-obj-kind';
import { UtilsFunc } from '../utils/helper-utils';

const MAIN_DIR = 'exports';

@Component({ name: 'render-component'})
export class RenderComponenet extends RendererComponent {
    fileOperations: FileOperations;
    data: JSON;

    public initialize() {
        this.listenTo(this.owner, {
            [RendererEvent.BEGIN]: this.onRenderBegin,
            [RendererEvent.END]: this.onRenderEnd,
        });
        
        this.fileOperations = new FileOperations(this.application.logger);
    }

    private onRenderBegin(event: RendererEvent) {        
        const reflections = event.project.reflections;
        this.runCommentReplacements(reflections);
    }

    private runCommentReplacements(reflections) {
        const keys = Object.keys(reflections);
        keys.forEach(key => {
            const reflection = reflections[key];
            this.processTheReflection(reflection);
        });
    }

    private processTheReflection(reflection) {
        switch(reflection.kind) {
            case ReflectionKind.Class:
            case ReflectionKind.Enum:
            case ReflectionKind.Interface:
                const filePath = reflection.sources[0].fileName;
                const parsePath = path.parse(filePath);
                const processedDir = `${MAIN_DIR}\\${this.fileOperations.getProcessedDir(parsePath)}`;
                this.data = this.fileOperations.getFileJSONData(processedDir, reflection.name);
                if (this.data) {
                    this.updateComment(reflection, this.data[reflection.name]);
                }
                break;
            case ReflectionKind.Property:
            case ReflectionKind.CallSignature:
            case ReflectionKind.EnumMember:
                    const parent = UtilsFunc.getParentBasedOnType(reflection, reflection.kind);
                    const parentName = parent.name;
                    const attributeName = reflection.name;
                    const attributeData = this.getAttributeData(parentName, JSONObjectKind[reflection.kind], attributeName);
                    if(attributeData) {
                        this.updateComment(reflection, attributeData);
                    }
                break;
            case ReflectionKind.GetSignature:
            case ReflectionKind.SetSignature:
                    const accessorParent = UtilsFunc.getParentBasedOnType(reflection, reflection.kind);
                    const accessor = reflection.parent;
                    const accessorSignature = reflection.kind;
                    const data = this.getAccessorAttributeData(accessorParent.name, JSONObjectKind[accessor.kind], accessor.name, JSONObjectKind[accessorSignature]);
                    if (data) {
                        this.updateComment(reflection, data);
                    }
                break;
            default:
                return;
        }
    }

    private getAttribute(parentName, attribute) {
        if (this.data && this.data[parentName]) {
            return this.data[parentName][attribute];
        }
    }

    private getAttributeData(parentName, attribute, attributeName) {
        const data = this.getAttribute(parentName, attribute);
        if (data) {
            return data[attributeName];
        }
    }

    private getAccessorAttributeData(parentName, attribute, attributeName, accessorType) {
        const data = this.getAttributeData(parentName, attribute, attributeName);
        if (data) {
            return data[accessorType];
        }
    }

    private updateComment(reflection, dataObj) {
        if (!reflection.comment || !dataObj['comment']) {
            return;
        }

        if(reflection.comment.text) {
            reflection.comment.text = dataObj['comment'].text;
        }

        if(reflection.comment.shortText) {
            reflection.comment.shortText = dataObj['comment'].shortText;
        }
    }

    private onRenderEnd(event: RendererEvent) {
        // console.log(event);
    }

}