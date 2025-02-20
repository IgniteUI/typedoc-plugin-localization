import { GlobalFuncs } from '../global-funcs.js';
import { HardcodedStrings } from '../template-strings.js';

/**
 * Helper function which loclize the hardcoded template strings.
 * @param options 
 */
export function localize(value: string) {
    return GlobalFuncs.getKeyValuePairVal(
        HardcodedStrings.getTemplateStrings(), 
        HardcodedStrings.getLocal(), 
        value);
}