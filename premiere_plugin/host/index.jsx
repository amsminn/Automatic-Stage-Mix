var ParamReader = /** @class */ (function () {
    function ParamReader() {
    }
    ParamReader.read = function (text) {
        var lines = text.split("\n");
        var params = {};
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var match = line.match(/^(.+) = (.+)$/);
            if (match) {
                params[match[1]] = match[2];
            }
        }
        return params;
    };
    return ParamReader;
}());

var PathUtil = /** @class */ (function () {
    function PathUtil() {
    }
    PathUtil.pathNormalize = function (path) {
        var stack = [];
        var parts = path.replace(/\\/g, "/").split("/");
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            if (part === "..") {
                stack.pop();
            }
            else if (part !== ".") {
                stack.push(part);
            }
        }
        return stack.join("/");
    };
    PathUtil.getScriptDir = function () {
        var scriptPath = this.pathNormalize($.fileName);
        return scriptPath.substring(0, scriptPath.lastIndexOf("/") + 1);
    };
    PathUtil.scriptRelativePath = function (path) {
        return this.pathNormalize(this.getScriptDir() + path);
    };
    return PathUtil;
}());

var ParamWriter = /** @class */ (function () {
    function ParamWriter(fileName) {
        if (!File.isEncodingAvailable("UTF-8")) {
            throw new Error("UTF-8 is not available");
        }
        var filePath = PathUtil.scriptRelativePath(fileName);
        this._file = new File(filePath);
        if (!(this._file instanceof File)) {
            throw new Error("".concat(filePath, " is not a file"));
        }
    }
    ParamWriter.prototype.write = function (params) {
        if (!this._file.open("w")) {
            throw new Error("open file failed");
        }
        var text = "";
        text += "video1Path = ".concat(params.video1Path, "\n");
        text += "video2Path = ".concat(params.video2Path, "\n");
        text += "video1Offset = ".concat(params.video1Offset, "\n");
        text += "video2Offset = ".concat(params.video2Offset, "\n");
        text += "transitionIn = ".concat(params.transitionIn, "\n");
        text += "transitionOut = ".concat(params.transitionOut, "\n");
        this._file.encoding = "UTF-8";
        this._file.write(text);
        this._file.close();
    };
    return ParamWriter;
}());

function createPythonExcutionScript(scriptPath, args, pingServerPort) {
    var scriptDir = PathUtil.pathNormalize(scriptPath.substring(0, scriptPath.lastIndexOf("/") + 1));
    var executionCommand = "python \"".concat(scriptPath, "\"");
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        executionCommand += " \"".concat(arg, "\"");
    }
    return /* python */ "\nimport sys\nimport socket\nimport subprocess\n\ndef ping(port: int) -> bool:\n    try:\n        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:\n            s.connect((\"localhost\", port))\n            s.close()\n    except ConnectionRefusedError:\n        return False\n    \n    return True\n\nif __name__ == \"__main__\":\n    if (ping(int(".concat(pingServerPort, "))):\n        sys.exit(0)\n    else:\n        subprocess.Popen('''").concat(executionCommand, "''', cwd=\"").concat(scriptDir, "\")\n");
}
var PythonRunner = /** @class */ (function () {
    function PythonRunner() {
    }
    PythonRunner.run = function (scriptPath, args) {
        if (args === void 0) { args = []; }
        var pythonExcutionScriptFilePath = PathUtil.scriptRelativePath("pythonExcutionScript.py");
        var pythonExcutionScriptFile = new File(pythonExcutionScriptFilePath);
        if (pythonExcutionScriptFile.open("w")) {
            pythonExcutionScriptFile.encoding = "UTF-8";
            pythonExcutionScriptFile.write(createPythonExcutionScript(scriptPath, args, args[0]));
            pythonExcutionScriptFile.close();
        }
        var shellScriptFile;
        var content = "";
        if ($.os.toLowerCase().indexOf("windows") === -1) {
            shellScriptFile = new File(PathUtil.scriptRelativePath("pythonRunner.sh"));
            content += "#!/bin/bash\n";
        }
        else {
            shellScriptFile = new File(PathUtil.scriptRelativePath("pythonRunner.bat"));
        }
        if (shellScriptFile.open("w")) {
            shellScriptFile.encoding = "UTF-8";
            content += "python \"".concat(pythonExcutionScriptFilePath, "\n");
            shellScriptFile.write(content);
            shellScriptFile.close();
        }
        shellScriptFile.execute();
    };
    return PythonRunner;
}());

