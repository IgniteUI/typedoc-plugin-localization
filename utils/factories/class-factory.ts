import { BaseFactory } from './base-factory';
import { AttributeType } from '../enums/json-obj-kind';

const PROPERTIES_KEY = AttributeType[AttributeType.properties];
const METHODS_KEY = AttributeType[AttributeType.methods];
const ACCESSORS_KEY = AttributeType[AttributeType.accessors];

export class ClassFactory extends BaseFactory {

    constructor(name: string) {
        super(name);
    }

    public buildObjectStructure(data) {
        super.buildObjectStructure(data);

        this.fileClassContent[this.name][PROPERTIES_KEY] = {};
        this.fileClassContent[this.name][METHODS_KEY] = {};
        this.fileClassContent[this.name][ACCESSORS_KEY] = {};
    }

    public appendAccessorAttributes(parentName, kind, accessorName, accessorType, data) {
        if(!data) {
            return;
        }

        const attributeKind = AttributeType[kind];
        const accesorTypeAsString = AttributeType[accessorType];
        const isAccessorExists = this.fileClassContent[parentName][attributeKind][accessorName];
        if (!isAccessorExists) {
            this.fileClassContent[parentName][attributeKind][accessorName] = {};
        }

        const ifExist = this.fileClassContent[parentName][attributeKind][accessorName][accesorTypeAsString];
        if (ifExist) {
            this.fileClassContent[parentName][attributeKind][accessorName][accesorTypeAsString] = 
                Object.assign(data, this.fileClassContent[parentName][attributeKind][accessorName][accesorTypeAsString]);
        } else {
            this.fileClassContent[parentName][attributeKind][accessorName][accesorTypeAsString] = data;
        }
    }

    public isEmpty() {
        return super.isEmpty() && 
            !Object.keys(this.fileClassContent[this.name][PROPERTIES_KEY]).length &&
            !Object.keys(this.fileClassContent[this.name][METHODS_KEY]).length &&
            !Object.keys(this.fileClassContent[this.name][ACCESSORS_KEY]).length;
    }
}