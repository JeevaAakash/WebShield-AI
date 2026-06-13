const express =
require("express");

const router =
express.Router();

const scanWebsite =
require(
"../services/scanService"
);

const Scan =
require(
"../models/Scan"
);

const axios =
require(
"axios"
);

router.post(
"/scan",

async (
req,
res
)=>{

try{

const {
url
} =
req.body;

if(!url){

return res.status(400).json({

error:
"Website URL required"

});

}

const result =
await scanWebsite(
url
);

console.log(
"SCAN RESULT:",
result
);

let aiScore = {

score:null,
risk:null,
summary:null

};

try{

const ai =
await axios.post(

"http://localhost:5000/api/ask-ai",

{

website:
url,

report:{

domain:
result.domain,

score:
result.score,

valid:
result.valid,

sslIssuer:
result.sslIssuer,

daysRemaining:
result.daysRemaining,

dnssec:
result.dnssec,

findings:
result.findings || []

},

question:
`

Analyze website security.

Website:
${url}

SSL:
${result.valid}

Issuer:
${result.sslIssuer}

DNSSEC:
${result.dnssec}

Findings:
${JSON.stringify(result.findings)}

Return EXACT format:

Score: 0-100
Risk: LOW|MEDIUM|HIGH
Summary: short explanation

Different websites MUST return different scores.

`

}

);

const text =
ai.data.reply
||
"";

const score =
text.match(
/score:\s*(\d+)/i
);

const risk =
text.match(
/risk:\s*(.+)/i
);

const summary =
text.match(
/summary:\s*(.+)/is
);

aiScore = {

score:

score
?

parseInt(
score[1]
)

:

null,

risk:

risk
?

risk[1].trim()

:

null,

summary:

summary
?

summary[1].trim()

:

text

};

console.log(
"GEMINI:",
aiScore
);

}

catch(err){

console.log(
"AI skipped"
);

}

const finalScore =

Math.max(

0,

Math.min(

100,

Number(
aiScore.score
)

||

Number(
result.score
)

||

50

)

);

const response = {

...result,

score:
finalScore,

risk:

aiScore.risk

||

result.risk

||

(

finalScore < 50

?

"HIGH"

:

finalScore < 80

?

"MEDIUM"

:

"LOW"

),

aiSummary:

aiScore.summary

||

result.aiSummary

||

"Security scan completed.",

findings:

result.findings

||

[]

};

if(
!result.error
){

await Scan.create(
response
);

}

return res.json(
response
);

}

catch(error){

console.log(
error
);

return res
.status(500)
.json({

error:
"Scan failed"

});

}

}

);

module.exports =
router;