import { BaseFactory } from "./base-factory";
import { AttributeType } from "../enums/json-obj-kind";

const PROPERTIES_KEY = AttributeType[AttributeType.properties];
const METHODS_KEY = AttributeType[AttributeType.methods];

export class InterfaceFactory extends BaseFactory {
    constructor(name) {
        super(name);
    }
    
    public buildObjectStructure(data) {
        super.buildObjectStructure(data);
        
        this.fileClassContent[this.name][PROPERTIES_KEY] = {};
        this.fileClassContent[this.name][METHODS_KEY] = {}
    }

    public appendAccessorAttributes(parentName: any, kind: any, accessorName: any, accessorType: any, data: any) { }

    public isEmpty() {
        return !this.fileClassContent[this.name]['comment'] &&
            !Object.keys(this.fileClassContent[this.name][PROPERTIES_KEY]).length &&
            !Object.keys(this.fileClassContent[this.name][METHODS_KEY]).length;
    }
}