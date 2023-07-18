import { PathUtil } from "./utils";

const projectPath = PathUtil.pathNormalize(app.project.path);
const projectDir = projectPath.substring(0, projectPath.lastIndexOf("/") + 1);

const filePath = projectDir + "test.txt";
const file = new File(filePath);
$.bp();
alert(file.read(3));
