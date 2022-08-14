const fetch = (...args) => import('node-fetch').then(({
    default: fetch
}) => fetch(...args));

let redirectCount = 0;

const checkRedirects = async (url) => {
    let domain = await fetch(url);
    let status = await domain.status;
    if (status == 301 || status == 302) {
        redirectCount++;
        await checkRedirects(url);
    }

    setTimeout(async () => {
        return redirectCount;
    });
};

module.exports = checkRedirects;