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
 *  [docs link]
 *  [nps docs link]
 */
router.get('/national-parks', auth, async (req, res) => {
    try {
        const endpoint = 'parks';
        let url = `${NPS_API_URL}/${endpoint}`;

        let options = {};
        let query = "";

        if (!req.query.limit) {
            query += `$limit=1`;
        }

        query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();
                return res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                return res.status(400).send("Unable to retrieve the requested resource.");
            }

            // NOTE: Returns a 500 status to the client because the server exclusive NPS API key is invalid and there is nothing the client can do to fix this.
            if (response.status === 401) {
                return res.status(500).send("Server encountered an unexpected error. Please try again.");
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get National Park Codes
 *  [docs link]
 *  [nps docs link]
 */
router.get('/national-parks/codes', auth, async (req, res) => {
    try {
        const endpoint = 'parks';
        let url = `${NPS_API_URL}/${endpoint}`;

        let options = {};
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

                return res.status(200).send(codes);
            }
        } else {
            if (response.status === 400) {
                return res.status(400).send("Unable to retrieve requested resource.");
            }

            // NOTE: Returns a 500 status to the client because the server exclusive NPS API key is invalid and there is nothing the client can do to fix this.
            if (response.status === 401) {
                return res.status(500).send("Server encountered an unexpected error. Please try again.");
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Campgrounds
 *  [docs link]
 *  [nps docs link]
 */
router.get('/campgrounds', auth, async (req, res) => {
    try {
        const endpoint = 'campgrounds';
        let url = `${NPS_API_URL}/${endpoint}`;

        let options = {};
        let query = "";

        if (!req.query.limit) {
            query += `$limit=1`;
        }

        query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();
                return res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                return res.status(400).send("Unable to retrieve the requested resource.");
            }

            // NOTE: Returns a 500 status to the client because the server exclusive NPS API key is invalid and there is nothing the client can do to fix this.
            if (response.status === 401) {
                return res.status(500).send("Server encountered an unexpected error. Please try again.");
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

/**
 *  Get Things To Do
 *  [docs link]
 *  [nps docs link]
 */
router.get('/things-to-do', auth, async (req, res) => {
    try {
        const endpoint = 'thingstodo';
        let url = `${NPS_API_URL}/${endpoint}`;

        let options = {};
        let query = "";

        if (!req.query.limit) {
            query += `$limit=1`;
        }

        query = req._parsedUrl.search;
        query += `&api_key=${NPS_API_KEY}`;

        if (query) {
            url += query;
        }

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();
                return res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                return res.status(400).send("Unable to retrieve the requested resource.");
            }

            // NOTE: Returns a 500 status to the client because the server exclusive NPS API key is invalid and there is nothing the client can do to fix this.
            if (response.status === 401) {
                return res.status(500).send("Server encountered an unexpected error. Please try again.");
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server encountered an unexpected error. Please try again.");
    }
});

// -------------------- //
// #endregion           //
// -------------------- //

module.exports = router;