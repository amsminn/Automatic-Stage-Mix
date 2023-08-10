import fsextra from "fs-extra";

const appData = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");

console.log(appData);

const cilentSrc = "./client";
const csxsSrc = "./CSXS";
const hostSrc = "./host";
const installSrc = appData + "/Adobe/CEP/extensions/automatic-stage-mix";

fsextra.copySync(cilentSrc, installSrc + "/client");
fsextra.copySync(csxsSrc, installSrc + "/CSXS");
fsextra.copySync(hostSrc, installSrc + "/host");
