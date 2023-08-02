import { PathUtil } from "./utils";

export interface VideoSelectionParams {
    video1Path: string;
    video2Path: string;

    video1Offset: number;
    video2Offset: number;

    transitionIn: number;
    transitionOut: number;
}

export class ParamWriter {
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

    public write(params: VideoSelectionParams): void {
        if (!this._file.open("w")) {
            throw new Error("open file failed");
        }

        let text = "";
        text += `video1Path = ${params.video1Path}\n`;
        text += `video2Path = ${params.video2Path}\n`;
        text += `video1Offset = ${params.video1Offset}\n`;
        text += `video2Offset = ${params.video2Offset}\n`;
        text += `transitionIn = ${params.transitionIn}\n`;
        text += `transitionOut = ${params.transitionOut}\n`;
        this._file.encoding = "UTF-8";
        this._file.write(text);

        this._file.close();
    }
}

// if (!file.open("r")) {
//     alert("file not found");
// }
// alert(file.read());
