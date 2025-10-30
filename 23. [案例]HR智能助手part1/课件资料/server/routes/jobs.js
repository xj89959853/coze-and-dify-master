// routes/jobs.js
const express = require("express");
const router = express.Router();

// —— 简单内存库（演示用，生产请换 DB）——
const db = { jobs: [] };

// 兼容 Dify 与自定义两类负载：
// 1) { inputs: { jobname, jobdesc } }
// 2) { jobname, jobdesc }
function extractPayload(body) {
  if (body && typeof body === "object") {
    if (body.inputs && typeof body.inputs === "object") return body.inputs;
    return body;
  }
  return {};
}

// 健康检查
router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "job-posting-api",
    time: new Date().toISOString(),
  });
});

// 发布岗位（对接 Dify HTTP 节点）
router.post("/jobs", (req, res) => {
  const payload = extractPayload(req.body);
  const jobname = (payload.jobname || "").trim();
  const jobdesc = (payload.jobdesc || payload.jobdesc_llm || "").trim();

  if (!jobname || !jobdesc) {
    return res.status(400).json({
      ok: false,
      message: "Missing required fields: jobname and jobdesc",
      hint: 'Send { "inputs": { "jobname": "...", "jobdesc": "..." } } from Dify.',
    });
  }

  const id = `job_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const record = {
    id,
    jobname,
    jobdesc,
    createdAt: new Date().toISOString(),
    status: "published",
  };
  db.jobs.push(record);

  console.log("jobname", jobname);
  console.log("jobdesc", jobdesc);

  console.log("已发布");

  return res
    .status(201)
    .json({ ok: true, message: "Job published", data: record });
});

// 列表/查询（调试用）
router.get("/jobs", (_req, res) => {
  res.json({ ok: true, total: db.jobs.length, data: db.jobs });
});

router.get("/jobs/:id", (req, res) => {
  const found = db.jobs.find((j) => j.id === req.params.id);
  if (!found)
    return res.status(404).json({ ok: false, message: "Job not found" });
  res.json({ ok: true, data: found });
});

module.exports = router;
