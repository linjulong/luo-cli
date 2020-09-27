const list = require("./list");
const chalk = require("chalk");
const logSymbols = require("log-symbols");

module.exports = function (value) {
    let downloadList = list.map(
        (item) => `${logSymbols.success} ${item.name}`
    );
    console.log(chalk.green(downloadList.join("\n")), "\n");
};