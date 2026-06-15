const mongoose =
require(
"mongoose"
);

const scanSchema =
new mongoose.Schema(

{

website:
String,

domain:
String,

https:
Boolean,

valid:
Boolean,

daysRemaining:
Number,

score:
Number,

risk:
String,

sslIssuer:
String,

dnssec:
Boolean,

findings:
Array,

aiSummary:
String

},

{

timestamps:true

}

);

module.exports =

mongoose.model(

"Scan",

scanSchema

);
