
exports.getDate = function () {
const today = new Date()

const options = {
  weekday: "long", month: "long",
  day: "numeric", hour: "numeric", minute: "numeric", year: "numeric"
};

return today.toLocaleDateString("en-us", options);
}

exports.getDay = function () {
const today = new Date()

const options = {
  weekday: "long"
};

return today.toLocaleDateString("en-us", options);
}

// console.log(module.exports);
