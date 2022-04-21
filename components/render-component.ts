import * as path from 'path';

import { ReflectionKind, RendererEvent, LogLevel, Application } from 'typedoc';
import { FileOperations } from '../utils/file-operations';
import { AttributeType } from '../utils/enums/json-keys';
import { Constants } from '../utils/constants';
import { Parser } from '../utils/parser';

export class RenderComponenet {
    private warns: boolean;

    fileOperations: FileOperations;
    /**
     * Contains data per every processed Object like (Class, Inteface, Enum) 
     */
    data: JSON;
    /**
     * Main process dir.
     */
    mainDirOfJsons: string;
    /**
     * JSON data for all global funcs definitions.
     */
    globalFuncsData;
    /**
     * String parser
     */
    parser: Parser;

    public application

    public constructor(application: Application) {
        this.application = application;
        this.initialize();
    }

    public initialize() {
        this.application.renderer.on(RendererEvent.BEGIN,this.onRenderBegin.bind(this));
        
        this.fileOperations = new FileOperations(this.application.logger);
        this.parser = new Parser();
    }

    private onRenderBegin(event) {
        event.project.localization = this.application.options.getValue("localize");

        const reflections = event.project.reflections;
        const options = this.application.options.getRawValues();
        const localizeOpt = options[Constants.RENDER_OPTION];
        this.warns = options[Constants.WARNS];
        if (localizeOpt) {
            this.mainDirOfJsons = localizeOpt;
            this.globalFuncsData = this.fileOperations.getFileData(this.mainDirOfJsons, Constants.GLOBAL_FUNCS_FILE_NAME, 'json');
            this.runCommentReplacements(reflections);
        }
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
                    let processedDir = this.mainDirOfJsons;
                    const parsedPath = this.fileOperations.getFileDir(filePath);
                    if (parsedPath) {
                        processedDir = path.join(processedDir, parsedPath);
                    }
                    this.data = this.fileOperations.getFileData(processedDir, reflection.name, 'json');
                    if (this.data) {
                        this.updateComment(reflection, this.data[reflection.name]);
                    }
                break;
            case ReflectionKind.Property:
            case ReflectionKind.CallSignature:
            case ReflectionKind.EnumMember:
                   /**
                     * Skip reflections with type @ReflectionKind.Function because they are aslo @ReflectionKInd.CallSignature
                     * but the handling process here is not appropriate for them.
                     */
                    if (reflection.parent === ReflectionKind.Function) {
                        break;
                    }

                    const parent = this.getParentBasedOnType(reflection, reflection.kind);
                    const parentName = parent.name;
                    const attributeName = reflection.name;
                    const attributeData = this.getAttributeData(parentName, AttributeType[reflection.kind], attributeName);
                    if(attributeData) {
                        this.updateComment(reflection, attributeData);
                    }
                break;
            case ReflectionKind.Function:
                    if (!this.globalFuncsData) {
                        break;
                    }
                    const funcName = reflection.name;
                    const funcData = this.globalFuncsData[funcName];
                    this.updateComment(reflection.signatures[0], funcData);
                break;
            case ReflectionKind.GetSignature:
            case ReflectionKind.SetSignature:
                    const accessorParent = this.getParentBasedOnType(reflection, reflection.kind);
                    const accessor = reflection.parent;
                    const accessorSignature = reflection.kind;
                    const data = this.getAccessorAttributeData(accessorParent.name, AttributeType[accessor.kind], accessor.name, AttributeType[accessorSignature]);
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
      if (!reflection.comment || (dataObj && !dataObj[Constants.COMMENT])) {
          return;
      }

      let parsed;
      if (reflection.comment.text) {
          parsed = this.parser.joinByCharacter(dataObj[Constants.COMMENT][Constants.TEXT], '\n');
          reflection.comment.text = parsed;
      }

      if (reflection.comment.shortText) {
          parsed = this.parser.joinByCharacter(dataObj[Constants.COMMENT][Constants.SHORT_TEXT], '\n');
          reflection.comment.shortText = parsed;
      }

      if (reflection.comment.returns) {
          parsed = this.parser.joinByCharacter(dataObj[Constants.COMMENT][Constants.RETURNS], '\n');
          reflection.comment.returns = parsed;
      }

      if (reflection.comment.tags && dataObj[Constants.COMMENT][Constants.TAGS]) {
        reflection.comment.tags.forEach(tag => {
          const tagFromJson = dataObj[Constants.COMMENT][Constants.TAGS][tag.tagName];
          try {
            tag.tagName = tagFromJson[Constants.COMMENT].tagName;
            tag.text = this.parser.joinByCharacter(tagFromJson[Constants.COMMENT].text, '\n');
          } catch (e) {
            if (this.warns) {
              this.application.logger.log(`Could not find ${tag.tagName} tag of ${reflection.parent.name} in ${reflection.parent.parent.name}`, LogLevel.Warn);
            }
          }
        });
      }
          
      if (reflection.parameters && dataObj[Constants.COMMENT][Constants.PARAMS]) {
        reflection.parameters.forEach(param => {
          const paramFromJson = dataObj[Constants.COMMENT][Constants.PARAMS][param.name];
          try {
            param.comment.text = this.parser.joinByCharacter(paramFromJson[Constants.COMMENT].text, '\n');
          } catch(e) {
            if (this.warns) {
              this.application.logger.log(`Could not find ${param.name} parameter of ${reflection.parent.name} in ${reflection.parent.parent.name}`, LogLevel.Warn);
            }
          }
        });
      }
    }

    /**
     * Returns the parent(Class, Interface, Enum) per every Method, Property, Getter, Setter etc.
     * @param reflection 
     * @param kind 
     */
    private getParentBasedOnType(reflection, kind) {
        if (kind === ReflectionKind.CallSignature || 
            kind === ReflectionKind.GetSignature || 
            kind === ReflectionKind.SetSignature) {
                return reflection.parent.parent;
        }

        return reflection.parent;
    }
}