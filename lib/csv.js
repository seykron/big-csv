/** Fast CSV parser that reads binary buffered data.
 */
module.exports = function CSV(options) {

  const debug = require("debug")("csv");
  const Readable = require("stream").Readable;
  const BufferedFileReader = require("./buffered_file_reader");
  const Parser = require("./parser");

  return {
    parseFile: (file) => {
      var dataReader = new BufferedFileReader(file, options).read();
      var parser = new Parser(dataReader, options).parse();

      return new Readable({
        objectMode: true,
        read: function (size) {
          var i;
          var it;

          for (i = 0; i < size; i++) {
            it = parser.next();
            this.push((it && it.value) || null);
          }
        }
      });
    }
  };
};
