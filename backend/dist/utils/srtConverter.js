"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSrtContent = exports.convertToSrtTime = void 0;
/**
 * Converts timestamp string to total seconds (supports both MM:SS and MM:SS,mmm formats)
 * @param timestamp - Time in MM:SS or MM:SS,mmm format
 * @returns Total seconds as a number (with millisecond precision)
 */
const parseTimestamp = (timestamp) => {
    const [timePart, msPart] = timestamp.split(",");
    const [minutes, seconds] = timePart.split(":").map(Number);
    const milliseconds = msPart ? Number(msPart) / 1000 : 0;
    return minutes * 60 + seconds + milliseconds;
};
/**
 * Converts total seconds to SRT format (HH:MM:SS,mmm)
 * @param totalSeconds - Total time in seconds (can include decimal milliseconds)
 * @returns Time in SRT format HH:MM:SS,mmm
 */
const secondsToSrtTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms
        .toString()
        .padStart(3, "0")}`;
};
/**
 * Converts MM:SS,mmm or MM:SS timestamp to SRT format (HH:MM:SS,mmm)
 * @param timestamp - Time in MM:SS,mmm or MM:SS format
 * @returns Time in SRT format HH:MM:SS,mmm
 */
const convertToSrtTime = (timestamp) => {
    return secondsToSrtTime(parseTimestamp(timestamp));
};
exports.convertToSrtTime = convertToSrtTime;
/**
 * Generates SRT subtitle content from comments
 * @param comments - Array of comments with timestamps
 * @param defaultDuration - Default subtitle duration in seconds (default: 5)
 * @returns SRT formatted string
 */
const generateSrtContent = (comments, defaultDuration = 5) => {
    // Filter comments that have timestamps and sort by timestamp
    const timestampedComments = comments
        .filter((comment) => comment.timeStamp)
        .sort((a, b) => {
        const totalA = parseTimestamp(a.timeStamp);
        const totalB = parseTimestamp(b.timeStamp);
        return totalA - totalB;
    });
    if (timestampedComments.length === 0) {
        return "";
    }
    let srtContent = "";
    timestampedComments.forEach((comment, index) => {
        // Subtitle index (1-based)
        srtContent += `${index + 1}\n`;
        // Calculate start and end times
        const startTime = (0, exports.convertToSrtTime)(comment.timeStamp);
        const currentTotalSecs = parseTimestamp(comment.timeStamp);
        // End time: either until next comment or +defaultDuration seconds
        let endTime;
        if (index < timestampedComments.length - 1) {
            const nextComment = timestampedComments[index + 1];
            const nextTotalSecs = parseTimestamp(nextComment.timeStamp);
            // Use the time until next comment or defaultDuration, whichever is smaller
            const duration = Math.min(nextTotalSecs - currentTotalSecs, defaultDuration);
            const endTotalSecs = currentTotalSecs + duration;
            endTime = secondsToSrtTime(endTotalSecs);
        }
        else {
            // Last comment: add defaultDuration
            const endTotalSecs = currentTotalSecs + defaultDuration;
            endTime = secondsToSrtTime(endTotalSecs);
        }
        // Timestamp line
        srtContent += `${startTime} --> ${endTime}\n`;
        // Comment content only (no author name or type indicator)
        srtContent += `${comment.content}\n`;
        // Blank line between subtitles
        srtContent += `\n`;
    });
    return srtContent.trim();
};
exports.generateSrtContent = generateSrtContent;
