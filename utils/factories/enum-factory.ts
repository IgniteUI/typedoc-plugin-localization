import { Factory } from "./factory";
import { AttributeType } from "../enums/json-obj-kind";

const ENUM_MEMBER_KEY = AttributeType[AttributeType.members];

export class JsonObjectEnumFactory extends Factory {
    
    constructor(name: string) {
        super(name);
    }
    
    public buildObjectStructure(data) {
        super.buildObjectStructure(data);
        
        this.fileClassContent[this.name][ENUM_MEMBER_KEY] = {};
    }
    
    public appendAttribute(kind, parentName, attributeName, data) {
        if (!data) {
            return;
        }        
        
        const attributeKind = AttributeType[kind];
        this.fileClassContent[parentName][attributeKind][attributeName] = data;
    }
    
    public isEmpty() {
        return !Object.keys(this.fileClassContent[this.name][ENUM_MEMBER_KEY]).length;
    }
    
    public appendAccessorAttributes(parentName: any, kind: any, accessorName: any, accessorType: any, data: any) { };
}