import { AttributeType } from "../enums/json-obj-kind";

export abstract class BaseFactory {
    public name;
    protected fileClassContent;

    constructor(name) {
        this.name = name;
        this.fileClassContent = {};
    }

    public buildObjectStructure(data) {
        if (!this.fileClassContent[this.name]) {
            this.fileClassContent[this.name] = {};
        }

        if (data) {
            this.fileClassContent[this.name] = data;
        }
    }
    
    public appendAttribute(parentName, kind, attributeName, data) {
        if (!data) {
            return;
        }        
        
        const attributeKind = AttributeType[kind];
        this.fileClassContent[parentName][attributeKind][attributeName] = data;
    }

    
    public abstract appendAccessorAttributes(parentName, kind, accessorName, accessorType, data);

    public isEmpty() {
        return !this.fileClassContent[this.name]['comment'];
    }

    public getJsonContent() {
        return this.fileClassContent;
    }
}