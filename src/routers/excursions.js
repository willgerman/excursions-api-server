const express = require('express');
const Excursion = require('../models/excursion');
const ExcursionInvite = require('../models/excursionInvite');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = new express.Router();


// ---------------------------- //
// #region Excursion Management //
// ---------------------------- //

/**
 *  Create Excursion
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/create-excursion
 */
router.post('/excursion', auth, async (req, res) => {
    try {
        req.body.host = req.user._id;

        let excursion = new Excursion(req.body);
        await excursion.save();

        await User.updateOne(
            { _id: req.user._id },
            { hostedExcursions: excursion._id }
        );

        const filter = { _id: excursion._id };

        const pipeline = Excursion.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "trips",
                    foreignField: '_id',
                    localField: "trips",
                    as: "trips"
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "host",
                    as: "host",
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "participants",
                    as: "participants",
                }
            },
            {
                $project: {
                    "name": 1,
                    "description": 1,
                    "isComplete": 1,
                    "createdAt": 1,
                    "updatedAt": 1,

                    "trips._id": 1,
                    "trips.name": 1,
                    "trips.description": 1,
                    "trips.park": 1,
                    "trips.campground": 1,
                    "trips.thingstodo": 1,
                    "trips.startDate": 1,
                    "trips.endDate": 1,
                    "trips.createdAt": 1,
                    "trips.updatedAt": 1,

                    "host._id": 1,
                    "host.userName": 1,
                    "host.firstName": 1,
                    "host.lastName": 1,
                    "host.email": 1,

                    "participants._id": 1,
                    "participants.userName": 1,
                    "participants.firstName": 1,
                    "participants.lastName": 1,
                    "participants.email": 1,
                }
            }
        ]);

        excursion = await pipeline.exec();

        res.status(201).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Excursions By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/get-excursions-by-user
 */
router.get('/excursions', auth, async (req, res) => {
    try {
        const filter = {
            $or: [
                { host: req.user._id },
                {
                    participants: {
                        $all: [req.user._id]
                    }
                }
            ]
        };

        const pipeline = Excursion.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "trips",
                    foreignField: '_id',
                    localField: "trips",
                    as: "trips"
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "host",
                    as: "host",
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "participants",
                    as: "participants",
                }
            },
            {
                $project: {
                    "name": 1,
                    "description": 1,
                    "isComplete": 1,
                    "createdAt": 1,
                    "updatedAt": 1,

                    "trips._id": 1,
                    "trips.name": 1,
                    "trips.description": 1,
                    "trips.park": 1,
                    "trips.campground": 1,
                    "trips.thingstodo": 1,
                    "trips.startDate": 1,
                    "trips.endDate": 1,
                    "trips.createdAt": 1,
                    "trips.updatedAt": 1,

                    "host._id": 1,
                    "host.userName": 1,
                    "host.firstName": 1,
                    "host.lastName": 1,
                    "host.email": 1,

                    "participants._id": 1,
                    "participants.userName": 1,
                    "participants.firstName": 1,
                    "participants.lastName": 1,
                    "participants.email": 1,
                }
            }
        ]);

        const excursions = await pipeline.exec();

        res.status(200).send({ excursions });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Get Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/get-excursion-by-id
 */
router.get('/excursion/:excursionId', auth, async (req, res) => {
    try {
        let excursion = await Excursion.findById(req.params.excursionId);

        if (!excursion) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        if (!excursion.host.equals(req.user._id) && !excursion.participants.includes(req.user._id)) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        const filter = { _id: excursion._id };

        const pipeline = Excursion.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "trips",
                    foreignField: '_id',
                    localField: "trips",
                    as: "trips"
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "host",
                    as: "host",
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "participants",
                    as: "participants",
                }
            },
            {
                $project: {
                    "name": 1,
                    "description": 1,
                    "isComplete": 1,
                    "createdAt": 1,
                    "updatedAt": 1,

                    "trips._id": 1,
                    "trips.name": 1,
                    "trips.description": 1,
                    "trips.park": 1,
                    "trips.campground": 1,
                    "trips.thingstodo": 1,
                    "trips.startDate": 1,
                    "trips.endDate": 1,
                    "trips.createdAt": 1,
                    "trips.updatedAt": 1,

                    "host._id": 1,
                    "host.userName": 1,
                    "host.firstName": 1,
                    "host.lastName": 1,
                    "host.email": 1,

                    "participants._id": 1,
                    "participants.userName": 1,
                    "participants.firstName": 1,
                    "participants.lastName": 1,
                    "participants.email": 1,
                }
            }
        ]);

        excursion = await pipeline.exec();

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Update Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/patch-excursion-by-id
 */
