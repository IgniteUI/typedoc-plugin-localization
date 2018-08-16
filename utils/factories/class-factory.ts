import { Logger } from 'typedoc/dist/lib/utils/loggers';
import { Factory } from './factory';
import { JSONObjectKind } from '../enums/json-obj-kind';

const PROPERTIES_KEY = JSONObjectKind[JSONObjectKind.properties];
const METHODS_KEY = JSONObjectKind[JSONObjectKind.methods];
const ACCESSORS_KEY = JSONObjectKind[JSONObjectKind.accessors];
const FUNCTIONS_KEY = JSONObjectKind[JSONObjectKind.functions]

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

        const attributeKind = JSONObjectKind[kind];
        this.fileClassContent[parentName][attributeKind][attributeName] = data;
    }

    public appendAccessorsAttribute(kind, parentName, accessorType, accessorName, data) {
        if(!data) {
            return;
        }

        const attributeKind = JSONObjectKind[kind];
        const accesorTypeAsString = JSONObjectKind[accessorType];
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