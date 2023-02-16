var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const PORT = process.env.PORT || 3000;
var app = express();
const upload = multer({ dest: "uploads/" });
console.log(__dirname);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());

app.get("/", function (req, res) {
  res.send("Successful response.");
});

let fileContent = null;

app.post("/upload", upload.single("file"), async (req, res) => {
  // Read the uploaded file as text
  var answer = "";
  let readFileSync;

  try {
    if (req.file?.path) {
      readFileSync = fs.readFileSync(req.file.path);
      let pdfExtract = await pdfParse(readFileSync);
      fileContent = pdfExtract.text;
    }
    answer = await runCompletion(fileContent, req.body.question);
    res.send({ message: answer });
  } catch (error) {
    res.send({ message: error }).sendStatus(400);
  }
});

async function runCompletion(text, question) {
  const completion = await openai.createCompletion({
    max_tokens: 200,
    model: "text-davinci-003",
    prompt: `Answer the question as completely in detail using the provided document, and if the answer is not contained within the text below, say "I could'nt find answer for this question within the context"
  
    Context:
    ${text}.
    
    Q: ${question}
    A:`,
  });
  console.log(completion.data);
  return completion.data.choices[0].text;
}

app.listen(PORT, function () {
  console.log(`Server listening on port: ${PORT}`);
});
