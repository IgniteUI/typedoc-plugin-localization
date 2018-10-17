/**
 * Cache of all localized hardcoded template strings values.
 */
export class HardcodedStrings {
    private static local: string;
    private static templateStrings: string;

    public static setLocal(local: string) {
        if (this.local === undefined) {
            this.local = local;
        }
    }

    public static getLocal(): string {
        return this.local;
    }

    public static setTemplateStrings(templateStrings: string) {
        if (this.templateStrings === undefined) {
            this.templateStrings = templateStrings;
        }
    }

    public static getTemplateStrings(): string {
        return this.templateStrings;
    }
}