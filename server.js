
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const META_API = "https://graph.facebook.com/v19.0";

app.post("/meta", async (req, res) => {
  const { token, accountId } = req.body;
  if (!token || !accountId) return res.status(400).json({ error: "Missing token or accountId" });

  const aid = accountId.startsWith("act_") ? accountId : `act_${accountId}`;

  try {
    const [campRes, insRes] = await Promise.all([
      fetch(`${META_API}/${aid}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&limit=10&access_token=${token}`),
      fetch(`${META_API}/${aid}/insights?fields=impressions,clicks,spend,reach,ctr,cpc,actions&date_preset=last_30d&access_token=${token}`)
    ]);

    const campaigns = await campRes.json();
    const insights = await insRes.json();

    if (campaigns.error) return res.status(400).json({ error: campaigns.error.message });
    if (insights.error) return res.status(400).json({ error: insights.error.message });

    res.json({ campaigns: campaigns.data || [], insights: insights.data?.[0] || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.send("Meta Ads Proxy running ✅"));

app.listen(3000, () => console.log("Server running on port 3000"));
