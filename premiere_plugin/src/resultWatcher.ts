import { PathUtil } from "./utils";

export class ResultWatcher {
    private readonly _file: File;

    public constructor(fileName: string) {
        if (!File.isEncodingAvailable("UTF-8")) {
            throw new Error("UTF-8 is not available");
        }

        const filePath = PathUtil.projectRelativePath(fileName);
        this._file = new File(filePath);
        if (!(this._file instanceof File)) {
            throw new Error(`${filePath} is not a file`);
        }
    }

    public wait(): string {
        while (!this._file.open("r")) $.sleep(1000);

        const text = this._file.read();
        this._file.close();

        this._file.remove();
        return text;
    }
}
