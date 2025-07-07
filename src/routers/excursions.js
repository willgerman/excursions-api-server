const mongoose = require('mongoose');
const express = require('express');
const Excursion = require('../models/excursion');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');
// const ExcursionInvite = require('../models/excursionInvite');

const router = new express.Router();


// ---------------------------- //
// #region Excursion Management //
// ---------------------------- //

/**
 *  Create Excursion
 *  [docs link]
 */
router.post('/excursion', auth, async (req, res) => {
    try {
        req.body.host = req.user._id;

        let excursion = new Excursion(req.body);
        await excursion.save();

        await User.updateOne(
            { _id: req.user._id },
            { $push: { excursions: excursion._id } }
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

        return res.status(201).send({ excursion });
    } catch (error) {
        console.log(error);
        return res.status(400).send("Unable to create new excursion.");
    }
});

/**
 *  Get Excursions By User
 *  [docs link]
 */
router.get('/excursions', auth, async (req, res) => {
    try {
        const filter = {
            $or: [
                { host: req.user._id },
                {
                    participants: {
                        // used to be $all
                        $in: [req.user._id]
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

        if (excursions.length === 0) {
            return res.status(404).send("Requested resource not found.");
        }

        return res.status(200).send({ excursions });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Excursion By Id
 *  [docs link]
 */
router.get('/excursion/:excursionId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        let excursion = await Excursion.findById(req.params.excursionId);

        if (!excursion) {
            return res.status(404).send("Requested resource not found.");
        }

        // TODO: implement "public" on excursions to allow anyone to view it. if this field is false then these checks need to be performed to determine if someone is permitted to view it.

        // TODO: Check if user is on the friend's list of the host?
        if (!excursion.host.equals(req.user._id) && !excursion.participants.includes(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        const filter = { _id: excursion._id };

        const pipeline = Excursion.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "trips",
                    foreignField: "_id",
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

        return res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Update Excursion By Id
 *  [docs link]
 */
router.patch('/excursion/:excursionId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        let excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!excursion.host.equals(req.user._id)) {
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
            'trips',
            'isComplete'
        ];

        const isValid = props.every((prop) => modifiable.includes(prop));

        if (!isValid) {
            return res.status(400).send("Invalid updates.");
        }

        props.forEach((prop) => excursion[prop] = mods[prop]);
        await excursion.save();

        const filter = { _id: excursion._id };

        const pipeline = Excursion.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "trips",
                    foreignField: "_id",
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

        return res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Delete Excursion By Id
 *  [docs link]
 */
router.delete('/excursion/:excursionId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        let excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!excursion.host.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        await Excursion.deleteOne({ _id: req.params.excursionId });

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// ---------------------------- //
// #endregion                   //
// ---------------------------- //

// -------------------------------- //
// #region Shared Excursion Invites //
// -------------------------------- //

/**
 *  Create Excursion Share Invite
 *  [docs link]
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
 *  [docs link]
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
 *  [docs link]
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
 *  [docs link]
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
 *  [docs link]
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
 *  [docs link]
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
        res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// ------------------------------------ //
// #endregion                           //
// ------------------------------------ //

module.exports = router;