router.patch('/excursion/:excursionId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'trips', 'isComplete'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid updates' });
        return;
    }

    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: 'Invalid excursion id' });
            return;
        }

        if (!excursion.host.equals(req.user._id)) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        props.forEach((prop) => excursion[prop] = mods[prop]);
        await excursion.save();

        // this should probably be a pipeline as well

        const host = await User.findById(
            { _id: excursion.host },
            {
                _id: 1,
                userName: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        );

        if (host) {
            excursion.host = host;
        }

        if (excursion.trips) {
            const trips = [];

            for (let id of excursion.trips) {
                const trip = await Trip.findById(
                    { _id: id },
                    {
                        _id: 1,
                        name: 1,
                        description: 1,
                        park: 1,
                        campground: 1,
                        thingstodo: 1,
                        startDate: 1,
                        endDate: 1,
                        createdAt: 1,
                        updatedAt: 1,
                    }
                );

                trips.push(trip);
            }

            excursion.trips = trips;
        }

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Delete Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/delete-excursion-by-id
 */
router.delete('/excursion/:excursionId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { hostedExcursions: req.params.excursionId } }
        );

        await User.updateMany(
            { _id: { $in: [...excursion.participants] } },
            { $pull: { sharedExcursions: req.params.excursionId } }
        );

        await Excursion.deleteOne({ _id: req.params.excursionId });

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// ---------------------------- //
// #endregion                   //
// ---------------------------- //

// ----------------------- //
// #region Trip Management //
// ----------------------- //

/**
 *  Create Trip
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/create-trip
 */
router.post('/trip', auth, async (req, res) => {
    try {
        const data = {
            ...req.body,
            "host": req.user._id
        };

        const trip = new Trip(data);
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

        await User.updateOne(
            { _id: req.user._id },
            { $push: { hostedTrips: trip._id } }
        );

        res.status(201).send({ trip });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad request' });
    }
});

/**
 *  Get Trips By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/get-trips-by-user
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
                    "createdAt": 1,
                    "updatedAt": 1,

                    "host._id": 1,
                    "host.userName": 1,
                    "host.firstName": 1,
                    "host.lastName": 1,
                    "host.email": 1,
                }
            }
        ]);

        const trips = await pipeline.exec();

        res.status(200).send({ trips });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Get Trip By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/get-trip-by-id
 */
router.get('/trip/:tripId', auth, async (req, res) => {
    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            res.status(400).send({ Error: "Invalid trip id" });
            return;
        }

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

        res.status(200).send({ trip });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Update Trip By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/patch-trip-by-id
 */
router.patch('/trip/:tripId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: 'Missing updates' });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'park', 'campground', 'thingstodo', 'startDate', 'endDate'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid Updates.' });
        return;
    }

    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            res.status(400).send({ Error: 'Invalid trip id' });
            return;
        }

        if (!trip.host.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden' });
            return;
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

        res.status(200).send({ trip });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Delete Trip By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/delete-trip-by-id
 */
router.delete('/trip/:tripId', auth, async (req, res) => {
    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip.host.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden' });
            return;
        }

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { hostedTrips: req.params.tripId } }
        );

        await Excursion.updateMany(
            { host: req.user._id },
            { $pull: { trips: req.params.tripId } }
        );

        await Trip.deleteOne({ _id: req.params.tripId });

        await Excursion.updateMany(
            { host: req.user._id },
            { $pull: { trips: { _id: req.params.tripId } } }
        );

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

// -------------------------------- //
// #region Shared Excursion Invites //
// -------------------------------- //

/**
 *  Create Excursion Share Invite
 *  https://will-german.github.io/excursions-api-docs/#tag/Sharing-Excursions/operation/create-excursion-invite
 */
router.post('/share/excursion/:excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        const data = {
            "sender": req.user._id,
            "receiver": req.body.friendId,
            "excursion": excursion._id,
        };

        let excursionInvite = new ExcursionInvite(data);
        await excursionInvite.save();

        await User.updateOne(
            { _id: req.user._id },
            { $push: { outgoingExcursionInvites: excursionInvite._id } }
        );

        await User.updateOne(
            { _id: req.body.friendId },
            { $push: { incomingExcursionInvites: excursionInvite._id } }
        );

        let filter = { _id: excursionInvite._id };

        const pipeline = ExcursionInvite.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "sender",
                    as: "sender"
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "receiver",
                    as: "receiver"
                }
            },
            {
                $lookup: {
                    from: "excursions",
                    foreignField: "_id",
                    localField: "excursion",
                    pipeline: [{
                        $lookup: {
                            from: "trips",
                            foreignField: "_id",
                            localField: "trips",
                            as: "trips",
                        }
                    }],
                    as: "excursion"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "isAccepted": 1,

                    "sender._id": 1,
                    "sender.userName": 1,
                    "sender.firstName": 1,
                    "sender.lastName": 1,
                    "sender.email": 1,

                    "receiver._id": 1,
                    "receiver.userName": 1,
                    "receiver.firstName": 1,
                    "receiver.lastName": 1,
                    "receiver.email": 1,

                    "excursion._id": 1,
                    "excursion.name": 1,
                    "excursion.description": 1,
                    "excursion.trips": 1, // would be nice to remove "__v" field but w/e lol
                    "excursion.createdAt": 1,
                    "excursion.updatedAt": 1,
                }
            }
        ]);

        excursionInvite = await pipeline.exec();

        res.status(201).send({ excursionInvite });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Excursion Invites By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Sharing-Excursions/operation/get-excursion-invites
 */
