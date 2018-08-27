import { BaseFactory } from "./base-factory";

export class FunctionFactory extends BaseFactory {
    
    constructor(name: string) {
        super(name);
    }
    
    public appendAttribute(parentName: any, kind: any, attributeName: any, data: any) { }

    public appendAccessorAttributes(parentName: any, kind: any, accessorName: any, accessorType: any, data: any) { }
    
    public isEmpty() {
        return !this.fileClassContent[this.name]['comment']
    }
}