import { Logger } from 'typedoc/dist/lib/utils/loggers';

export abstract class Factory {
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

    public abstract appendAttribute(kind, parentName, attributeName, data);

    public abstract appendAccessorsAttribute(kind, parentName, accessorType, accessorName, data);

    public abstract isEmpty();

    public getFileClassContent() {
        return this.fileClassContent;
    }
}