router.get('/share/excursions', auth, async (req, res) => {
    try {
        const filter = {
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        };

        const pipeline = ExcursionInvite.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "sender",
                    as: "sender"
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "receiver",
                    as: "receiver"
                }
            },
            {
                $lookup: {
                    from: "excursions",
                    foreignField: "_id",
                    localField: "excursion",
                    pipeline: [{
                        $lookup: {
                            from: "trips",
                            foreignField: "_id",
                            localField: "trips",
                            as: "trips",
                        }
                    }],
                    as: "excursion"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "isAccepted": 1,

                    "sender._id": 1,
                    "sender.userName": 1,
                    "sender.firstName": 1,
                    "sender.lastName": 1,
                    "sender.email": 1,

                    "receiver._id": 1,
                    "receiver.userName": 1,
                    "receiver.firstName": 1,
                    "receiver.lastName": 1,
                    "receiver.email": 1,

                    "excursion._id": 1,
                    "excursion.name": 1,
                    "excursion.description": 1,
                    "excursion.trips": 1, // would be nice to remove "__v" field but w/e lol
                    "excursion.createdAt": 1,
                    "excursion.updatedAt": 1,
                }
            }
        ]);

        const excursionInvites = await pipeline.exec();

        res.status(200).send({ excursionInvites });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Handle Excursion Invite
 *  https://will-german.github.io/excursions-api-docs/#tag/Sharing-Excursions/operation/handle-excursion-invite
 */
router.patch('/share/excursions/:inviteId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['isAccepted'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: "Invalid updates" });
        return;
    }

    try {
        const excursionInvite = await ExcursionInvite.findById({ _id: req.params.inviteId });

        if (!excursionInvite) {
            res.status(400).send({ Error: 'Invalid invite id' });
            return;
        }

        if (!excursionInvite.receiver.equals(req.user._id)) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        props.forEach((prop) => excursionInvite[prop] = mods[prop]);
        await excursionInvite.save();

        if (req.body.isAccepted) {

            await Excursion.updateOne(
                { _id: excursionInvite.excursion },
                { $push: { participants: req.user._id } }
            );

            await User.updateOne(
                { _id: req.user._id },
                { $push: { sharedExcursions: excursionInvite.excursion } }
            );
        }

        await User.updateOne(
            { _id: excursionInvite.sender },
            { $pull: { outgoingExcursionInvites: excursionInvite._id } }
        );

        await User.updateOne(
            { _id: excursionInvite.receiver },
            { $pull: { incomingExcursionInvites: excursionInvite._id } }
        );

        await ExcursionInvite.deleteOne({ _id: excursionInvite._id });

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Excursion Invite
 *  https://will-german.github.io/excursions-api-docs/#tag/Sharing-Excursions/operation/delete-excursion-invite
 */
router.delete('/share/excursions/:inviteId', auth, async (req, res) => {
    try {
        const excursionInvite = await ExcursionInvite.findById(req.params.inviteId);

        if (!excursionInvite) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        if (!excursionInvite.sender.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden' });
            return;
        }

        await User.updateOne(
            { _id: excursionInvite.sender },
            { $pull: { outgoingExcursionInvites: req.params.inviteId } }
        );

        await User.updateOne(
            { _id: excursionInvite.receiver },
            { $pull: { incomingExcursionInvites: req.params.inviteId } }
        );

        await excursionInvite.deleteOne({ _id: req.params.inviteId });

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// -------------------------------- //
// #endregion                       //
// -------------------------------- //

// ------------------------------------ //
// #region Shared Excursion Management  //
// ------------------------------------ //

/**
 *  Remove Participant By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Sharing-Excursions/operation/remove-user-by-excursion-id
 */
router.delete('/remove/excursions/:excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        if (!excursion.host.equals(req.user._id)) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        if (!req.body.participantId) {
            res.status(400).send({ Error: "Missing participant id" });
        }

        await Excursion.updateOne(
            { _id: req.params.excursionId },
            { $pull: { participants: req.body.participantId } }
        );

        await User.updateOne(
            { _id: req.body.participantId },
            { $pull: { sharedExcursions: req.params.excursionId } }
        );

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Leave Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Sharing-Excursions/operation/leave-excursion-by-id
 */
router.delete('/leave/excursions/:excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        if (excursion.host.equals(req.user._id)) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        await Excursion.updateOne(
            { _id: req.params.excursionId },
            { $pull: { participants: req.user._id } }
        );

        await User.updateOne(
            { _id: req.user._id },
            { $pull: { sharedExcursions: req.params.excursionId } }
        );

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ------------------------------------ //
// #endregion                           //
// ------------------------------------ //


module.exports = router;