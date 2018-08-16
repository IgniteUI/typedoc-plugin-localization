import { Factory } from "./factory";
import { JSONObjectKind } from "../enums/json-obj-kind";

const ENUM_MEMBER_KEY = JSONObjectKind[JSONObjectKind.members];

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
        
        const attributeKind = JSONObjectKind[kind];
        this.fileClassContent[parentName][attributeKind][attributeName] = data;
    }
    
    public isEmpty() {
        return !Object.keys(this.fileClassContent[this.name][ENUM_MEMBER_KEY]).length;
    }
    
    public appendAccessorsAttribute(kind: any, parentName: any, accessorType: any, accessorName: any, data: any) { };
}