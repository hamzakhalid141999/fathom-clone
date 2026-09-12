#!/usr/bin/env node
/**
 * 8x agent capture hook — logs prompt + final response only.
 * Wired from .cursor/hooks.json (sessionStart, beforeSubmitPrompt, afterAgentResponse).
 */
const fs = require("fs");
const path = require("path");

const LOG_DIR = path.join(process.cwd(), ".agent-logs");
const STATE_DIR = path.join(process.cwd(), ".cursor", "hooks", ".capture-state");
const AUTHOR = process.env.AGENT_LOG_AUTHOR || "hamzakhalid141999";
const PROJECT = process.env.AGENT_LOG_PROJECT || "fathom-clone";
const TOOL = "cursor";

function ensureDirs() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function readStdin() {
  return new Promise((resolve) => {
    let input = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      input += chunk;
    });
    process.stdin.on("end", () => resolve(input));
  });
}

function shortId(sessionId) {
  return String(sessionId || "unknown").slice(0, 8);
}

function statePath(sessionId) {
  return path.join(STATE_DIR, `${sessionId}.json`);
}

function loadState(sessionId) {
  const p = statePath(sessionId);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function saveState(sessionId, state) {
  fs.writeFileSync(statePath(sessionId), JSON.stringify(state, null, 2));
}

function findLogFile(sessionId) {
  if (!fs.existsSync(LOG_DIR)) return null;
  const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith(`_${sessionId}.md`));
  if (files.length === 0) return null;
  files.sort();
  return path.join(LOG_DIR, files[files.length - 1]);
}

function fileTimestamp(date = new Date()) {
  const iso = date.toISOString();
  // YYYY-MM-DD_HH-MM-SS
  return iso.slice(0, 19).replace("T", "_").replace(/:/g, "-");
}

function createSessionFile(sessionId, model, firstPromptTime) {
  const now = firstPromptTime ? new Date(firstPromptTime) : new Date();
  const ts = fileTimestamp(now);
  const logFile = path.join(LOG_DIR, `${ts}_${sessionId}.md`);
  const date = now.toISOString().slice(0, 10);
  const first = now.toISOString();
  const sid = shortId(sessionId);

  const header = `---
session_id: ${sessionId}
date: ${date}
author: ${AUTHOR}
model: ${model}
tool: ${TOOL}
project: ${PROJECT}
total_exchanges: 0
first_prompt_time: ${first}
last_prompt_time: ${first}
---

# Session Log - ${date}

Session: \`${sid}\` | Project: \`${PROJECT}\` | Author: \`${AUTHOR}\`

---
`;

  fs.writeFileSync(logFile, header);
  saveState(sessionId, {
    logFile,
    exchangeCount: 0,
    firstPromptTime: first,
    lastPromptTime: first,
    model,
  });
  return logFile;
}

function ensureSession(sessionId, model, timestamp) {
  let state = loadState(sessionId);
  let logFile = state && state.logFile && fs.existsSync(state.logFile) ? state.logFile : findLogFile(sessionId);

  if (!logFile) {
    logFile = createSessionFile(sessionId, model, timestamp);
    state = loadState(sessionId);
  } else if (!state) {
    state = {
      logFile,
      exchangeCount: 0,
      firstPromptTime: timestamp,
      lastPromptTime: timestamp,
      model,
    };
    saveState(sessionId, state);
  }
  return { state, logFile };
}

function updateFrontmatter(logFile, updates) {
  const content = fs.readFileSync(logFile, "utf8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return;
  let meta = match[1];
  const body = match[2];
  for (const [key, value] of Object.entries(updates)) {
    const re = new RegExp(`^${key}:.*$`, "m");
    if (re.test(meta)) {
      meta = meta.replace(re, `${key}: ${value}`);
    } else {
      meta += `\n${key}: ${value}`;
    }
  }
  fs.writeFileSync(logFile, `---\n${meta}\n---\n${body}`);
}

function appendEntry(logFile, type, num, sessionId, timestamp, model, content) {
  const sid = shortId(sessionId);
  const entry = `
[LOG_ENTRY type=${type} num=${num} session=${sid}]
timestamp: ${timestamp}
model: ${model}

${content}

`;
  fs.appendFileSync(logFile, entry);
}

function resolveModel(data) {
  return data.model_id || data.model || "unknown-model";
}

function resolveSessionId(data) {
  return data.conversation_id || data.session_id || "unknown-session";
}

async function main() {
  ensureDirs();
  const raw = await readStdin();
  let data = {};
  try {
    data = JSON.parse(raw || "{}");
  } catch (err) {
    fs.appendFileSync(
      path.join(LOG_DIR, "capture-error.log"),
      `${new Date().toISOString()} parse-error: ${err.message}\n${raw.slice(0, 500)}\n`
    );
    process.stdout.write("{}\n");
    return;
  }

  const event = data.hook_event_name || "";
  const sessionId = resolveSessionId(data);
  const model = resolveModel(data);
  const timestamp = new Date().toISOString();

  try {
    if (event === "sessionStart") {
      ensureSession(sessionId, model, timestamp);
      process.stdout.write(JSON.stringify({ env: { AGENT_CAPTURE_SESSION: sessionId } }) + "\n");
      return;
    }

    if (event === "beforeSubmitPrompt") {
      const prompt = data.prompt != null ? String(data.prompt) : "";
      const { state, logFile } = ensureSession(sessionId, model, timestamp);
      const num = (state.exchangeCount || 0) + 1;
      state.exchangeCount = num;
      state.lastPromptTime = timestamp;
      if (!state.firstPromptTime) state.firstPromptTime = timestamp;
      state.model = model;
      state.logFile = logFile;
      saveState(sessionId, state);

      appendEntry(logFile, "PROMPT", num, sessionId, timestamp, model, prompt);
      updateFrontmatter(logFile, {
        total_exchanges: num,
        last_prompt_time: timestamp,
        first_prompt_time: state.firstPromptTime,
        model,
      });

      process.stdout.write(JSON.stringify({ continue: true }) + "\n");
      return;
    }

    if (event === "afterAgentResponse") {
      const text = data.text != null ? String(data.text) : "";
      const { state, logFile } = ensureSession(sessionId, model, timestamp);
      const num = state.exchangeCount || 1;
      state.model = model;
      state.logFile = logFile;
      saveState(sessionId, state);

      appendEntry(logFile, "RESPONSE", num, sessionId, timestamp, model, text);
      updateFrontmatter(logFile, { model });

      process.stdout.write("{}\n");
      return;
    }

    // Unknown event — ignore
    process.stdout.write("{}\n");
  } catch (err) {
    fs.appendFileSync(
      path.join(LOG_DIR, "capture-error.log"),
      `${new Date().toISOString()} ${event}: ${err.stack || err.message}\n`
    );
    if (event === "beforeSubmitPrompt") {
      process.stdout.write(JSON.stringify({ continue: true }) + "\n");
    } else {
      process.stdout.write("{}\n");
    }
  }
}

main();
