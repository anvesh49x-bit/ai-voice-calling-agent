export function healthRoute(req, res) {
  res.status(200).json({
    status: "ok",
    service: "telugu-ai-caller"
  });
}