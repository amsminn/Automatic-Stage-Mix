export interface TransitionParams {
    video1: ProjectItem;
    video2: ProjectItem;

    video1Offset: number;
    video2Offset: number;

    transitionIn: number;
    transitionOut: number;
    transitionPoint: number;
}

export class TransitionMaker {
    public constructor() { /* block constructor */ }

    public static makeTransition(params: TransitionParams): void {
        const {
            video1,
            video2,

            video1Offset,
            video2Offset,

            transitionIn,
            transitionOut,
            transitionPoint
        } = params;

        // find empty video track in range
        const videoTracks = app.project.activeSequence.videoTracks;
        let insertVideoTrack: Track | null = null;
        let insertVideoTrackIndex = -1;

        for (let i = 0; i < videoTracks.numTracks; i++) {
            const track = videoTracks[i];

            const clips = track.clips;
            let hasClipInRange = false;
            for (let j = 0; j < clips.numItems; j++) {
                const clip = clips[j];

                if (
                    (clip.start.seconds <= transitionIn && transitionIn < clip.end.seconds) ||
                    (clip.start.seconds <= transitionOut && transitionOut < clip.end.seconds)
                ) {
                    hasClipInRange = true;
                    break;
                }
            }

            if (!hasClipInRange) {
                insertVideoTrack = track;
                insertVideoTrackIndex = i;
                break;
            }
        }

        const qeProject = qe.project;
        const qeSequence = qe.project.getActiveSequence();

        if (insertVideoTrack === null) {
            qeSequence.addTracks(
                1, // video track num
                videoTracks.numTracks, // after witch video track add them
                0 // audio track num
            );
            insertVideoTrack = videoTracks[videoTracks.numTracks - 1];
            insertVideoTrackIndex = videoTracks.numTracks - 1;
        }

        // insert video1
        const video1StartTime = new Time();
        video1StartTime.seconds = transitionIn - video1Offset;
        const video1EndTime = new Time();
        video1EndTime.seconds = transitionPoint - video1Offset;
        const trimedVideo1 = video1.createSubClip(
            `${video1.name}_trimed_${video1StartTime.ticks}_${video1EndTime.ticks}`,
            video1StartTime.ticks as any, // startTime
            video1EndTime.ticks as any, // endTime
            0, // hasHardBoundaries
            1, // takeVideo
            0 // takeAudio
        );
        insertVideoTrack.overwriteClip(
            trimedVideo1,
            transitionIn
        );

        // insert video2
        const video2StartTime = new Time();
        video2StartTime.seconds = transitionPoint - video2Offset;
        const video2EndTime = new Time();
        video2EndTime.seconds = transitionOut - video2Offset;
        const trimedVideo2 = video2.createSubClip(
            `${video2.name}_trimed_${video2StartTime.ticks}_${video2EndTime.ticks}`,
            video2StartTime.ticks as any, // startTime
            video2EndTime.ticks as any, // endTime
            0, // hasHardBoundaries
            1, // takeVideo
            0 // takeAudio
        );
        insertVideoTrack.overwriteClip(
            trimedVideo2,
            transitionPoint
        );

        // insert transition
        const qeTrack = qeSequence.getVideoTrackAt(insertVideoTrackIndex);

        let addedQeClip: any;
        for (let i = 0; i < qeTrack.numItems; i++) {
            const qeClip = qeTrack.getItemAt(i);
            if (Math.abs(qeClip.start.secs - transitionIn) < 0.05) {
                addedQeClip = qeClip;
                break;
            }
        }

        const videoFrameRate = app.project.activeSequence.getSettings().videoFrameRate;

        const transitionDuration = new Time();
        transitionDuration.seconds = transitionOut - transitionIn;
        addedQeClip.addTransition(
            qeProject.getVideoTransitionByName("Cross Dissolve"),
            false,
            transitionDuration.getFormatted(videoFrameRate, 104/*TIMEDISPLAY_30Timecode*/)
        );
    }
}
