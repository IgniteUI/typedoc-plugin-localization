import { ReflectionKind } from "typedoc/dist/lib/models";

export class UtilsFunc {
    public static getParentBasedOnType(reflection, kind) {
        if (kind === ReflectionKind.CallSignature) {
            return reflection.parent.parent;
        }

        return reflection.parent;
    }
}