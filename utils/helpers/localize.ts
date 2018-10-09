import * as process from 'process';
import * as fs from 'fs-extra';
import { Constants } from '../constants';
import { GlobalFuncs } from '../global-funcs';
import { HardcodedStrings } from '../template-strings';

export function localize(options: any) {
    const value = options.fn(this).trim();    
    return GlobalFuncs.getKeyValuePairRes(
        HardcodedStrings.getTemplateStrings(), 
        HardcodedStrings.getLocal(), 
        value);
}