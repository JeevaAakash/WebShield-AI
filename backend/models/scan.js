const mongoose =
require("mongoose");

const scanSchema =
new mongoose.Schema({

website:String,

https:Boolean,

valid:Boolean,

daysRemaining:Number,

score:Number,

risk:String

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