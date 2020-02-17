import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from 'typedoc/dist/lib/utils/loggers';

export class FileOperations {
    public logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public createDir(dirName: string): boolean {
        try {
            fs.mkdirpSync(dirName);
        } catch(err) {
            this.logger.error(err);
            return false;
        }

        return true;
    }

    public ifDirectoryExists(dirName) {
        if (fs.existsSync(dirName)) {
            if(!fs.statSync(dirName).isDirectory()) {
                this.logger.error(`The output target exists ${dirName} but it is not a directory!`)
                return false;
            }

            return true;
        }

        return false;
    }

    public ifFileExists(filePath) {
        if(fs.existsSync(filePath)) {
            if (!fs.statSync(filePath).isFile()) {
                this.logger.error(`The ouput targets exists ${path} but it is not a file!`);
                return false;
            }
            return true;
        }

        return false;
    }

    public removeDirectoryOrFile(path) {
        try {
            fs.removeSync(path)
        } catch(err) {
            this.logger.warn(`Could not clear the directory or path: ${path}!`);
            return false;
        }

        return true;
    }

    public openFileSync(dirPath, fileName) {
        if (this.ifDirectoryExists(dirPath)) {
            const filePath = path.join(dirPath, fileName);
            return fs.openSync(filePath, 'w+');
        } 

        this.logger.error(`Direcotry with path: ${dirPath} does not exists!`);
        return null;
    }

    public closeFileSync(fileReference) {
        if(!!fileReference) {
            fs.closeSync(fileReference);
        } else {
            this.logger.error(`Invalid faile reference: ${fileReference}`);
        }
    }

    public prepareOutputDirectory(mainDir, fileObjects) {
        fileObjects.forEach(element => {
            const dirToExport = this.constructFilePath(mainDir, element.fileName);
            if (!dirToExport) {
                return;
            }
            if(!this.ifDirectoryExists(dirToExport)) {
                this.createDir(dirToExport);
            }
        });
    }

    public getFileDir(filePath: string) {
        const parsedPath = path.parse(filePath);
        return parsedPath.dir;
    }

    public appendFileData(mainDir, filePath, fileName, extension, data) {
        let path = this.constructFilePath(mainDir, filePath);

        const currentFileFd = this.openFileSync(path, `${fileName}.${extension}`);
        fs.writeSync(currentFileFd, JSON.stringify(data, null, 4), null, 'utf8');
        this.closeFileSync(currentFileFd);
    }

    public createFile(mainDir, filePath,  fileName, fileExtension) {
        let constructedFilePath = this.constructFilePath(mainDir, filePath);

        const file = path.join(constructedFilePath, `${fileName}.${fileExtension}`);
        if(!this.ifFileExists(file)) {
            fs.createFileSync(file);
        }
    }

    public getFileData(filePath, fileName, fileExtension) {
        const jsonFilePath = path.join(filePath, `${fileName}.${fileExtension}`);
        if (!this.ifDirectoryExists(filePath) || !this.ifFileExists(jsonFilePath)) {
            return null;
        }
        
        return fs.readJsonSync(jsonFilePath);
    }

    private constructFilePath(mainDir, filePath: string) {
        const processedPath = filePath ? path.normalize(filePath).toString() : filePath;
        let filePathBuilder = mainDir;
        if (processedPath) {
            filePathBuilder = path.join(filePathBuilder, processedPath);
        }

        return filePathBuilder;
    }
}