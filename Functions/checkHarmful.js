const fetch = (...args) => import('node-fetch').then(({
    default: fetch
}) => fetch(...args));

module.exports = async (url) => {
    let domainCheck = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.SAFE_BROWSING_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "client": {
                "clientId": require("../package.json").name,
                "clientVersion": require("../package.json").version
            },
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ALL_PLATFORMS"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{
                    "url": url
                }]
            }
        })
    });

    domainCheck = await domainCheck.json();

    return domainCheck;
}