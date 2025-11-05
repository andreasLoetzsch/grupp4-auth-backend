const { requireReauth } = require("../middleware/requireReauth");
const jwt = require('jsonwebtoken');
const AdmZip = require('adm-zip');
const { aggregateUserData } = require("../services/aggregator");

const exportUserData = async (req, res) => {
  try {
    const decodedUser = jwt.decode(req.session.user);
    const { userId, username } = decodedUser;
    const reauthenticated = await requireReauth(req, userId);
    if (!reauthenticated) return res.status(403).json({ error: "Re-auth required" });

    // const auditId = await createAudit({ userId, action: "EXPORT_REQUEST" });
    const auditId = 0;
    const dataBundle = await aggregateUserData(userId, username, req.body);

    const manifest = {
      generatedAt: new Date().toISOString(),
      auditId,
      userId,
      legal: { reference: "GDPR Articel 15" }
    }

    const zip = new AdmZip();
    zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)));
    for (const [key, val] of Object.entries(dataBundle)) {
      zip.addFile(`${key}.json`, Buffer.from(JSON.stringify(val, null, 2)));
    }

    const buffer = zip.toBuffer();

    // await createAudit({ userId, action: "EXPORT_CREATED", meta: { auditId }});

    res
      .set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment;  filename="user-${userId}-export.zip`,
      })
      .status(200)
      .send(buffer);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error." });
  }
};

module.exports = { exportUserData };