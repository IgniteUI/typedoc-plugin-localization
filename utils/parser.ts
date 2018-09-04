import { isArray } from "util";

export class Parser {
    public splitByCharacter(text, char) {
        const res = this.removeEmptyStrings(text.split(char));
        if (res.length === 1) {
            return res[0]
        }

        return res;
    }

    public joinByCharacter(obj, char) {
        if (!isArray(obj)) {
            return obj;
        }

        return obj.join(char);
    }

    private removeEmptyStrings(splittedText) {
        return splittedText.filter(el => el !== "");
    }
}