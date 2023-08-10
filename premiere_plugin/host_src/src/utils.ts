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
        const fsName = new File($.fileName).fsName;
        const scriptPath = this.pathNormalize(fsName);
        return scriptPath.substring(0, scriptPath.lastIndexOf("/") + 1);
    }

    public static scriptRelativePath(path: string): string {
        return this.pathNormalize(this.getScriptDir() + path);
    }
}
