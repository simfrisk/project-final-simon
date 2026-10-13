// Reads the codecs of an MP4 or MOV file in the browser, without uploading it and
// without a library. Only the box headers and the moov box are read, never the
// media data, so a large file is checked in a few milliseconds.
//
// Why: the media bucket serves the original file and there is no transcoding. A
// file that is not H.264 video with AAC audio plays in some browsers and not in
// others (HEVC from an iPhone, PCM audio from a screen recorder), so it is refused
// before the upload starts.

export interface VideoInspection {
  container: "mp4" | "mov" | "unknown"
  videoCodec: string | null // sample entry code of the first video track, e.g. "avc1"
  audioCodec: string | null // sample entry code of the first audio track, e.g. "mp4a"
  // Why the codecs could not be read. Null when the moov box was read in full.
  problem: "not-a-video-file" | "no-moov" | "moov-too-large" | null
}

const MAX_MOOV_BYTES = 32 * 1024 * 1024
const MAX_TOP_LEVEL_BOXES = 20000
const MAX_BOX_DEPTH = 8

const VIDEO_OK = ["avc1", "avc3"]
const AUDIO_OK = ["mp4a"]

const CODEC_NAMES: Record<string, string> = {
  hvc1: "HEVC (H.265)",
  hev1: "HEVC (H.265)",
  dvh1: "HEVC (H.265)",
  dvhe: "HEVC (H.265)",
  av01: "AV1",
  vp09: "VP9",
  vp08: "VP8",
  apch: "ProRes",
  apcn: "ProRes",
  apco: "ProRes",
  apcs: "ProRes",
  ap4h: "ProRes",
  ap4x: "ProRes",
  mp4v: "MPEG-4 Part 2",
  jpeg: "Motion JPEG",
  mjpa: "Motion JPEG",
  mjpb: "Motion JPEG",
  lpcm: "uncompressed PCM audio",
  sowt: "uncompressed PCM audio",
  twos: "uncompressed PCM audio",
  in24: "uncompressed PCM audio",
  in32: "uncompressed PCM audio",
  ipcm: "uncompressed PCM audio",
  fpcm: "uncompressed PCM audio",
  fl32: "uncompressed PCM audio",
  fl64: "uncompressed PCM audio",
  "ac-3": "Dolby Digital audio",
  "ec-3": "Dolby Digital Plus audio",
  alac: "Apple Lossless audio",
  Opus: "Opus audio",
  samr: "AMR audio",
}

const fourCC = (bytes: Uint8Array, at: number) =>
  String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3])

const abortError = () => new DOMException("Aborted", "AbortError")

interface BoxHeader {
  type: string
  size: number // whole box, header included
  headerSize: number
  toEnd: boolean // size field was 0: the box runs to the end of its parent
}

// Reads a box header from `bytes` at `at`. Size 0 means "to the end".
const readHeader = (bytes: Uint8Array, at: number, end: number): BoxHeader | null => {
  if (at + 8 > end) return null
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let size = view.getUint32(at)
  const type = fourCC(bytes, at + 4)
  let headerSize = 8
  const toEnd = size === 0
  if (size === 1) {
    if (at + 16 > end) return null
    size = Number(view.getBigUint64(at + 8))
    headerSize = 16
  } else if (size === 0) {
    size = end - at
  }
  if (size < headerSize) return null
  return { type, size, headerSize, toEnd }
}

interface TrackInfo {
  handler: string | null
  sampleEntry: string | null
}

// Walks the boxes inside [start, end) and calls visit for each one.
const eachBox = (
  bytes: Uint8Array,
  start: number,
  end: number,
  visit: (header: BoxHeader, payloadStart: number, payloadEnd: number) => void
) => {
  let at = start
  while (at < end) {
    const header = readHeader(bytes, at, end)
    if (!header) return
    const boxEnd = Math.min(at + header.size, end)
    visit(header, at + header.headerSize, boxEnd)
    at = boxEnd
  }
}

const readTrack = (bytes: Uint8Array, start: number, end: number): TrackInfo => {
  const info: TrackInfo = { handler: null, sampleEntry: null }

  const findSampleEntry = (from: number, to: number, depth: number) => {
    if (depth > MAX_BOX_DEPTH) return
    eachBox(bytes, from, to, (header, payloadStart, payloadEnd) => {
      if (info.sampleEntry) return
      if (header.type === "minf" || header.type === "stbl") {
        findSampleEntry(payloadStart, payloadEnd, depth + 1)
      } else if (header.type === "stsd") {
        // version and flags (4), entry count (4), then the first sample entry.
        const entryAt = payloadStart + 8
        if (entryAt + 8 <= payloadEnd) info.sampleEntry = fourCC(bytes, entryAt + 4)
      }
    })
  }

  eachBox(bytes, start, end, (header, payloadStart, payloadEnd) => {
    if (header.type !== "mdia") return
    eachBox(bytes, payloadStart, payloadEnd, (inner, innerStart, innerEnd) => {
      if (inner.type === "hdlr") {
        // version and flags (4), pre_defined (4), handler_type (4)
        if (innerStart + 12 <= innerEnd) info.handler = fourCC(bytes, innerStart + 8)
      } else if (inner.type === "minf") {
        findSampleEntry(innerStart, innerEnd, 0)
      }
    })
  })

  return info
}

