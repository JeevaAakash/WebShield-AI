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

const prompt = `

You are WebShield AI.

Analyze this website using real collected scan data.

Website:
${website}

SSL:
${report.valid}

Days:
${report.daysRemaining}

Issuer:
${report.sslIssuer}

HSTS:
${report.hsts}

CSP:
${report.csp}

Frame:
${report.frameProtection}

Findings:
${JSON.stringify(
report.findings
)}

Generate:

Score (0-100)

Risk

Short Summary

Return plain text.

`;
const result =
await ai.models.generateContent({

model:
"gemini-2.5-flash",

contents:
prompt

});

res.json({

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

res
.status(500)
.json({

reply:
"AI temporarily unavailable."

});

}

}

);

module.exports =
router;