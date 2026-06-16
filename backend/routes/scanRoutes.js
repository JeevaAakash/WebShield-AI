const express =
require("express");

const router =
express.Router();

const axios =
require("axios");

const scanWebsite =
require(
"../services/scanService"
);


const Scan =
require(
"../models/scan"
);

router.post(

"/scan",

async(
req,
res
)=>{

try{

const {
url
}
=

req.body;

if(!url){

return res
.status(400)
.json({

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

"https://webshield-ai-wb47.onrender.com/api/ask-ai",

{

website:
url,

report:result,

question:
`

You are WebShield Security AI.

Analyze ONLY the provided scan data.

Domain:
${url}

SSL Valid:
${result.valid}

SSL Issuer:
${result.sslIssuer}

Days Remaining:
${result.daysRemaining}

DNSSEC:
${result.dnssec}

Findings:
${JSON.stringify(
result.findings || []
)}

Rules:

Start score at 100.

Expired SSL:
-30

DNSSEC disabled:
-10

Each vulnerability:
-15

Missing headers:
-10

Never give identical scores.

Return EXACTLY:

Score: <number>

Risk:
LOW
or
MEDIUM
or
HIGH

Summary:
Explain briefly.

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
/risk:\s*(LOW|MEDIUM|HIGH)/i
);

const summary =
text.match(
/summary:\s*([\s\S]*)/i
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
summarys
?
summary[1]
:
null

};

}

catch{

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

"LOW",

aiSummary:

aiScore.summary

||

result.aiSummary

||

"Security analysis completed"

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
