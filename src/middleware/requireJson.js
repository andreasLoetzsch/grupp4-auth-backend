const requireJson = (req, res, next) => {
  if ((req.method === "POST" || req.method === "PUT" || req.method === "PATCH") && !req.is("application/json")) {
        return res.status(415).json({ message: "JSON required" });
  }

  next();
}

module.exports = requireJson;