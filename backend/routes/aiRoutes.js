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

website,
question,
report

}

=

req.body;

const reply = `

Website:
${website}

Question:
${question}

Current Security:

SSL:
${report?.valid ? "Secure" : "Unsafe"}

DNSSEC:
${report?.dnssec ? "Enabled" : "Not Available"}

Score:
${report?.score || "Unknown"}

Analysis:

This website appears ${
report?.score > 80
?

"secure"

:

report?.score > 50
?

"moderately secure"

:

"high risk"

}.

`;

return res.json({

reply

});

}

catch(

error

){

console.log(
error
);

return res
.status(500)
.json({

reply:

"AI unavailable"

});

}

}

);

module.exports =
router;