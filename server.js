import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 4173;

if (!process.env.OPENSERV_API_KEY) {
  console.error("Missing OPENSERV_API_KEY");
  process.exit(1);
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const SYSTEM_PROMPT = [
  "You are BABYDOV Bounty Sentinel, a strict opportunity triage analyst for autonomous earning agents.",
  "Your job is to decide whether a task is actionable now, should be monitored, or should be skipped.",
  "",
  "Rules:",
  "- Never invent reward, deadline, status, eligibility, escrow, or platform facts.",
  "- Distinguish facts supplied by the user from inferences.",
  "- Treat deposits, paid access, wallet signatures, identity verification, external account creation, and irreversible actions as blockers unless explicitly authorized.",
  "- Treat missing evidence, expired deadlines, already-claimed work, duplicate submissions, or unverifiable payment terms as blockers.",
  "- Prefer the smallest safe next action that can increase the chance of a legitimate payout.",
  "- A large headline reward does not override execution risk.",
  "- If inputs are incomplete, choose MONITOR rather than pretending the task is ready.",
  "- Return ONLY valid JSON. No markdown and no surrounding commentary.",
  "",
  "Return exactly this JSON shape:",
  '{"verdict":"ACT|MONITOR|SKIP","confidence":0,"one_line":"","reward_signal":"","deadline_signal":"","blockers":[],"risk_flags":[],"evidence_needed":[],"next_action":"","why":[],"serv_audit":{"prompt_guard":"enabled","kronos":"enabled","multipath":"enabled","shadow_agent":"enabled"}}'
].join("\n");

function cleanJson(text) {
  return JSON.parse(String(text || "").trim());
}

app.post("/api/analyze", async (req, res) => {
  const input = String((req.body && req.body.input) || "").trim();
  if (!input) {
    return res.status(400).json({ error: "Paste a bounty or paid-work description first." });
  }

  try {
    const apiResponse = await fetch("https://inference-api.openserv.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "authorization": "Bearer " + process.env.OPENSERV_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini-serv-kronos-multipath",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Analyze this opportunity exactly as provided. Do not browse or assume missing facts.\\n\\n" + input }
        ],
        tools: [
          { type: "function", function: { name: "serv_prompt_guard" } },
          { type: "function", function: { name: "serv_shadow_agent" } }
        ]
      })
    });
    const response = await apiResponse.json();
    if (!apiResponse.ok) {
      throw new Error((response.error && response.error.message) || "OpenServ request failed");
    }

    const message = response.choices && response.choices[0] && response.choices[0].message;
    const content = (message && message.content) || "";
    const parsed = cleanJson(content);

    res.json(Object.assign({}, parsed, {
      meta: {
        model: "gpt-5.4-mini-serv-kronos-multipath",
        serv_features: ["Prompt Guard", "Kronos", "Multipath", "Shadow Agent"],
        request_id: response.id || null
      }
    }));
  } catch (error) {
    console.error(error);
    res.status(502).json({
      error: "SERV analysis failed",
      detail: (error && error.message) || String(error)
    });
  }
});

app.get("/health", function (_req, res) {
  res.json({ ok: true, service: "BABYDOV Bounty Sentinel", serv: true });
});

app.listen(port, function () {
  console.log("BABYDOV Bounty Sentinel listening on http://localhost:" + port);
});
