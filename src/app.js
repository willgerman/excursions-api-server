import './db/mongoose.js';

import express from "express";
import cors from "cors";

import { router as userRouter } from "./routers/users.js";
// const npsRouter = require('./routers/nps');
// const excursionRouter = require('./routers/excursions');
// const tripRouter = require('./routers/trips');
// const friendRouter = require('./routers/friends');

const app = express();
app.use(express.json());

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(userRouter);
// app.use(npsRouter);
// app.use(excursionRouter);
// app.use(tripRouter);
// app.use(friendRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log('API service is up on port ' + port);
});