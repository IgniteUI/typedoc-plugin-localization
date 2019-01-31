export class GlobalFuncs {
    public static getCmdLineArgumentValue(options, key) {
        const indx = options.findIndex((e) => e === `--${key}`);
        if (indx >= options.length - 1 || indx < 0) {
            return;
        }
    
        return options[indx + 1];
    }

    public static getKeyValuePairVal(data, key, value) {
        if (!!data && !!data[key]) {
            const res = data[key][value];
            return res ? res : value;
        }
        
        return value;
    }   
}