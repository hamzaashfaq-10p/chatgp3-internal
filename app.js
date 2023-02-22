var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const PDFExtract = require("pdf.js-extract").PDFExtract;
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const pdfExtractParser = new PDFExtract();

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

let fileContent = "";

app.post("/upload", upload.single("file"), async (req, resp) => {
  // Read the uploaded file as text
  var answer = "";
  let readFileSync;

  try {
    if (req.file?.path) {
      readFileSync = fs.readFileSync(req.file.path);
      pdfExtractParser.extractBuffer(
        readFileSync,
        { normalizeWhitespace: true, disableCombineTextItems: true },
        async (err, data) => {
          if (err) {
            resp.send({ message: err });
            return;
          }

          const res = [];
          for (let i = 0; i < data.pages.length; i += 5) {
            const chunk = data.pages.slice(i, i + 5);
            res.push(chunk);
          }

          for (let i = 0; i < res.length; i++) {
            answer = "";
            console.log(i);
            for (let j = 0; j < res[i].length; j++) {
              for (let k = 0; k < res[i][j].content.length; k++) {
                answer += res[i][j].content[k].str;
              }
            }

            fileContent = answer;
            answer = await runCompletion(fileContent, req.body.question);

            if (
              (answer && answer.trim() === "I don't know") ||
              answer.trim() === "I don't know."
            ) {
              continue;
            } else {
              break;
            }
          }
          if (
            (answer && answer.trim() === "I don't know") ||
            answer.trim() === "I don't know."
          ) {
            let newAnswer = await runCompletionFromModel(req.body.question);
            answer = `The document didn't contain the required answer so this is what i got from my model : \n ${newAnswer}`;
          }
          resp.send({ message: answer });
        }
      );
    }
  } catch (error) {
    resp.send({ message: error });
  }
});

app.post("/searchModel", upload.single("file"), async (req, res) => {
  try {
    answer = await runCompletionFromModel(req.body.question);
    res.send({ message: answer });
  } catch (error) {
    res.send({ message: error });
  }
});

async function runCompletion(text, question) {
  const completion = await openai.createCompletion({
    max_tokens: 200,
    model: "text-davinci-003",
    prompt: `Answer the question as completely in detail using the provided document, and if the answer is not contained within the document , and if you cannot find any answer say "I don't know"
  
    Context:
    ${text}.
    
    Q: ${question.toString()}
    A:`,
  });

  return completion.data.choices[0].text;
}

async function runCompletionFromModel(question) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Answer the question as completely in detail using the provided text and if you don't know the answer say "I couldn't find answer to your question in my knowledge model"

    Q: ${question}
    A:`,
    temperature: 0.7,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ["input:"],
  });

  return completion.data.choices[0].text;
}

app.listen(PORT, function () {
  console.log(`Server listening on port: ${PORT}`);
});
