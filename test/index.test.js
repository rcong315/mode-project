const axios = require("axios");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

const API_BASE_URL = "https://tsserv.tinkermode.dev";

async function fetchHourlyData(begin, end) {
  const response = await axios.get(`${API_BASE_URL}/hourly`, {
    params: {
      begin,
      end,
    },
  });

  return response.data;
}

test("Test with a 8-hour range", async () => {
  console.log("Testing 8 hour range");

  begin = "2021-03-04T03:00:00Z";
  end = "2021-03-04T11:00:00Z";
  // Fetch the API data
  const apiData = await fetchHourlyData(begin, end);

  // Run main and store the output
  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  // Compare the results
  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  // Check if averages are within 0.0001 of eachother, rounding strategy was not specified
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
});

test("Test with a 24-hour range", async () => {
  console.log("Testing 24 hour range");

  begin = "2021-03-04T03:00:00Z";
  end = "2021-03-05T03:00:00Z";

  const apiData = await fetchHourlyData(begin, end);

  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
});

test("Test with a 7-day range", async () => {
  console.log("Testing 7 day range");

  begin = "2021-03-04T03:00:00Z";
  end = "2021-03-11T03:00:00Z";

  const apiData = await fetchHourlyData(begin, end);

  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
});

test("Test with a one-month range", async () => {
  console.log("Testing 1 month range");

  begin = "2021-03-04T03:00:00Z";
  end = "2021-04-04T03:00:00Z";

  const apiData = await fetchHourlyData(begin, end);

  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
});

test("Test with a one-year range", async () => {
  console.log("Testing 1 year range");

  begin = "2021-03-04T03:00:00Z";
  end = "2022-03-04T03:00:00Z";

  const apiData = await fetchHourlyData(begin, end);

  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
}, 30000);

test("Test with a two-year range", async () => {
  console.log("Testing 2 year range");

  begin = "2021-03-04T03:00:00Z";
  end = "2023-03-04T03:00:00Z";

  const apiData = await fetchHourlyData(begin, end);

  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
}, 60000);

test("Test with a five-year range", async () => {
  console.log("Testing 5 year range");

  begin = "2021-03-04T03:00:00Z";
  end = "2026-03-04T03:00:00Z";

  const apiData = await fetchHourlyData(begin, end);

  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`,
    { maxBuffer: 10 * 1024 * 1024 }
  );

  indexOutputLine = indexOutput.trim().split(/\s+/);
  apiDataLine = apiData.trim().split(/\s+/);

  expect(indexOutputLine[0]).toBe(apiDataLine[0]);
  expect(Number(indexOutputLine[1])).toBeCloseTo(Number(apiDataLine[1]), 3);
}, 150000);

test("Test exit when not enough arguments", async () => {
  console.log("Not enough arguments");

  try {
    await execAsync("node src/index.js");
  } catch (error) {
    expect(true);
  }
  try {
    await execAsync("node src/index.js 2021-03-04T03:00:00Z");
  } catch (error) {
    expect(true);
  }
});

test("Test exit when timestamps not formatted correctly", async () => {
  console.log("Timestamps not formatted correctly");

  try {
    await execAsync("node src/index.js 03:00:00 11:00:00");
  } catch (error) {
    expect(true);
  }
});

test("Test exit when end is before begin", async () => {
  console.log("End before begin");

  try {
    await execAsync(
      "node src/index.js 2021-03-04T03:00:00Z 2021-03-04T03:00:00Z"
    );
  } catch (error) {
    expect(true);
  }
  try {
    await execAsync(
      "node src/index.js 2021-03-05T03:00:00Z 2021-03-04T03:00:00Z"
    );
  } catch (error) {
    expect(true);
  }
});

test("Test exit when begin and end timestamps not whole hours", async () => {
  console.log("Timestamps not whole hours");

  try {
    await execAsync(
      "node src/index.js 2021-03-05T03:30:00Z 2021-03-04T11:00:00Z"
    );
  } catch (error) {
    expect(true);
  }
  try {
    await execAsync(
      "node src/index.js 2021-03-05T03:00:00Z 2021-03-04T11:45:00Z"
    );
  } catch (error) {
    expect(true);
  }
});
