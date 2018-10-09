import { AttributeType } from "../enums/json-keys";
import { BaseFactory } from "./base-factory";

const ENUM_MEMBER_KEY = AttributeType[AttributeType.members];

export class EnumFactory extends BaseFactory {
    
    constructor(name: string) {
        super(name);
    }
    
    public buildObjectStructure(data) {
        super.buildObjectStructure(data);
        
        this.fileClassContent[this.name][ENUM_MEMBER_KEY] = {};
    }
    
    public isEmpty() {
        return super.isEmpty() &&
        !Object.keys(this.fileClassContent[this.name][ENUM_MEMBER_KEY]).length;
    }    
    
    public appendAccessorAttributes(parentName: any, kind: any, accessorName: any, accessorType: any, data: any) { }
}