import { Logger } from 'typedoc/dist/lib/utils/loggers';
import { Factory } from './factory';
import { AttributeType } from '../enums/json-obj-kind';

const PROPERTIES_KEY = AttributeType[AttributeType.properties];
const METHODS_KEY = AttributeType[AttributeType.methods];
const ACCESSORS_KEY = AttributeType[AttributeType.accessors];
const FUNCTIONS_KEY = AttributeType[AttributeType.functions]

export class JsonObjectFactory extends Factory {

    constructor(name: string) {
        super(name);
    }

    public buildObjectStructure(data) {
        super.buildObjectStructure(data);

        this.fileClassContent[this.name][PROPERTIES_KEY] = {};
        this.fileClassContent[this.name][METHODS_KEY] = {};
        this.fileClassContent[this.name][ACCESSORS_KEY] = {};
        this.fileClassContent[this.name][FUNCTIONS_KEY] = {};
    }

    public appendAttribute(kind, parentName, attributeName, data) {
        if(!data) {
            return;
        }

        const attributeKind = AttributeType[kind];
        this.fileClassContent[parentName][attributeKind][attributeName] = data;
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

        this.fileClassContent[parentName][attributeKind][accessorName][accesorTypeAsString] = data;
    }

    public isEmpty() {
        return !this.fileClassContent[this.name]['comment'] && 
            !Object.keys(this.fileClassContent[this.name][PROPERTIES_KEY]).length &&
            !Object.keys(this.fileClassContent[this.name][METHODS_KEY]).length &&
            !Object.keys(this.fileClassContent[this.name][ACCESSORS_KEY]).length &&
            !Object.keys(this.fileClassContent[this.name][FUNCTIONS_KEY]).length;
    }
}