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

report:{

domain:
result.domain,

ssl:
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

You are WebShield Security AI.

Analyze the website.

Domain:
${url}

SSL:
${result.valid}

SSL Issuer:
${result.sslIssuer}

Days Remaining:
${result.daysRemaining}

DNSSEC:
${result.dnssec}

Findings:
${JSON.stringify(result.findings || [])}

Generate REALISTIC security analysis.

Return EXACTLY:

Score: <0-100>

Risk:
LOW
or
MEDIUM
or
HIGH

Summary:
Write 4 sentences.

Rules:

Score must change for different websites.

Strong SSL → higher.

Missing security headers → lower.

Expired certificate → much lower.

Never return same score.

`

}

);

const text =

ai?.data?.reply

||

"";

aiScore = {

score:

parseInt(

text.match(
/score:\s*(\d+)/i
)?.[1]

)

||

null,

risk:

text.match(
/risk:\s*(LOW|MEDIUM|HIGH)/i
)?.[1]

||

null,

summary:

text.match(
/summary:\s*([\s\S]*)/i
)?.[1]

||

text

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

aiScore?.risk

||

result?.risk

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

aiScore?.summary

||

result?.aiSummary

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
