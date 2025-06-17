require('./db/mongoose');

const express = require('express');
const cors = require('cors');

const userRouter = require('./routers/users');
const npsRouter = require('./routers/national-park-service');
const excursionRouter = require('./routers/excursions');
const friendRouter = require('./routers/friends');

const app = express();
app.use(express.json());

app.use(cors());

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// pulled from KChase in attempt to fix Jana's CORS issue T-T
// idk wtf is going on — wish me luck
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Methods");
    next();
});

app.use(userRouter);
app.use(npsRouter);
app.use(excursionRouter);
app.use(friendRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log('API service is up on port ' + port);
});