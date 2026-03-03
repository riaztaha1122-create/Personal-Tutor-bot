export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status: "OK",
    message: "Backend serverless running",
    timestamp: new Date().toISOString(),
  });
}
