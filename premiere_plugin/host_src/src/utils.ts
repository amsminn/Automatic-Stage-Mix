export class PathUtil {
    public static pathNormalize(path: string): string {
        const stack = [];
        const parts = path.replace(/\\/g, "/").split("/");
        for (const part of parts) {
            if (part === "..") {
                stack.pop();
            } else if (part !== ".") {
                stack.push(part);
            }
        }
        return stack.join("/");
    }

    public static getScriptDir(): string {
        $.writeln($.fileName);
        const fsName = new File($.fileName);
        $.bp();
        const scriptPath = this.pathNormalize(fsName.fsName);
        return scriptPath.substring(0, scriptPath.lastIndexOf("/") + 1);
    }

    public static getProjectDir(): string {
        const projectPath = this.pathNormalize(app.project.path);
        return projectPath.substring(0, projectPath.lastIndexOf("/") + 1);
    }

    public static scriptRelativePath(path: string): string {
        return this.pathNormalize(this.getScriptDir() + path);
    }

    public static projectRelativePath(path: string): string {
        return this.pathNormalize(this.getProjectDir() + path);
    }
}
