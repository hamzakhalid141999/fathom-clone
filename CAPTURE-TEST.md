# Capture Test

## Setup (step 1)

- Tool: Cursor
- Model: Composer (Auto agent router) — same model plans and executes in this session
- Mechanism: Cursor project hooks (automatic; fires on every prompt and final response)

## Mechanism (step 2)

- Config: `.cursor/hooks.json`
- Script: `.cursor/hooks/capture.js`
- Events: `sessionStart`, `beforeSubmitPrompt`, `afterAgentResponse`
- Output: `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md`

## Log file location

(Fill after canaries land — path under `.agent-logs/`)

## Canary entries

(Paste raw PROMPT + RESPONSE entries from the log file here after both canaries succeed)

## What did not work first

- Found an empty `.cursor/hooks.json` and a draft `capture.js` that never ran (no wiring).
- Env vars `CURSOR_SESSION_ID` / `CURSOR_MODEL` are not reliable; the real payload fields are `conversation_id`, `model` / `model_id`, `prompt`, and `text`.
- Manual / remembered logging was not used — Cursor hooks are the automatic path.
