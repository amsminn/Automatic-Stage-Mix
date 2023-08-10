var csInterface = new CSInterface();

var openButton = document.querySelector("#run-button");
openButton.addEventListener("click", runStageMix);

function runStageMix() {
    csInterface.evalScript("main()");
}
