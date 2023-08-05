import type { VideoSelectionParams } from "./paramWriter";
import { TransitionMaker } from "./transitionMaker";
// import { PythonRunner } from "./pythonRunner";
// import { ResultWatcher } from "./resultWatcher";
// import { PathUtil } from "./utils";

function main(): void {
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

    const trackItem1 = videoSelections[0];
    const trackItem2 = videoSelections[1];

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

    // new ParamWriter("params.txt").write(params);
    // PythonRunner.run(
    //     PathUtil.projectRelativePath("../src/fileIpcTest.py"),
    //     [
    //         "29381", // ping server port
    //         PathUtil.projectRelativePath("params.txt"),
    //         PathUtil.projectRelativePath("result.txt")
    //     ]
    // );
    // const result = new ResultWatcher("result.txt").wait();

    // alert(result);

    $.writeln(`
video1: ${trackItem1.name}
video1TrimIn: ${trackItem1.start.seconds}
video1TrimOut: ${trackItem1.end.seconds}

video1ClipIn: ${trackItem1.inPoint.seconds}
video1ClipOut: ${trackItem1.outPoint.seconds}

video1Offset: ${video1Offset}


video2: ${trackItem2.name}
video2TrimIn: ${trackItem2.start.seconds}
video2TrimOut: ${trackItem2.end.seconds}

video2ClipIn: ${trackItem2.inPoint.seconds}
video2ClipOut: ${trackItem2.outPoint.seconds}

video2Offset: ${video2Offset}

sequenceTransitionIn: ${sequenceTransitionIn}
sequenceTransitionOut: ${sequenceTransitionOut}
    `);

    TransitionMaker.makeTransition({
        video1: trackItem1.projectItem,
        video2: trackItem2.projectItem,

        video1Offset: video1Offset,
        video2Offset: video2Offset,

        transitionIn: sequenceTransitionIn,
        transitionOut: sequenceTransitionOut,
        transitionPoint: (sequenceTransitionIn + sequenceTransitionOut) / 2 // transitionPoint
    });
}

main();
