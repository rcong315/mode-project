const axios = require("axios");
const moment = require("moment");

async function parseArgs(argv) {
  // Parse command-line arguments

  if (argv.length < 4) {
    console.log("Usage: node index.js <BEGIN_TIMESTAMP> <END_TIMESTAMP>");
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

  return { begin, end };
}

async function fetchData(begin, end) {
  // Fetch data from the server endpoint

  try {
    const url = `https://tsserv.tinkermode.dev/data?begin=${begin}&end=${end}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      // Assuming the response data is plain text with each line representing a data point
      const dataPoints = response.data
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [timestamp, value] = line.split(" ");
          return { timestamp, value: parseFloat(value) };
        });

      return dataPoints;
    } else {
      console.error(`Error: Server responded with status ${response.status}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Error: Failed to fetch data from server - ${err.message}`);
    process.exit(1);
  }
}

function processTimeSeriesData(data) {
  // Group data points into hourly buckets and calculate the average value

  const hourlyBuckets = {};

  data.forEach(({ timestamp, value }) => {
    const hour = moment(timestamp).startOf("hour").toISOString();

    if (!hourlyBuckets[hour]) {
      hourlyBuckets[hour] = {
        sum: 0,
        count: 0,
      };
    }

    hourlyBuckets[hour].sum += value;
    hourlyBuckets[hour].count++;
  });

  const hourlyAverages = {};

  for (const [hour, { sum, count }] of Object.entries(hourlyBuckets)) {
    hourlyAverages[hour] = sum / count;
  }

  return hourlyAverages;
}

async function main() {
  try {
    const { begin, end } = await parseArgs(process.argv);
    const data = await fetchData(begin, end);
    const hourlyAverages = processTimeSeriesData(data);

    for (const [timestamp, average] of Object.entries(hourlyAverages)) {
      console.log(`${timestamp} ${average.toFixed(4)}`);
    }
  } catch (err) {
    console.error(err);
  }
}

// main();

module.exports.processTimeSeriesData = processTimeSeriesData;
