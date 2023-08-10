import { ParamReader } from "./paramReader";
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

    new ParamWriter("params.txt").write(params);
    PythonRunner.run(
        PathUtil.projectRelativePath("fileIpcTest.py"),
        [
            "29381", // ping server port
            PathUtil.projectRelativePath("params.txt"),
            PathUtil.projectRelativePath("result.txt")
        ]
    );
    const result = new ResultWatcher("result.txt").wait();
    const resultParams = ParamReader.read(result);
    $.writeln(result);

    if (resultParams["flag"] === "False") {
        alert("can't make transition");
        return;
    }

    const rangeL = Number(resultParams["rangeL"]);
    const rangeR = Number(resultParams["rangeR"]);
    const transitionPoint = Number(resultParams["time"]);

    if (rangeL < sequenceTransitionIn || rangeR > sequenceTransitionOut) {
        alert("transition range is out of sequence");
        return;
    }

    const offsetTarget = resultParams["object"] === "a" ? "video1" : "video2";
    const positionOffsetX = Number(resultParams["vectorX"]);
    const positionOffsetY = Number(resultParams["vectorY"]);
    const scaleOffset = Number(resultParams["scale"]);
    const rotationOffset = Number(resultParams["counterclockwise_angle"]) * 180 / Math.PI;
    const anchorOffsetX = Number(resultParams["axisX"]);
    const anchorOffsetY = Number(resultParams["axisY"]);

    TransitionMaker.makeTransition({
        video1: trackItem1.projectItem,
        video2: trackItem2.projectItem,

        video1Offset: video1Offset,
        video2Offset: video2Offset,

        transitionIn: rangeL,
        transitionOut: rangeR,
        transitionPoint: transitionPoint,

        offsetTarget: offsetTarget,
        positionOffsetX: positionOffsetX,
        positionOffsetY: positionOffsetY,
        scaleOffset: scaleOffset,
        rotationOffset: rotationOffset,
        anchorOffsetX: anchorOffsetX,
        anchorOffsetY: anchorOffsetY,

        sampledCurve: {
            x1: 0.2, y1: 0.1,
            x2: 0.0, y2: 0.7
        }
    });
}

main;