const readSlice = async (file: File, start: number, end: number, signal?: AbortSignal) => {
  if (signal?.aborted) throw abortError()
  const buffer = await file.slice(start, end).arrayBuffer()
  if (signal?.aborted) throw abortError()
  return new Uint8Array(buffer)
}

export const inspectVideo = async (file: File, signal?: AbortSignal): Promise<VideoInspection> => {
  const result: VideoInspection = {
    container: "unknown",
    videoCodec: null,
    audioCodec: null,
    problem: null,
  }

  // Top level walk: only the 16 byte header of each box is read.
  let offset = 0
  let moovStart = -1
  let moovSize = 0
  let sawFtyp = false

  for (let i = 0; i < MAX_TOP_LEVEL_BOXES && offset < file.size; i += 1) {
    const head = await readSlice(file, offset, Math.min(offset + 16, file.size), signal)
    const header = readHeader(head, 0, head.length)
    if (!header) break

    if (i === 0) {
      if (header.type !== "ftyp") {
        // The server only accepts files that start with ftyp.
        result.problem = "not-a-video-file"
        return result
      }
      sawFtyp = true
      const brand = head.length >= header.headerSize + 4 ? fourCC(head, header.headerSize) : ""
      result.container = brand === "qt  " ? "mov" : "mp4"
    }

    const size = header.toEnd ? file.size - offset : header.size
    if (header.type === "moov") {
      moovStart = offset + header.headerSize
      moovSize = size - header.headerSize
      break
    }
    offset += size
  }

  if (!sawFtyp) {
    result.problem = "not-a-video-file"
    return result
  }
  if (moovStart < 0) {
    result.problem = "no-moov"
    return result
  }
  if (moovSize > MAX_MOOV_BYTES) {
    result.problem = "moov-too-large"
    return result
  }

  const moov = await readSlice(file, moovStart, moovStart + moovSize, signal)
  eachBox(moov, 0, moov.length, (header, payloadStart, payloadEnd) => {
    if (header.type !== "trak") return
    const track = readTrack(moov, payloadStart, payloadEnd)
    if (track.handler === "vide" && result.videoCodec === null) {
      result.videoCodec = track.sampleEntry
    } else if (track.handler === "soun" && result.audioCodec === null) {
      result.audioCodec = track.sampleEntry
    }
  })

  return result
}

const codecLabel = (code: string) => CODEC_NAMES[code] ?? `the "${code.trim()}" codec`

const EXPORT_HINT = "Export it as MP4 (H.264 with AAC audio) and try again."

// Turns an inspection into a message for the user, or null when the file is fine.
export const describeVideoProblem = (info: VideoInspection): string | null => {
  if (info.problem === "not-a-video-file") {
    return `This file does not look like an MP4 or MOV video. ${EXPORT_HINT}`
  }
  if (info.problem === "no-moov") {
    return `This video file looks incomplete or damaged. ${EXPORT_HINT}`
  }
  // moov-too-large: nothing could be read, so do not guess. The thumbnail step
  // still tests that the browser can decode the video.
  if (info.problem === "moov-too-large") return null

  if (info.videoCodec === null) {
    return `This file has no video track. ${EXPORT_HINT}`
  }
  if (!VIDEO_OK.includes(info.videoCodec)) {
    return `This video uses ${codecLabel(info.videoCodec)}, which some browsers cannot play. ${EXPORT_HINT}`
  }
  if (info.audioCodec !== null && !AUDIO_OK.includes(info.audioCodec)) {
    return `This video uses ${codecLabel(info.audioCodec)}, which some browsers cannot play. ${EXPORT_HINT}`
  }
  return null
}

// One call for the callers: null when the file may be uploaded, else the message.
// A file that cannot be read at all is not refused here, the server still checks it.
export const checkVideoFile = async (file: File, signal?: AbortSignal): Promise<string | null> => {
  try {
    return describeVideoProblem(await inspectVideo(file, signal))
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err
    return null
  }
}
