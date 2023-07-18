import rollupPluginTypescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";
import eslint from "@rollup/plugin-eslint";

export default {
    input: "src/index.ts",
    output: {
        file: "dist/index.js",
        format: "esm"
    },
    plugins: [
        rollupPluginTypescript(),
        alias({
            entries: [{ find: "@", replacement: "./src" }]
        }),
        eslint({
            include: ["src/**/*.ts"],
            fix: true
        })
    ]
};
