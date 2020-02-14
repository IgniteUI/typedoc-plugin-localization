import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from 'typedoc/dist/lib/utils/loggers';

export class FileOperations {

    private projPath;

    public logger;

    constructor(logger: Logger, projPath: string) {
        this.logger = logger;
        this.projPath = projPath;
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

    public getProcessedDir(filePath: string) {
        // if (!filePath) {
        //     return;
        // }

        filePath = filePath.toLocaleLowerCase().includes(this.projPath) ? 
          filePath.substring(this.projPath.length + 1, filePath.length) : filePath;

        const parsedPath = path.parse(filePath);
        const splitPath = parsedPath.dir.split(path.sep);
        const fileStructureDir = splitPath[0];
        const componentDir = splitPath[1];
        if (fileStructureDir === "" && componentDir === undefined || parsedPath.root) {
            return null;
        } else if (fileStructureDir && componentDir === undefined) {
            return fileStructureDir;
        }

        return path.join(fileStructureDir, componentDir);
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
        const processedPath = filePath ? this.getProcessedDir(path.normalize(filePath)) : filePath;
        let filePathBuilder = mainDir;
        if (processedPath) {
            filePathBuilder = path.join(filePathBuilder, processedPath);
        }

        return filePathBuilder;
    }
}