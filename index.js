const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function runCompletion() {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the text below, say "I don't know"

  Context:
  The world is currently reliant on oil, coal and natural gas for the majority of its energy

requirements but there will come a time when these run out. This essay will discuss how

we can help to prevent our non-renewable resources from becoming depleted by using

our cars less frequently and it will name some natural forces that can be harnessed to

generate power.

Conserving energy is a responsibility of every individual and an important way in which

we can all do our bit is to use more energy-efficient means of transport. The easiest way

to do this is to leave the car at home and walk or cycle to our destination if it isn't too far

away, or take public transport for longer journeys. Another way to reduce our fuel

consumption is to car share. Whenever my friends and I get together for coffee, we agree

to meet up at a café that we can each get to without having to drive our cars there. We

usually go on foot or ride our bikes. If everyone made small decisions like this, it would

make a real difference.

The most sustainable alternatives to fossil fuels are the generation of power from natural

forces such as the sun, wind and oceans. Solar and wind power are already widely used

across the world but it is wave power and tidal energy that have the greatest untapped

potential to provide for our energy needs in the future. A report recently commissioned in

the United Kingdom estimates that tidal energy could meet as much as 20% of the UK's

current electricity demands once the technology being developed is operational. Wave

energy converters are expected to prove equally successful in the long-term.

In conclusion, our earth's reserves of fossil fuels will not last forever and we need to be

continually developing new technologies to enable us to produce energy from renewable

sources such as the sun, wind and water. In the meantime, we can help to slow the rate

of depletion by leaving the car at home and using more energy-efficient forms of

transport whenever possible..
  
  Q: What does this essay discuss in detail?
  A:`,
  });
  console.log(completion.data.choices[0].text);
}

runCompletion();
