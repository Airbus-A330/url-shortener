const makeId = async (length) => {
  let mongoose = require("mongoose");
  let URLs = mongoose.model("URLs", require("../Config/schemas.js").urlSchema, "urls");
  
  const genId = (length) => {
    let result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            characters.length));
    }
    return result;
  };

  let id = genId(length);
  let url = await URLs.findById(id);

  if (!url) {
    return id;
  } else {
    await makeId(length)
  }
}

module.exports = makeId;