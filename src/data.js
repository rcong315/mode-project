const axios = require("axios");
const moment = require("moment");

async function* fetchLines(url) {
  // Make a GET request with responseType set to "stream"
  const response = await axios.get(url, { responseType: "stream" });
  let leftover = "";

  // Iterate through the chunks in the response data
  for await (const chunk of response.data) {
    // Combine the leftover data from the previous chunk with the current chunk and split it into lines
    const lines = (leftover + chunk.toString()).split("\n");
    // Set aside the last line, as it may be incomplete
    leftover = lines.pop();

    // Yield each complete line
    for (const line of lines) {
      yield line;
    }
  }

  // If there's any leftover data after processing all chunks, yield it
  if (leftover) {
    yield leftover;
  }
}

async function* fetchData(begin, end) {
  end = moment(end).endOf("hour").toISOString();
  // Fetch data points from the server and parse them into an array of objects
  const url = `https://tsserv.tinkermode.dev/data?begin=${begin}&end=${end}`;

  // Iterate through the lines fetched from the server
  for await (const line of fetchLines(url)) {
    // Split each line into timestamp and value, and add them as an object to the dataPoints array
    const [timestamp, value] = line.split(/\s+/);
    yield { timestamp, value: parseFloat(value) };
  }
}

async function* processTimeSeriesData(dataPoints) {
  let currentHour;
  let currentSum = 0;
  let currentCount = 0;

  // Iterate through the data points using an async iterator
  for await (const { timestamp, value } of dataPoints) {
    // Get the current hour for the data point
    const hour = moment(timestamp)
      .startOf("hour")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    // If the current hour has changed, yield the previous hourly average
    if (currentHour && currentHour !== hour) {
      if (currentCount > 0) {
        const average = currentSum / currentCount;
        yield { timestamp: currentHour, average };
      }

      // Reset the current sum and count for the new hour
      currentSum = 0;
      currentCount = 0;
    }

    // Update the current hour, sum, and count with the new data point
    currentHour = hour;
    currentSum += value;
    currentCount++;
  }

  // Yield the final hourly average
  if (currentCount > 0) {
    const average = currentSum / currentCount;
    yield { timestamp: currentHour, average };
  }
}

async function main(begin, end) {
  try {
    // Fetch data points from the server
    const dataPoints = fetchData(begin, end);

    // Process the time series data and compute hourly averages
    const averages = processTimeSeriesData(dataPoints);

    // Print the hourly averages to the console
    for await (const { timestamp, average } of averages) {
      let spaces = " ";
      if (average < 100) {
        spaces += " ";
      }
      console.log(`${timestamp}${spaces}${average.toFixed(4)}`);
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { main };
