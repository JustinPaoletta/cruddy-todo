const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      callback(err);
      console.log('error occurred when getNextUniqueID was invoked', err);
    } else {
      var pathName = path.join(exports.dataDir, `${id}.txt`);
      fs.writeFile(pathName, text, (err) => {
        if (err) {
          throw err;
        }
        items[id] = text;
        //we commented out the line below, and our todos were still added to data file. What is this callback doing?
        callback(null, { id, text });

      });
    }
  });
};

exports.readAll = (callback) => {

  let filePath = exports.dataDir;

  fs.readdir(filePath, (err, files) => {

    if (err) {
      return callback(err);
    }

    var data = _.map(files, (file) => {
      var id = path.basename(file, '.txt');
      var ourFilePath = path.join(filePath, file);
      return readFilePromise(ourFilePath).then((fileData) => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });

    Promise.all(data).then((items) => {
      callback(null, items);
    });

  });
};

exports.readOne = (id, callback) => {

  let filePath = exports.dataDir;
  let ourFilePath = path.join(filePath, `${id}.txt`);

  fs.readFile(ourFilePath, (err, data) => {
    if (err) {
      return callback(err);
    } else {
      callback(null, { id, text: data.toString() });
    }
  });

};

exports.update = (id, text, callback) => {

  let filePath = exports.dataDir;
  let ourFilePath = path.join(filePath, `${id}.txt`);

  // we have to read our file ...if we cant theres not a valid id in the path
  fs.readFile(ourFilePath, (err, data) => {
    // if it cant read ...error
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      // if we can read it then write to it
      fs.writeFile(ourFilePath, text, (err) => {
        // if theres an error writing to it throw an error
        if (err) {
          callback(new Error(`No item with id: ${id}`));
          // otherwise callback like we did in previous functions
        } else {
          callback(null, {id: id, text: text});
        }
      });
    }
  });
};


exports.delete = (id, callback) => {

  let filePath = exports.dataDir;
  let ourFilePath = path.join(filePath, `${id}.txt`);

  fs.unlink(ourFilePath, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null);
    }
  });

};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
