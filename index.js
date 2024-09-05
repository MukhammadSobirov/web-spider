const { TaskQueue } = require("./src/taskQueue")
const utilities = require("./src/utils/utilities")
const fs = require('fs');
const request = require('request');
var { mkdirp } = require('mkdirp');
var path = require('path');


const downloadQueue = new TaskQueue(2);

function spiderLinks(currentUrl, body, nesting, callback) {
    if (nesting === 0) {
        return process.nextTick(callback);
    }

    const links = utilities.getPageLinks(currentUrl, body);
    if (links.length === 0) {
        return process.nextTick(callback);
    }

    let completed = 0, errored = false;
    links.forEach(function (link) {
        downloadQueue.pushTask(function (done) {
            spider(link, nesting - 1, function (err) {
                if (err) {
                    errored = true;
                    return callback(err);
                }
                if (++completed === links.length && !errored) {
                    callback();
                }
                done();
            });
        });
    });
}

function spider(url, nesting, callback) {
    var filename = utilities.urlToFilename(url);
    fs.readFile(filename, 'utf8', function (err, body) {
        if (err) {
            if (err.code !== 'ENOENT') {
                return callback(err);
            }

            return download(url, filename, function (err, body) {
                if (err) {
                    return callback(err);
                }
                spiderLinks(url, body, nesting, callback);
            });
        }

        spiderLinks(url, body, nesting, callback);
    });
}

function saveFile(filename, contents, callback) {
    console.log(path.dirname(filename));

    mkdirp(path.dirname(filename)).then(() => {
        fs.writeFile(filename, contents, callback);
    })
}


function download(url, filename, callback) {
    console.log('Downloading ' + url);
    request(url, function (err, response, body) {
        if (err) {
            return callback(err);
        }
        saveFile(filename, body, function (err) {
            console.log('Downloaded and saved: ' + url);
            if (err) {
                return callback(err);
            }
            callback(null, body);
        });
    });
}

spider("https://www.google.com/", 5, function (err, filename, downloaded) {
    if (err) {
        console.log(err);
    } else if (downloaded) {
        console.log('Completed the download of "' + filename + '"');
    } else {
        console.log('"' + filename + '" was already downloaded');
    }
});