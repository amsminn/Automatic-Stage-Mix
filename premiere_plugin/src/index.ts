import { ParamWriter, type VideoSelectionParams } from "./paramWriter";
import { PythonRunner } from "./pythonRunner";
import { ResultWatcher } from "./resultWatcher";
import { TransitionMaker } from "./transitionMaker";
import { PathUtil } from "./utils";

function main(): void {
    app.enableQE();

    const project = app.project;
    const currentSequence = project.activeSequence;
    const selections = currentSequence.getSelection();

    if (selections.length === 0) {
        alert("no selection");
        return;
    }

    const videoSelections = [];
    for (const selection of selections) {
        if (selection.mediaType === "Video") {
            videoSelections.push(selection);
        }
    }
    if (videoSelections.length !== 2) {
        alert("select 2 video");
        return;
    }

    let trackItem1 = videoSelections[0];
    let trackItem2 = videoSelections[1];
    if (trackItem1.start.seconds > trackItem2.start.seconds) {
        const tmp = trackItem1;
        trackItem1 = trackItem2;
        trackItem2 = tmp;
    }

    const sequenceTransitionIn = Math.max(trackItem1.start.seconds, trackItem2.start.seconds);
    const sequenceTransitionOut = Math.min(trackItem1.end.seconds, trackItem2.end.seconds);

    if (sequenceTransitionIn >= sequenceTransitionOut) {
        alert("no overlap between 2 video");
        return;
    }

    const video1Offset = trackItem1.start.seconds - trackItem1.inPoint.seconds;
    const video2Offset = trackItem2.start.seconds - trackItem2.inPoint.seconds;

    const params: VideoSelectionParams = {
        video1Path: trackItem1.projectItem.getMediaPath(),
        video2Path: trackItem2.projectItem.getMediaPath(),

        video1Offset: video1Offset,
        video2Offset: video2Offset,

        transitionIn: sequenceTransitionIn,
        transitionOut: sequenceTransitionOut
    };
    params;

    new ParamWriter("params.txt").write(params);
    PythonRunner.run(
        PathUtil.projectRelativePath("../src/fileIpcTest.py"),
        [
            "29381", // ping server port
            PathUtil.projectRelativePath("params.txt"),
            PathUtil.projectRelativePath("result.txt")
        ]
    );
    const result = new ResultWatcher("result.txt").wait();

    alert(result);

    TransitionMaker.makeTransition({
        video1: trackItem1.projectItem,
        video2: trackItem2.projectItem,

        video1Offset: video1Offset,
        video2Offset: video2Offset,

        transitionIn: sequenceTransitionIn,
        transitionOut: sequenceTransitionOut,
        transitionPoint: (sequenceTransitionIn + sequenceTransitionOut) / 2, // transitionPoint

        offsetTarget: "video1",
        positionOffsetX: 0.1,
        positionOffsetY: 0.1,
        scaleOffset: 0.8,
        rotationOffset: 3,

        sampledCurve: {
            x1: 0.2, y1: 0.1,
            x2: 0.0, y2: 0.7
        }
    });
}

main();