var ResultWatcher = /** @class */ (function () {
    function ResultWatcher(fileName) {
        if (!File.isEncodingAvailable("UTF-8")) {
            throw new Error("UTF-8 is not available");
        }
        var filePath = PathUtil.scriptRelativePath(fileName);
        this._file = new File(filePath);
        if (!(this._file instanceof File)) {
            throw new Error("".concat(filePath, " is not a file"));
        }
    }
    ResultWatcher.prototype.wait = function () {
        while (!this._file.open("r"))
            $.sleep(200);
        var text = this._file.read();
        this._file.close();
        this._file.remove();
        return text;
    };
    return ResultWatcher;
}());

var Interpolator = /** @class */ (function () {
    function Interpolator() {
    }
    /**
     * Cubic Bezier interpolation
     * @param x1 X1
     * @param x2 X2
     * @param y1 Y1
     * @param y2 Y2
     * @param x Weight
     * @returns Interpolated value
     */
    Interpolator.cubicBezierInterpolate = function (x1, x2, y1, y2, x) {
        var c = 0.5;
        var t = c;
        var s = 1.0 - t;
        var loop = 15;
        var eps = 1e-5;
        var math = Math;
        var sst3, stt3, ttt;
        for (var i = 0; i < loop; ++i) {
            sst3 = 3.0 * s * s * t;
            stt3 = 3.0 * s * t * t;
            ttt = t * t * t;
            var ft = (sst3 * x1) + (stt3 * x2) + (ttt) - x;
            if (math.abs(ft) < eps)
                break;
            c /= 2.0;
            t += (ft < 0) ? c : -c;
            s = 1.0 - t;
        }
        return (sst3 * y1) + (stt3 * y2) + ttt;
    };
    /**
     * Linear interpolation
     * @param x1 X1
     * @param x2 X2
     * @param x Weight
     * @returns Interpolated value
     */
    Interpolator.linearInterpolate = function (x1, x2, x) {
        return x1 + (x2 - x1) * x;
    };
    return Interpolator;
}());

