import { PathUtil } from "./utils";

function createPythonExcutionScript(scriptPath: string, args: string[], pingServerPort: string): string {
    const scriptDir = PathUtil.pathNormalize(scriptPath.substring(0, scriptPath.lastIndexOf("/") + 1));

    let executionCommand = `python "${scriptPath}"`;
    for (const arg of args) executionCommand += ` "${arg}"`;

    return /* python */`
import sys
import socket
import subprocess

def ping(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(("localhost", port))
            s.close()
    except ConnectionRefusedError:
        return False
    
    return True

if __name__ == "__main__":
    if (ping(int(${pingServerPort}))):
        sys.exit(0)
    else:
        subprocess.Popen('''${executionCommand}''', cwd="${scriptDir}")
`;
}

export class PythonRunner {
    public static run(scriptPath: string, args: string[] = []): void {
        const pythonExcutionScriptFilePath = PathUtil.projectRelativePath("pythonExcutionScript.py");
        const pythonExcutionScriptFile = new File(pythonExcutionScriptFilePath);
        if (pythonExcutionScriptFile.open("w")) {
            pythonExcutionScriptFile.encoding = "UTF-8";
            pythonExcutionScriptFile.write(createPythonExcutionScript(scriptPath, args, args[0]));
            pythonExcutionScriptFile.close();
        }

        let shellScriptFile: File;

        let content = "";
        if ($.os.toLowerCase().indexOf("windows") === -1) {
            shellScriptFile = new File(PathUtil.projectRelativePath("pythonRunner.sh"));

            content += "#!/bin/bash\n";
        } else {
            shellScriptFile = new File(PathUtil.projectRelativePath("pythonRunner.bat"));
        }

        if (shellScriptFile.open("w")) {
            shellScriptFile.encoding = "UTF-8";

            content += `python "${pythonExcutionScriptFilePath}\n`;
            shellScriptFile.write(content);
            shellScriptFile.close();
        }

        shellScriptFile.execute();
    }
}
