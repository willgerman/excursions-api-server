const mongoose = require('mongoose');
const express = require('express');
const Excursion = require('../models/excursion');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();


// ----------------------- //
// #region Trip Management //
// ----------------------- //

/**
 *  Create Trip
 *  [docs link]
 */
router.post('/trip', auth, async (req, res) => {
    try {
        req.body.host = req.user._id;

        const trip = new Trip(req.body);
        await trip.save();

        await User.updateOne(
            { _id: req.user._id },
            { $push: { hostedTrips: trip._id } }
        );

        const host = await User.findById(
            { _id: trip.host },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        if (host) {
            trip.host = host;
        }

        return res.status(201).send({ trip });
    } catch (error) {
        console.log(error);
        return res.status(400).send("Unable to create new trip.");
    }
});

/**
 *  Get Trips
 *  [docs link]
 */
router.get('/trips', auth, async (req, res) => {
    try {
        const filter = { host: req.user._id };

        const pipeline = Trip.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "host",
                    as: "host",
                }
            },
            {
                $project: {
                    "_id": 1,
                    "name": 1,
                    "description": 1,
                    "park": 1,
                    "campground": 1,
                    "thingstodo": 1,
                    "startDate": 1,
                    "endDate": 1,

                    "host._id": 1,
                    "host.userName": 1,
                    "host.firstName": 1,
                    "host.lastName": 1,
                    "host.email": 1,
                }
            }
        ]);

        const trips = await pipeline.exec();

        if (trips.length === 0) {
            // determine best response code for no trips for this user
            // return res.status(204).send();
        }

        return res.status(200).send({ trips });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Trip By Id
 *  [docs link]
 */
router.get('/trip/:tripId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.tripId)) {
            return res.status(400).send("Invalid Id");
        }

        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!trip.host.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        // can be converted to a pipeline if desired
        const host = await User.findById(
            { _id: trip.host },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        if (host) {
            trip.host = host;
        }

        return res.status(200).send({ trip });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Update Trip By Id
 *  [docs link]
 */
router.patch('/trip/:tripId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!trip.host.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        const mods = req.body;

        if (mods.length === 0) {
            return res.status(400).send("Missing updates.");
        }

        const props = Object.keys(mods);
        const modifiable = [
            'name',
            'description',
            'park',
            'campground',
            'thingstodo',
            'startDate',
            'endDate'
        ];

        const isValid = props.every((prop) => modifiable.includes(prop));

        if (!isValid) {
            return res.status(400).send("Invalid updates.");
        }

        props.forEach((prop) => trip[prop] = mods[prop]);
        await trip.save();

        const host = await User.findById(
            { _id: trip.host },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        if (host) {
            trip.host = host;
        }

        return res.status(200).send({ trip });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Delete Trip By Id
 *  [docs link]
 */
router.delete('/trip/:tripId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!trip.host.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        await Trip.deleteOne({ _id: req.params.tripId });

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

module.exports = router;