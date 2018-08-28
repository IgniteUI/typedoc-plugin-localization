import { BaseFactory } from "./base-factory";

export class FunctionFactory extends BaseFactory {
    
    constructor(name: string) {
        super(name);
    }

    public appendAttribute(parentName, kind, attributeName, data) { }

    public appendAccessorAttributes(parentName: any, kind: any, accessorName: any, accessorType: any, data: any) { }
}