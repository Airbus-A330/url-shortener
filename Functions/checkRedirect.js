const fetch = (...args) => import('node-fetch').then(({
    default: fetch
}) => fetch(...args));

const checkRedirects = async (url, count = 0) => {
    let domain = await fetch(url);
    let status = await domain.status;

    if (!(status == 301 || status == 302)) {
        return count;
    }

    await checkRedirects(url, count++);
}

module.exports = checkRedirects;