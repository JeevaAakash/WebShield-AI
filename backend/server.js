const express =
require("express");

const cors =
require("cors");

const dotenv =
require("dotenv");

/* LOAD ENV FIRST */
dotenv.config();

const connectDB =
require("./config/db");

const authRoutes =
require("./routes/authRoutes");

const scanRoutes =
require("./routes/scanRoutes");

const aiRoutes =
require("./routes/aiRoutes");

connectDB();

const app =
express();

/* MIDDLEWARE */
const cors =
require("cors");

app.use(

cors({

origin:[

"https://web-shield-7uh3r6c8l-jeevamsja1-7608s-projects.vercel.app"

],

credentials:true

})

);

app.use(
express.json()
);

/* AUTH ROUTES */
app.use(
"/api/auth",
authRoutes
);

/* SCAN ROUTES */
app.use(
"/api",
scanRoutes
);

/* GEMINI AI ROUTES */
app.use(
"/api",
aiRoutes
);

/* HOME */
app.get(
"/",
(req,res)=>{

res.send(
"WebShield Backend Connected"

);

});

const PORT =
process.env.PORT
||
5000;

app.listen(
PORT,
()=>{

console.log(
"Server Running"
);

}
);