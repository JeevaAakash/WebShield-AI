const express =
require("express");

const router =
express.Router();

router.post(

"/ask-ai",

async(
req,
res
)=>{

try{

const {
GoogleGenAI
} =
require(
"@google/genai"
);

const apiKey =
process.env.GEMINI_API_KEY;

if(
!apiKey
){

return res
.status(500)
.json({

reply:
"Gemini API key missing"

});

}

const ai =
new GoogleGenAI({

apiKey

});

const {

website,
question,
report

}
=
req.body;


/* CHAT MODE */

if(
question &&
question.trim().length>0 &&
!question.includes(
"Generate"
)
){

const chatPrompt = `

You are WebShield AI.

Website:
${website}

Current Score:
${report?.score}

Risk:
${report?.risk}

SSL:
${report?.valid}

DNSSEC:
${report?.dnssec}

User:
${question}

Reply naturally.

`;

const result =
await ai.models.generateContent({

model:
"gemini-2.5-flash",

contents:
chatPrompt

});

return res.json({

reply:

result.text

||

"AI unavailable"

});

}


/* SCORE MODE */

const prompt = `

You are WebShield Security AI.

Analyze:

Website:
${website}

SSL:
${report?.valid}

Days Remaining:
${report?.daysRemaining}

Issuer:
${report?.sslIssuer}

DNSSEC:
${report?.dnssec}

Findings:
${JSON.stringify(
report?.findings || []
)}

Return EXACTLY:

Score: number

Risk:
LOW
or
MEDIUM
or
HIGH

Summary:
4 sentence explanation.

Different websites MUST return different scores.

`;

const result =
await ai.models.generateContent({

model:
"gemini-2.5-flash",

contents:
prompt

});

return res.json({

reply:

result.text

||

"No analysis generated"

});

}

catch(error){

console.log(
error
);

return res
.status(500)
.json({

reply:
"Connection failed"

});

}

}

);

module.exports =
router;