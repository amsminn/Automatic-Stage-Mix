import { ParamWriter, type VideoSelectionParams } from "./paramWriter";

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

    const video1TrimIn = trackItem1.start.seconds;
    const video1TrimOut = trackItem1.end.seconds;

    const video2TrimIn = trackItem2.start.seconds;
    const video2TrimOut = trackItem2.end.seconds;

    const sequenceTransitionIn = Math.max(trackItem1.start.seconds, trackItem2.start.seconds);
    const sequenceTransitionOut = Math.min(trackItem1.end.seconds, trackItem2.end.seconds);

    const video1Offset = trackItem1.start.seconds - trackItem1.inPoint.seconds;
    const video2Offset = trackItem2.start.seconds - trackItem2.inPoint.seconds;

    const params = <VideoSelectionParams>{
        video1Offset: video1Offset,
        video2Offset: video2Offset,
        transitionIn: sequenceTransitionIn,
        transitionOut: sequenceTransitionOut
    };

    new ParamWriter("params.txt").write(params);

    alert(`
video1: ${trackItem1.name}
video1TrimIn: ${video1TrimIn}
video1TrimOut: ${video1TrimOut}

video1ClipIn: ${trackItem1.inPoint.seconds}
video1ClipOut: ${trackItem1.outPoint.seconds}

video1Offset: ${video1Offset}


video2: ${trackItem2.name}
video2TrimIn: ${video2TrimIn}
video2TrimOut: ${video2TrimOut}

video2ClipIn: ${trackItem2.inPoint.seconds}
video2ClipOut: ${trackItem2.outPoint.seconds}

video2Offset: ${video2Offset}

sequenceTransitionIn: ${sequenceTransitionIn}
sequenceTransitionOut: ${sequenceTransitionOut}
    `);
}

main();
