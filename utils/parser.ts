export class Parser {
    public splitByCharacter(text, char) {
        return this.removeEmptyStrings(text.split(char));
    }

    public joinByCharacter(array, char) {
        return this.removeEmptyStrings(array.join(char));
    }

    private removeEmptyStrings(splittedText) {
        return splittedText.filter(el => el !== "");
    }
}