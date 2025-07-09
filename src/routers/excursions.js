const mongoose = require('mongoose');
const express = require('express');
const Excursion = require('../models/excursion');
const ExcursionInvite = require('../models/excursionInvite');
const User = require('../models/user');
const auth = require('../middleware/auth');

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

        if (!excursions) {
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

        // TODO: Add functionality to this endpoint allowing the user to submit a list of userId's to invite rather than only allowing for one id.

        // read in array

        // perform operation for a single item repeatedly across the array

        // instead of sending the result to the user add each successful addition to a list that is returned by the endpoint once the operations are completed

        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        let excursion = await Excursion.findById(req.params.excursionId);

        if (!excursion) {
            return res.status(404).send("Requested resource not found.");
        }

        let excursionInvite = new ExcursionInvite({
            "sender": req.user._id,
            "receiver": req.body.userId,
            "excursion": excursion._id,
        });
        await excursionInvite.save();

        await User.updateOne(
            { _id: req.user._id },
            { $push: { excursionInvites: excursionInvite._id } }
        );

        await User.updateOne(
            { _id: req.body.userId },
            { $push: { excursionInvites: excursionInvite._id } }
        );

        // probably push the excursionInvite._id to an array here and then use that array with a single filter with the pipeline so that you do not need a lot of pipelines

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
                        },
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
                    "excursion.trips": 1, // test if this was fixed with nested project
                    "excursion.createdAt": 1,
                    "excursion.updatedAt": 1,
                }
            }
        ]);

        excursionInvite = await pipeline.exec();

        return res.status(201).send({ excursionInvite });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Excursion Invites By User
 *  [docs link]
 */
router.get('/share/excursions', auth, async (req, res) => {
    try {
        // const filter = {
        //     $or: [
        //         { sender: req.user._id },
        //         { receiver: req.user._id }
        //     ]
        // };

        const filter = { _id: { $in: [...req.user.excursionInvites] } };

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
                    "excursion.trips": 1, // would be nice to remove "__v" field but w/e lol --> still fix this
                    "excursion.createdAt": 1,
                    "excursion.updatedAt": 1,
                }
            }
        ]);

        const excursionInvites = await pipeline.exec();

        if (!excursionInvites) {
            return res.status(404).send("Requested resource not found.");
        }

        return res.status(200).send({ excursionInvites });
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Update Excursion Invite by Id
 *  [docs link]
 */
router.patch('/share/excursions/:inviteId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.inviteId)) {
            return res.status(400).send("Invalid Id");
        }

        const excursionInvite = await ExcursionInvite.findById({ _id: req.params.inviteId });

        if (!excursionInvite) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!excursionInvite.receiver.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        const mods = req.body;

        if (mods.length === 0) {
            return res.status(400).send("Missing updates.");
        }

        const props = Object.keys(mods);
        const modifiable = [
            'isAccepted'
        ];

        const isValid = props.every((prop) => modifiable.includes(prop));

        if (!isValid) {
            return res.status(400).send("Invalid updates.");
        }

        props.forEach((prop) => excursionInvite[prop] = mods[prop]);
        await excursionInvite.save();

        if (excursionInvite.isAccepted) {
            await User.updateOne(
                { _id: excursionInvite.receiver },
                { $push: { excursions: excursionInvite.excursion } }
            );

            await Excursion.updateOne(
                { _id: excursionInvite.excursion },
                { $push: { participants: excursionInvite.receiver } }
            );
        }

        await ExcursionInvite.deleteOne({ _id: excursionInvite._id });

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Delete Excursion Invite
 *  [docs link]
 */
router.delete('/share/excursions/:inviteId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.inviteId)) {
            return res.status(400).send("Invalid Id");
        }

        const excursionInvite = await ExcursionInvite.findById({ _id: req.params.inviteId });

        if (!excursionInvite) {
            return res.status(404).send("Requested resource not found.");
        }

        if (!excursionInvite.sender.equals(req.user._id)) {
            return res.status(403).send("Forbidden");
        }

        await excursionInvite.deleteOne({ _id: req.params.inviteId });

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// -------------------------------- //
// #endregion                       //
// -------------------------------- //

// ------------------------------------ //
// #region Shared Excursion Management  //
// ------------------------------------ //

// refactor this entire segment, it be kinda shite

/**
 *  Remove Participant By Id
 *  [docs link]
 */
router.delete('/remove/excursions/:excursionId', auth, async (req, res) => {
    try {
        // refactor this to accept an array of userId's as well.

        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            return res.status(400).send("Invalid Id");
        }

        let excursion = await Excursion.findById(req.params.excursionId);

        if (!excursion) {
            return res.status(404).send("Requested resource not found.");
        }

        // refactor starts here
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

        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
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