import * as process from 'process';
import * as fs from 'fs-extra';
import { Constants } from '../constants';

export function localize(str) {
    const value = getLocalizedValue(str);
    if (value) {
        return value;
    }

    return str;
}

function getLocalizedValue(str) {
    const local = getOptionValue(Constants.LOCALIZE_OPTION);
    const jsonFilePath = getOptionValue(Constants.TEMPLATE_STRINGS_OPTION);
    const fileContent = fs.readJsonSync(jsonFilePath);

    if (fileContent && fileContent[local]) {
        return fileContent[local][str];
    }
    
    return str;
}

function getOptionValue(key) {
    const indx = process.argv.findIndex((e) => e === `--${key}`);
    if (indx >= process.argv.length - 1) {
        return;
    }

    return process.argv[indx + 1];
}