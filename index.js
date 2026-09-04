import express from "express";

const app = express();
app.use(express.json());

const URL =
  "https://insurance-webhook-945894769129.us-central1.run.app/vehicle-info";

app.post("/vehicle-info", async (req, res) => {
  const plate = String(req.body.license_plate || "").trim();
  if (!/^\d{5,8}$/.test(plate)) {
    return res.status(400).json({ success: false, error: "INVALID_PLATE" });
  }

  try {
    const r = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license_plate: plate }),
      signal: AbortSignal.timeout(8000),
    });

    const json = await r.json();

    if (!r.ok || !json.success) {
      return res.status(404).json({ success: false, error: "NOT_FOUND" });
    }

    return res.json({ success: true, ...json.data });
  } catch {
    return res.status(504).json({ success: false, error: "API_DOWN" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(process.env.PORT || 8080);
