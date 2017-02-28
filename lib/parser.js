module.exports = function Parser(dataReader, options) {

  const DELIMITER = (options && options.delimiter.charCodeAt(0)) ||
    ",".charCodeAt(0);
  const ESCAPE = (options && options.escape.charCodeAt(0)) ||
    "\"".charCodeAt(0);
  const CR = 0x0D;
  const LF = 0x0A;

  const debug = require("debug")("parser");

  var resolveNewLineInfo = (data) => {
    var i = 0;

    while (char = data[i++]) {
      if (char == CR && data[i] == LF) {
        return {
          delimeter: CR,
          length: 2
        };
      }
      if (char == LF) {
        return {
          delimeter: LF,
          length: 1
        };
      }
    }
  };

  var parse = function* () {

    var dataSource = dataReader.next();
    var data = dataSource.value;
    var newLineInfo = resolveNewLineInfo(data);
    var pos = 0;
    var char;
    var withinField = false;
    var fieldStart = 0;
    var record = [];

    debug("parsing first chunk");

    while(true) {
      char = data[pos++];

      if (!char) {
        debug("buffer empty");
        dataSource = dataReader.next();

        if (!dataSource.value) {
          debug("end of buffer reached");
          break;
        }

        data = dataSource.value;
        pos = 0;
        char = data[pos++];
        debug("parsing next chunk");
      }

      if ((char == ESCAPE && !withinField) ||
          (char == ESCAPE && data[pos] == DELIMITER) ||
          (char == ESCAPE && data[pos] == newLineInfo.delimeter)) {

        if (!withinField) {
          fieldStart = pos;
        }

        withinField = !withinField;
      }

      if (char == DELIMITER && !withinField) {
        record.push(data.slice(fieldStart,
          fieldStart + (pos - fieldStart) - 2).toString());
      }

      if (char == newLineInfo.delimeter && !withinField) {
        record.push(data.slice(fieldStart,
          fieldStart + (pos - fieldStart) - newLineInfo.length).toString());
      }

      if (char == newLineInfo.delimeter) {
        yield record;
        record = [];
      }
    }

    return null;
  };

  return {
    parse: () => parse()
  };
};
