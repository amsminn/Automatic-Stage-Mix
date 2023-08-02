import { PathUtil } from "./utils";

export interface VideoSelectionParams {
    video1Offset: number;
    video2Offset: number;

    transitionIn: number;
    transitionOut: number;
}

export class ParamWriter {
    private readonly _file: File;

    public constructor(fileName: string) {
        const projectPath = PathUtil.pathNormalize(app.project.path);
        const projectDir = projectPath.substring(0, projectPath.lastIndexOf("/") + 1);
        
        const filePath = projectDir + fileName;
        this._file = new File(filePath);
        if (!(this._file instanceof File)) {
            throw new Error(`${filePath} is not a file`);
        }
    }

    public write(params: VideoSelectionParams): void {
        if (!this._file.open("w")) {
            alert("open file failed");
            return;
        }

        let text = "";
        text += `video1Offset: ${params.video1Offset}\n`;
        text += `video2Offset: ${params.video2Offset}\n`;
        text += `transitionIn: ${params.transitionIn}\n`;
        text += `transitionOut: ${params.transitionOut}\n`;
        this._file.write(text);

        this._file.close();
    }
}

// if (!file.open("r")) {
//     alert("file not found");
// }
// alert(file.read());
