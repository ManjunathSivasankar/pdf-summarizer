const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get("/", (req, res) => {
  res.send("AI Document Summarizer Backend Running");
});

app.post("/summarize", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    let text = "";

    if (fileType === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        error: "Only PDF and DOCX supported",
      });
    }

    text = text.substring(0, 6000);

    const prompt = `
Summarize the following document.

Provide:
1. Short Summary
2. Key Points
3. Important Insights

Document:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({
      success: true,
      summary: summary,
    });
  } catch (error) {
    console.error("Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
