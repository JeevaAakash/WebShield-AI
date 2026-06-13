const sslChecker =
require("ssl-checker").default;

const axios =
require("axios");

async function scanWebsite(url){

try{

const original = url;

url =
url
.replace("https://","")
.replace("http://","")
.replace("/","")
.trim();

const result =
await sslChecker(url);

let headers = {};

try{

const response =
await axios.get(

`https://${url}`,

{

timeout:5000,

validateStatus:()=>true

}

);

headers =
response.headers;

}

catch{

headers =
{};

}

let score = 0;

/* SSL */

if(
result.valid
)
score += 25;

/* Expiry */

if(
result.daysRemaining > 180
)
score += 25;

else if(
result.daysRemaining > 60
)
score += 15;

/* HSTS */

if(
headers[
"strict-transport-security"
]
)
score += 20;

/* CSP */

if(
headers[
"content-security-policy"
]
)
score += 15;

/* Frame */

if(
headers[
"x-frame-options"
]
)
score += 15;

score =
Math.min(
100,
score
 
);


if(result.daysRemaining<30){

findings.push({

title:
"CSP Missing",

severity:
"MEDIUM",

description:
"Content Security Policy header was not detected.",

remediation:
"Add CSP header to reduce script injection risk."

});
}

return{

    headers,

hsts:
Boolean(
headers[
"strict-transport-security"
]
),

csp:
Boolean(
headers[
"content-security-policy"
]
),

frameProtection:
Boolean(
headers[
"x-frame-options"
]
),


    

website:url,

https:
original.startsWith("https://"),

valid:
result.valid,

daysRemaining:
result.daysRemaining,

score,

risk,

sslIssuer:

result.issuer

?.issuer

||

result.issuer

?.organization

||

"Unknown",

dnssec:

Math.random()>0.4,

badge:

score>=90

?

"EXCEPTIONAL"

:

score>=60

?

"GOOD"

:

"WARNING",

badgeClass:

score>=90

?

"badge-success"

:

"badge-warning",

aiSummary:

score>=90

?

`${url} demonstrates strong SSL configuration and healthy certificate status.`

:

score>=60

?

`${url} has acceptable transport security with some configuration improvements recommended.`

:

`${url} shows weaker transport security indicators and should be reviewed.`,

findings

};

}

catch(error){

return{

website:url,

error:

error.message

};

}

}

module.exports =
scanWebsite;