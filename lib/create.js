const program = require('commander')
const inquirer = require("inquirer");
const glob = require("glob");
const list = glob.sync("*");
const logSymbols = require("log-symbols");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
program.usage("<project-name>").parse(process.argv);
const downloadParams = require("../options/list");
const download = require("../lib/download");
const rootName = path.basename(process.cwd());

let projectName = program.args[0] || '';

//判断有没有直接输入参数
(async () => {
    //取到项目名称
    let projectMsg = await getInquirer();
    projectName = projectMsg.projectName;
    // if (!program.args.length) {
    //     projectName = projectMsg.projectName;
    // } else {
    //     projectName = program.args[0];
    // }

    //判断当前目录是否存在了
    const projectRoot = await checkProjectName(projectName);
    if (!projectRoot) return;

    try {
        let downloadItem = await getTemplateName();

        if (projectRoot !== ".") {
            fs.mkdirSync(projectRoot);
        }

        const downloadRoot = await download(projectRoot, downloadItem.url);

        const packagejsonPath = `${projectRoot}/package.json`;

        if (fs.existsSync(packagejsonPath)) {
            let packageJson = JSON.parse(fs.readFileSync(packagejsonPath));
            packageJson.version = projectMsg.projectVersion;
            packageJson.name = projectMsg.projectName;
            fs.writeFileSync(packagejsonPath, JSON.stringify(packageJson, null, 4));
        }

        console.log(logSymbols.success, chalk.yellow("下载成功:)"));
        console.log(chalk.green(" cd " + downloadRoot), "\n");

        const readmePath = `${projectRoot}/README.md`;
        if (fs.existsSync(readmePath)) {
            let readmeStr = fs.readFileSync(readmePath, "utf8");
            console.log(chalk.whiteBright(readmeStr));
        }
    } catch (error) {
        console.error(logSymbols.error, chalk.red(`${error}`));
    }
})()


function getInquirer() {
    return inquirer.prompt([{
        name: "projectName",
        message: "project name",
        default: projectName || "project"
    }, {
        name: "projectVersion",
        message: "项目版本号",
        default: "1.0.0",
    }]);
}

function getTemplateName() {
    return inquirer
        .prompt({
            type: "list",
            name: "template",
            message: "请选择模板",
            choices: downloadParams,
        })
        .then(({
            template = ""
        }) => {
            return downloadParams.find(({
                value
            }) => value === template);
        });
}

function checkProjectName(projectName) {
    let next = null;
    if (list.length) {
        if (
            list.filter((name) => {
                const fileName = path.resolve(process.cwd(), path.join(".", name));
                const isDir = fs.statSync(fileName).isDirectory();
                return name.indexOf(projectName) !== -1 && isDir;
            }).length !== 0
        ) {
            console.error(logSymbols.error, chalk.red(`项目${projectName}已经存在`));
            return Promise.resolve(false);
        }
        next = Promise.resolve(projectName);
    } else if (rootName === projectName) {
        next = inquirer
            .prompt([{
                name: "buildInCurrent",
                message: "当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？",
                type: "confirm",
                default: true,
            }, ])
            .then((answer) => {
                return Promise.resolve(answer.buildInCurrent ? "." : projectName);
            });
    } else {
        next = Promise.resolve(projectName);
    }

    return next;
}