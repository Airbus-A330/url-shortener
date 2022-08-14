module.exports = {
  id: {
    length: 8
  },
  url: {
    allowMultipleEntries: false,
    checkLink: true,
    maximumRedirects: 3,
    retain: 0
  },
  ratelimits: {
    creation: {
      limit: 5,
      reset: 15 * 1000
    },
    viewing: {
      limit: 5,
      reset: 5 * 1000
    }
  }
}