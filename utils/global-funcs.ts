export class GlobalFuncs {
    public static getOptionValue(options, key) {
        const indx = options.findIndex((e) => e === `--${key}`);
        if (indx >= options.length - 1 || indx < 0) {
            return;
        }
    
        return options[indx + 1];
    }

    public static getKeyValuePairRes(data, key, value) {
        if (!data) {
            return value;
        }

        if (!data[key]) {
            return value;
        }
        
        const res = data[key][value];
        return res ? res : value;
    }   
}