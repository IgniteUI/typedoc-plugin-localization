import { GlobalFuncs } from '../global-funcs';
import { HardcodedStrings } from '../template-strings';

/**
 * Helper function which loclize the hardcoded template strings.
 * @param options 
 */
export function localize(options: any) {
    const value = options.fn(this).trim();    
    return GlobalFuncs.getKeyValuePairRes(
        HardcodedStrings.getTemplateStrings(), 
        HardcodedStrings.getLocal(), 
        value);
}