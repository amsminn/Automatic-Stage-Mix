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
}
