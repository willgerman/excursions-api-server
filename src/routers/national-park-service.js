const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

const NPS_API_URL = process.env.NPS_API_URL;
const NPS_API_KEY = process.env.NPS_API_KEY;

// -------------------- //
// #region Park Details //
// -------------------- //

/**
 *  Get National Parks
 *  https://will-german.github.io/excursions-api-docs/#tag/Park-Details/operation/get-national-parks
 */
router.get('/national-parks', auth, async (req, res) => {
    try {
        const endpoint = 'parks';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }

            if (response.status === 401) {
                res.status(500);
                throw new Error("Internal Server Error");
            }
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get National Park Summaries
 *  https://will-german.github.io/excursions-api-docs/#tag/Park-Details/operation/get-national-parks-summary
 */
router.get('/national-parks/summary', auth, async (req, res) => {
    try {
        const endpoint = 'parks';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();
                const parks = data.data;
                let summaries = [];

                parks.forEach(park => {
                    let { id, url, name, fullName, description, parkCode, states } = park;

                    const summary = {
                        "id": id,
                        "url": url,
                        "name": name,
                        "fullName": fullName,
                        "description": description,
                        "parkCode": parkCode,
                        "states": states,
                    };

                    summaries.push(summary);
                });

                data.data = summaries;

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }

            if (response.status === 401) {
                res.status(500);
                throw new Error("Internal Server Error");
            }
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get National Park Codes
 *  []
 */
router.get('/national-parks/codes', auth, async (req, res) => {
    try {
        const endpoint = 'parks';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};
        let query = `?limit=500&api_key=${NPS_API_KEY}`;

        url += query;

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();
                const parks = data.data;

                let parkCodes = [];
                let stateCodes = [];

                parks.forEach(park => {
                    let { parkCode, states } = park;

                    if (!parkCodes.includes(parkCode)) {
                        parkCodes.push(parkCode);
                    }

                    let statesArray = states.split(',');

                    statesArray.forEach(state => {
                        if (!stateCodes.includes(state)) {
                            stateCodes.push(state);
                        }
                    });
                });

                parkCodes.sort();
                stateCodes.sort();

                const codes = {
                    "parks": {
                        "total": parkCodes.length,
                        "codes": parkCodes,
                    },
                    "states": {
                        "total": stateCodes.length,
                        "codes": stateCodes,
                    }
                };

                res.status(200).send(codes);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }

            if (response.status === 401) {
                res.status(500);
                throw new Error("Internal Server Error");
            }
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Campgrounds
 *  https://will-german.github.io/excursions-api-docs/#tag/Park-Details/operation/get-campgrounds
 */
router.get('/campgrounds', auth, async (req, res) => {
    try {
        const endpoint = 'campgrounds';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }

            if (response.status === 401) {
                res.status(500);
                throw new Error("Internal Server Error");
            }
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Things To Do
 *  https://will-german.github.io/excursions-api-docs/#tag/Park-Details/operation/getThingsToDo
 */
router.get('/things-to-do', auth, async (req, res) => {
    try {
        const endpoint = 'thingstodo';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }

            if (response.status === 401) {
                res.status(500);
                throw new Error("Internal Server Error");
            }
        }

    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// -------------------- //
// #endregion           //
// -------------------- //

// ------------------ //
// #region Multimedia //
// ------------------ //

/**
 *  Get Audio
 *  https://will-german.github.io/excursions-api-docs/#tag/Multimedia/operation/get-multimedia-audio
 */
router.get('/multimedia/audio', async (req, res) => {
    try {
        const endpoint = 'multimedia/audio';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Galleries
 *  https://will-german.github.io/excursions-api-docs/#tag/Multimedia/operation/get-multimedia-galleries
 */
router.get('/multimedia/galleries', async (req, res) => {
    try {
        const endpoint = 'multimedia/galleries';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Galleries Assets
 *  https://will-german.github.io/excursions-api-docs/#tag/Multimedia/operation/get-multimedia-galleries-assets
 */
router.get('/multimedia/galleries/assets', async (req, res) => {
    try {
        const endpoint = 'multimedia/galleries/assets';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Videos
 *  https://will-german.github.io/excursions-api-docs/#tag/Multimedia/operation/get-multimedia-videos
 */
router.get('/multimedia/videos', async (req, res) => {
    try {
        const endpoint = 'multimedia/videos';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        if (!req.query.limit) {
            res.status(400);
            throw new Error("Bad Request");
        }

        let query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400);
                throw new Error("Bad Request");
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ------------------ //
// #endregion         //
// ------------------ //

module.exports = router;