import { ReflectionKind } from "typedoc/dist/lib/models";

export class UtilsFunc {
    public static getParentBasedOnType(reflection, kind) {
        if (kind === ReflectionKind.CallSignature || 
            kind === ReflectionKind.GetSignature || 
            kind === ReflectionKind.SetSignature) {
                return reflection.parent.parent;
        }

        return reflection.parent;
    }
}