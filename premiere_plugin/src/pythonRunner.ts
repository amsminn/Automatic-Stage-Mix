import { PathUtil } from "./utils";

const pythonExcutionScript = /* python */`
import subprocess
import sys

def process_exists(process_name):
    call = 'TASKLIST', '/FI', 'imagename eq %s' % process_name
    output = subprocess.check_output(call).decode()
    last_line = output.strip().split('\r\n')[-1]
    return last_line.lower().startswith(process_name.lower())

if process_exists(sys.argv[1]):
    print("running")
else:
    print("not running")
`;

export class PythonRunner {
    public static run(scriptPath: string, args: string[] = []): void {
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

            const scriptDir = PathUtil.pathNormalize(scriptPath.substring(0, scriptPath.lastIndexOf("/") + 1));
            content += `cd "${scriptDir}"\n`;
            content += `python "${scriptPath}"`;
            for (const arg of args) content += ` "${arg}"`;

            shellScriptFile.write(content);
        }
        shellScriptFile.close();

        shellScriptFile.execute();
    }
}
