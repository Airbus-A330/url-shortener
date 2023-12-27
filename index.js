const config = require("./Config/config.js");
const RL = require("./Functions/ratelimit.js");

const express = require("express");
const {
    Sequelize,
    DataTypes
} = require('sequelize');
const bodyParser = require("body-parser");
const pc = require("picocolors");

require("dotenv").config();

const app = express();
const sequelize = new Sequelize('sqlite::memory:');

app.use(bodyParser.json());

const creationRL = new RL({
    limit: config.ratelimits.creation.limit,
    reset: config.ratelimits.creation.reset,
});
const viewingRL = new RL({
    limit: config.ratelimits.viewing.limit,
    reset: config.ratelimits.viewing.reset,
});

(async () => {
    Object.keys(require("./Config/schemas")).forEach((key) => {
        [key] = sequelize.define(key,
            require("./Config/schemas")[key], {
                createdAt: "created_at"
            }
        );
    });

    await sequelize.sync({
        force: true
    });
})();

app.get("/", async (req, res) => {
    res.redirect("https://github.com/Airbus-A330/url-shortener");
});

app.get("/:code", async (req, res) => {
    if (!viewingRL.canUse(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'])) {
        res.status(429).send({
            status: 429,
            message: "You are accessing this endpoint way too quickly!"
        });
        return;
    }

    if (!req.params.code) {
        res.status(400).send({
            message: "You are missing the shortened code."
        })
        return;
    }

    try {
        let url = await URLs.findByPk(req.params.code);

        if (!url) {
            res.status(404).send({
                status: 404,
                message: "This shortened URL couldn't be found."
            });
            return;
        }

        if (!url) {
            res.status(404).send({
                status: 404,
                message: "This shortend URL couldn't be found."
            });
            return;
        }

        if (url.flagged) {
            res.status(403).send({
                status: 403,
                message: "This shortend URL has been flagged by the system for the following reason: " + url.comments
            });
            await console.log(
                pc.blue(pc.bold('[API]:')) +
                ' Flagged URL visited: ' + pc.gray(url.redirect_uri)
            );
            return;
        }

        if (config.url.checkLink) {
            let domainCheck = await require("./Functions/checkHarmful")(url.redirect_uri);
            if (domainCheck.matches) {
                res.status(403).send({
                    status: 403,
                    message: `This URL has been flagged as an unsafe URL. As a result it cannot be visited using this service and should not be visited in general.`
                });

                await console.log(
                    pc.red(pc.bold('[SafeBrowsing]:')) +
                    ' Harmful URL detected and flagged: ' + pc.gray(url.redirect_uri)
                );

                await URLs.findOneAndUpdate({
                    _id: url._id
                }, {
                    $set: {
                        flagged: true,
                        comments: `Automatically flagged at ${new Date().toLocaleString()} by Google SafeBrowsing API.`
                    }
                }, {
                    new: true,
                    upsert: false
                }).exec();
                return;
            }
        }

        res.redirect(url.redirect_uri);
        await console.log(
            pc.blue(pc.bold('[API]:')) +
            ' Redirect URL requested: ' + pc.gray(url.redirect_uri)
        );

        viewingRL.increment(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for']);
    } catch (error) {
        console.log(error.stack)
        res.status(500).send({
            status: 500,
            message: "Internal server error."
        });
    }
});

app.post("/urls", async (req, res) => {
    if (!creationRL.canUse(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'])) {
        res.status(429).send({
            status: 429,
            message: "You are accessing this endpoint way too quickly!"
        });
        return;
    }
    if (!req.body.url) {
        res.status(400).send({
            status: 404,
            message: "You are missing the 'url' body parameter."
        });
        return;
    }

    if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(req.body.url)) {
        res.status(400).send({
            status: 400,
            message: "The URL must be in URL form (include http:// or https://)."
        });
        return;
    }

    if (config.url.checkLink) {
        let domainCheck = await require("./Functions/checkHarmful")(req.body.url);

        if (domainCheck.matches) {
            res.status(400).send({
                status: 400,
                message: "This URL has been flagged as a potentially unsafe URL and cannot be submitted."
            });

            await console.log(
                pc.red(pc.bold('[SafeBrowsing]:')) +
                ' Harmful URL submission attempt: ' + pc.gray(url.redirect_uri)
            );
            return;
        }
    }

    if (config.url.maximumRedirects !== 0) {
        let count = require("./Functions/checkRedirect.js")(req.body.url);
        if (count > config.url.maximumRedirects) {
            res.status(400).send({
                status: 400,
                message: `Your URL redirects more than the allotted maximum of ${config.url.maximumRedirects} redirects.`
            });

            await console.log(
                pc.yellow(pc.bold('[Validator]:')) +
                ' URL that redirected ' + count + 'times detected: ' + pc.gray(url.redirect_uri)
            );
            return;
        }
    }

    if (!config.url.allowMultipleEntries) {
        let url = await URLs.findOne({
            where: {
                redirect_uri: req.body.url
            }
        });

        if (url) {
            res.status(400).send({
                status: 400,
                message: `This URL already exists! The shortened URL for this link is: ${req.originalUrl.replace(/\/urls\/\w+/g, "").replace("/urls", "")}${url._id}.`
            });

            await console.log(
                pc.yellow(pc.bold('[Validator]:')) +
                ' Pre-existing URL detected: ' + pc.gray(url.redirect_uri)
            );
            return;
        }
    }

    let id = await require("./Functions/idGen.js")(config.id.length);

    const urlEntity = await URLs.create({
        _id: id,
        redirect_uri: req.body.url,
        ip: req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for'],
        flagged: false,
        comments: "",
        created_at: Date.now()
    });

    res.status(200).send({
        status: 200,
        message: "The shortened URL path has been successfully created!",
        code: id,
        retain: config.retain
    });

    await console.log(
        pc.blue(pc.bold('[API]:')) +
        ' URL created: ' + pc.gray(urlEntity.redirect_uri)
    );

    creationRL.increment(req.headers['cf-connecting-ip'] ?? req.headers['x-forwarded-for']);
});

if (config.retain > 0) {
    setInterval(async () => {
        try {
            let urls = await URLs.findAll();

            for (const url of urls) {
                if ((url.created_at.getTime() + config.retain) < Date.now()) {
                    await url.destroy();
                    await console.log(
                        pc.pink(pc.bold('[Worker]:')) +
                        ' URL purged due to retention rules: ' + pc.gray(url._id)
                    );
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, 5 * 60 * 1000);
}

app.listen(8080, () => {
    console.log(
        pc.blue(pc.bold('[API]:')) +
        ' API successfully deployed!'
    );
});