big-csv
=======

Binary parser for big CSV datasets.

# Usage

```
const DATA_SOURCE = "big-dataset.csv";
const CSV = require("big-csv");

var count = 0;
var parser = new CSV().parseFile(DATA_SOURCE);

parser
  .on("data", record => count++)
  .on("end", () => console.log("finished, number of records: ", count));
```

# API

## CSV(options)

Main CSV constructor. It supports the following options for the parser:

**bufferSize**: amount of data to map into memory. Defaults to 256MB. The total
memory usage can be calculated by this value plus a small footprint required
by the parser and temporary data (~20MB). A lineal memory footprint is
guaranteed.

**delimiter**: CSV column delimiter. Defaults to ```,``` (comma).

**escape**: value escape character. Defaults to ```"``` (double quotes).

## CSV#parseFile(file)

Returns a parser for a file in the file system.

**file**: CSV file to read.

# Performance

I wrote this small library after trying the existing CSV parsers without
success. I tried the well-known [csv module](https://www.npmjs.com/package/csv)
and the other popular [fast-csv library](https://www.npmjs.com/package/fast-csv)
but both are focused in customization, while I needed to parse very huge
datasets (up to ~4GB). For big datasets, they're really slow. I looked at both
codes to try to improve the performance, but it's harder than writing a 60-lines
high performance parser.

That said, this parser is blocking in favor of performance. It reads chunks of
data of *bufferSize* size into memory and parses it directly from the buffer.
It doesn't perform any String operation which are the most cpu-expensive
operations.

# Extension

If you need a different data source, it should be easy to extend since the
parser uses a *dataReader* abstraction, a generator function that provides the
parser with chunks of data until there's no more data to read. You can look at
the default file implementation in the lib/buffered_file_reader.js file.
