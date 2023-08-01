// import { PathUtil } from "./utils";

// const projectPath = PathUtil.pathNormalize(app.project.path);
// const projectDir = projectPath.substring(0, projectPath.lastIndexOf("/") + 1);

// const filePath = projectDir + "test.txt";
// const file = new File(filePath);
// if (!file.open("r")) {
//     alert("file not found");
// }
// alert(file.read());


const project = app.project;
const currentSequence = project.activeSequence;
const selections = currentSequence.getSelection();
$.bp();
alert(selections.length);
