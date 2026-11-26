---
name: suede-media-transcript
description: "Transcribe authorized recordings, produce checked captions, or turn a time-coded transcript into chapters and show notes. Use when asked for verbatim speech, speaker labels, on-screen text, SRT or VTT. NOT FOR: editing footage (suede-video), building clip campaigns (suede-clip-to-guide), or publishing media."
metadata:
  display-name: "Suede Media Transcript Skills"
  version: 1.0.0
---

# Suede Media Transcript Skills

## Choose an authorized source

Record the recording's origin, exact version, duration, language, requested outputs, and whether media can leave the current environment. Prefer supplied media or authorized captions that can be read without transferring the file. Treat private recordings as local-only unless the requester authorizes a named service and its use is supported. Do not install tools, upload files, download protected media by bypassing controls, or incur a charge just to obtain a transcript. If the media cannot be accessed, state what is unavailable and which supplied caption file or authorized copy would unblock it.

## Preserve distinct kinds of evidence

Start with a speech record containing start time, end time, speaker label, and heard words. Use neutral speaker labels until an identity is evident or supplied. Mark sections that cannot be heard as `[unclear]` at the appropriate time; never fill gaps from surrounding context. If translation or cleanup is requested, keep it separate from the verbatim record. Log on-screen words with their own timestamps and mark any partly visible text; do not attribute visual text to a speaker unless they also say it.

Draft chapters from meaningful topic changes after the transcript has been checked. Make summaries and show notes clearly editorial, and ground every direct quote in a timestamped transcript segment. Never invent footage, timecodes, speaker names, permissions, or approval to distribute.

## Delivery and verification

Deliver the requested set: timestamped transcript, optional on-screen text log, chapter list and show notes, and SRT or VTT as requested. Confirm captions parse in the target format; use positive durations, ordered cues, and no unintended overlaps or end times beyond the recording. For SRT use numbered cues and comma milliseconds; for VTT emit the `WEBVTT` header and dot milliseconds. Recheck a sample at the beginning, middle, and end, plus names, numbers, uncertain passages, and all externally quoted moments. Report which checks used playback and which used only an existing transcript. A transcript without accessible audio is not independently verified against the recording.

## Example

For an approved webinar with slides and overlapping voices, deliver a speech transcript with neutral speaker labels, mark masked segments, and put slide labels in a separate visual log. Generate subtitles from the speech track, not from the slides. Link the three chapter descriptions back to their cues and note any segment that could not be replayed.

## Boundaries

- Use only media the operator may access and transcribe.
- Never upload private media or publish captions without separate authorization.
