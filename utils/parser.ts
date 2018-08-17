export class Parser {
    public splitByCharacter(text, char) {
        return text.split(char);
    }

    public joinByCharacter(array, char) {
        return array.join(char);
    }
}