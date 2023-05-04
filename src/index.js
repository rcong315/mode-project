const { main } = require("./data.js");
const moment = require("moment");

async function parseArgs(argv) {
  // Parse command-line arguments

  if (argv.length < 4) {
    console.error("Error: node src/index.js <BEGIN_TIMESTAMP> <END_TIMESTAMP>");
    process.exit(1);
  }

  const begin = argv[2];
  const end = argv[3];

  // Validate the timestamps using moment.js
  if (
    !moment(begin, moment.ISO_8601, true).isValid() ||
    !moment(end, moment.ISO_8601, true).isValid()
  ) {
    console.error("Error: Timestamps must be in RFC3339 format.");
    process.exit(1);
  }

  if (moment(begin).isSameOrAfter(end)) {
    console.error(
      "Error: The begin timestamp must be before the end timestamp."
    );
    process.exit(1);
  }

  if (
    !moment(begin).isSame(moment(begin).startOf("hour")) ||
    !moment(end).isSame(moment(end).startOf("hour"))
  ) {
    console.error(
      "Error: Begin and end timestamps must be at the start of an hour."
    );
    process.exit(1);
  }

  main(begin, end);
}

parseArgs(process.argv);
