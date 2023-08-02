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

    public static getProjectDir(): string {
        const projectPath = this.pathNormalize(app.project.path);
        return projectPath.substring(0, projectPath.lastIndexOf("/") + 1);
    }

    public static projectRelativePath(path: string): string {
        return this.pathNormalize(this.getProjectDir() + path);
    }
}
