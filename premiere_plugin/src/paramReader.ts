export class ParamReader {
    public static read(text: string): { [key: string]: string } {
        const lines = text.split("\n");
        const params: { [key: string]: string } = {};
        for (const line of lines) {
            const match = line.match(/^(.+) = (.+)$/);
            if (match) {
                params[match[1]] = match[2];
            }
        }
        return params;
    }
}