var TransitionMaker = /** @class */ (function () {
    function TransitionMaker() {
    }
    TransitionMaker.makeTransition = function (params) {
        var video1 = params.video1, video2 = params.video2, video1Offset = params.video1Offset, video2Offset = params.video2Offset, transitionIn = params.transitionIn, transitionOut = params.transitionOut, transitionPoint = params.transitionPoint, offsetTarget = params.offsetTarget, positionOffsetX = params.positionOffsetX, positionOffsetY = params.positionOffsetY, scaleOffset = params.scaleOffset, rotationOffset = params.rotationOffset, anchorOffsetX = params.anchorOffsetX, anchorOffsetY = params.anchorOffsetY, sampledCurve = params.sampledCurve;
        // find empty video track in range
        var videoTracks = app.project.activeSequence.videoTracks;
        var insertVideoTrack = null;
        var insertVideoTrackIndex = -1;
        for (var i = 0; i < videoTracks.numTracks; i++) {
            var track = videoTracks[i];
            var clips = track.clips;
            var hasClipInRange = false;
            for (var j = 0; j < clips.numItems; j++) {
                var clip = clips[j];
                if ((clip.start.seconds <= transitionIn && transitionIn < clip.end.seconds) ||
                    (clip.start.seconds <= transitionOut && transitionOut < clip.end.seconds)) {
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
        var qeProject = qe.project;
        var qeSequence = qe.project.getActiveSequence();
        if (insertVideoTrack === null) {
            qeSequence.addTracks(1, // video track num
            videoTracks.numTracks, // after witch video track add them
            0 // audio track num
            );
            insertVideoTrack = videoTracks[videoTracks.numTracks - 1];
            insertVideoTrackIndex = videoTracks.numTracks - 1;
        }
        // insert video1
        var video1StartTime = new Time();
        video1StartTime.seconds = transitionIn - video1Offset;
        var video1EndTime = new Time();
        video1EndTime.seconds = transitionPoint - video1Offset;
        var trimedVideo1 = video1.createSubClip("".concat(video1.name, "_trimed_").concat(video1StartTime.ticks, "_").concat(video1EndTime.ticks), video1StartTime.ticks, // startTime
        video1EndTime.ticks, // endTime
        0, // hasHardBoundaries
        1, // takeVideo
        0 // takeAudio
        );
        insertVideoTrack.overwriteClip(trimedVideo1, transitionIn);
        // insert video2
        var video2StartTime = new Time();
        video2StartTime.seconds = transitionPoint - video2Offset;
        var video2EndTime = new Time();
        video2EndTime.seconds = transitionOut - video2Offset;
        var trimedVideo2 = video2.createSubClip("".concat(video2.name, "_trimed_").concat(video2StartTime.ticks, "_").concat(video2EndTime.ticks), video2StartTime.ticks, // startTime
        video2EndTime.ticks, // endTime
        0, // hasHardBoundaries
        1, // takeVideo
        0 // takeAudio
        );
        insertVideoTrack.overwriteClip(trimedVideo2, transitionPoint);
        // insert transition
        var qeTrack = qeSequence.getVideoTrackAt(insertVideoTrackIndex);
        var addedQeClip;
        for (var i = 0; i < qeTrack.numItems; i++) {
            var qeClip = qeTrack.getItemAt(i);
            if (Math.abs(qeClip.start.secs - transitionIn) < 0.05) {
                addedQeClip = qeClip;
                break;
            }
        }
        var videoFrameRate = app.project.activeSequence.getSettings().videoFrameRate;
        var transitionDuration = new Time();
        transitionDuration.seconds = transitionOut - transitionIn;
        addedQeClip.addTransition(qeProject.getVideoTransitionByName("Cross Dissolve"), false, transitionDuration.getFormatted(videoFrameRate, 104 /*TIMEDISPLAY_30Timecode*/));
        // set offset
        var videoClip = null;
        var transformZeroTime;
        var transformOneTime;
        if (offsetTarget === "video1") {
            for (var i = 0; i < insertVideoTrack.clips.numItems; i++) {
                var clip = insertVideoTrack.clips[i];
                if (Math.abs(clip.start.seconds - transitionIn) < 0.05) {
                    videoClip = clip;
                    break;
                }
            }
            transformZeroTime = transitionIn - video1Offset;
            transformOneTime = transitionPoint - video1Offset;
        }
        else {
            for (var i = 0; i < insertVideoTrack.clips.numItems; i++) {
                var clip = insertVideoTrack.clips[i];
                if (Math.abs(clip.start.seconds - transitionPoint) < 0.05) {
                    videoClip = clip;
                    break;
                }
            }
            transformZeroTime = transitionOut - video2Offset;
            transformOneTime = transitionPoint - video2Offset;
        }
        if (videoClip === null)
            throw new Error("videoClip is null");
        var videoComponent = videoClip.components[1];
        var videoComponentProperties = videoComponent.properties;
        for (var i = 0; i < videoComponentProperties.numItems; i++) {
            var property = videoComponentProperties[i];
            if (property.displayName !== "Position"
                && property.displayName !== "Scale"
                && property.displayName !== "Rotation"
                && property.displayName !== "Anchor Point")
                continue;
            property.setTimeVarying(true);
            property.addKey(transformZeroTime);
            property.addKey(transformOneTime);
            if (property.displayName === "Position") {
                property.setValueAtKey(transformZeroTime, [0.5, 0.5], true);
                property.setValueAtKey(transformOneTime, [
                    0.5 + positionOffsetX + anchorOffsetX,
                    0.5 + positionOffsetY + anchorOffsetY
                ], true);
            }
            else if (property.displayName === "Scale") {
                property.setValueAtKey(transformZeroTime, 100, true);
                property.setValueAtKey(transformOneTime, 100 * scaleOffset, true);
            }
            else if (property.displayName === "Rotation") {
                property.setValueAtKey(transformZeroTime, 0, true);
                property.setValueAtKey(transformOneTime, rotationOffset, true);
            }
            else if (property.displayName === "Anchor Point") {
                property.setValueAtKey(transformZeroTime, [0.5, 0.5], true);
                property.setValueAtKey(transformOneTime, [0.5 + anchorOffsetX, 0.5 + anchorOffsetY], true);
            }
            property.setInterpolationTypeAtKey(transformZeroTime, 5, true); // kfInterpMode_Bezier
            property.setInterpolationTypeAtKey(transformOneTime, 5, true); // kfInterpMode_Bezier
            if (sampledCurve !== undefined) {
                var oneFrameTime = videoFrameRate.seconds;
                for (var sampleTime = transformZeroTime + oneFrameTime; sampleTime < transformOneTime; sampleTime += oneFrameTime) {
                    property.addKey(sampleTime);
                    var interpolateTime = (sampleTime - transformZeroTime) / (transformOneTime - transformZeroTime);
                    var weight = Interpolator.cubicBezierInterpolate(sampledCurve.x1, sampledCurve.x2, // x1, x2
                    sampledCurve.y1, sampledCurve.y2, // y1, y2
                    interpolateTime);
                    if (property.displayName === "Position") {
                        property.setValueAtKey(sampleTime, [
                            Interpolator.linearInterpolate(0.5, 0.5 + positionOffsetX + anchorOffsetX, weight),
                            Interpolator.linearInterpolate(0.5, 0.5 + positionOffsetY + anchorOffsetY, weight)
                        ]);
                    }
                    else if (property.displayName === "Scale") {
                        property.setValueAtKey(sampleTime, Interpolator.linearInterpolate(100, 100 * scaleOffset, weight), true);
                    }
                    else if (property.displayName === "Rotation") {
                        property.setValueAtKey(sampleTime, Interpolator.linearInterpolate(0, rotationOffset, weight), true);
                    }
                    else if (property.displayName === "Anchor Point") {
                        property.setValueAtKey(sampleTime, [
                            Interpolator.linearInterpolate(0.5, 0.5 + anchorOffsetX, weight),
                            Interpolator.linearInterpolate(0.5, 0.5 + anchorOffsetY, weight)
                        ]);
                    }
                }
            }
        }
    };
    return TransitionMaker;
}());

function main() {
    app.enableQE();
    var project = app.project;
    var currentSequence = project.activeSequence;
    var selections = currentSequence.getSelection();
    if (selections.length === 0) {
        alert("no selection");
        return;
    }
    var videoSelections = [];
    for (var _i = 0, selections_1 = selections; _i < selections_1.length; _i++) {
        var selection = selections_1[_i];
        if (selection.mediaType === "Video") {
            videoSelections.push(selection);
        }
    }
    if (videoSelections.length !== 2) {
        alert("select 2 video");
        return;
    }
    var trackItem1 = videoSelections[0];
    var trackItem2 = videoSelections[1];
    if (trackItem1.start.seconds > trackItem2.start.seconds) {
        var tmp = trackItem1;
        trackItem1 = trackItem2;
        trackItem2 = tmp;
    }
    var sequenceTransitionIn = Math.max(trackItem1.start.seconds, trackItem2.start.seconds);
    var sequenceTransitionOut = Math.min(trackItem1.end.seconds, trackItem2.end.seconds);
    if (sequenceTransitionIn >= sequenceTransitionOut) {
        alert("no overlap between 2 video");
        return;
    }
    var video1Offset = trackItem1.start.seconds - trackItem1.inPoint.seconds;
    var video2Offset = trackItem2.start.seconds - trackItem2.inPoint.seconds;
    var params = {
        video1Path: trackItem1.projectItem.getMediaPath(),
        video2Path: trackItem2.projectItem.getMediaPath(),
        video1Offset: video1Offset,
        video2Offset: video2Offset,
        transitionIn: sequenceTransitionIn,
        transitionOut: sequenceTransitionOut
    };
    new ParamWriter("params.txt").write(params);
    PythonRunner.run(PathUtil.scriptRelativePath("fileIpcTest.py"), [
        "29381",
        PathUtil.scriptRelativePath("params.txt"),
        PathUtil.scriptRelativePath("result.txt")
    ]);
    var result = new ResultWatcher("result.txt").wait();
    var resultParams = ParamReader.read(result);
    $.writeln(result);
    if (resultParams["flag"] === "False") {
        alert("can't make transition");
        return;
    }
    var rangeL = Number(resultParams["rangeL"]);
    var rangeR = Number(resultParams["rangeR"]);
    var transitionPoint = Number(resultParams["time"]);
    if (rangeL < sequenceTransitionIn || rangeR > sequenceTransitionOut) {
        alert("transition range is out of sequence");
        return;
    }
    var offsetTarget = resultParams["object"] === "a" ? "video1" : "video2";
    var positionOffsetX = Number(resultParams["vectorX"]);
    var positionOffsetY = Number(resultParams["vectorY"]);
    var scaleOffset = Number(resultParams["scale"]);
    var rotationOffset = Number(resultParams["counterclockwise_angle"]) * 180 / Math.PI;
    var anchorOffsetX = Number(resultParams["axisX"]);
    var anchorOffsetY = Number(resultParams["axisY"]);
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
