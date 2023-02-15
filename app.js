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
  const filePath = req.file.path;
  var answer = "";
  let readFileSync = fs.readFileSync(req.file.path);
  try {
    let pdfExtract = await pdfParse(readFileSync);
    fileContent = pdfExtract.text;

    answer = await runCompletion(fileContent, req.body.question);
    res.send({ message: answer });
  } catch (error) {
    res.send({ message: error }).sendStatus(400);
  }
});

async function runCompletion(text, question) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the text below, say "I don't know"
  
    Context:
    ${text}.
    
    Q: ${question}
    A:`,
  });
  return completion.data.choices[0].text;
}

app.listen(PORT, function () {
  console.log(`Server listening on port: ${PORT}`);
});
