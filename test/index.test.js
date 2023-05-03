const axios = require("axios");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

const { processTimeSeriesData } = require("../src/index.js");

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

async function compare(begin, end) {
  // Run command-line program and store the output
  const { stdout: indexOutput } = await execAsync(
    `node src/index.js ${begin} ${end}`
  );

  // Fetch the API data
  const apiData = await fetchHourlyData(begin, end);

  // Process the API data using index.js function
  const processedApiData = processTimeSeriesData(apiData);

  // Compare the results
  expect(indexOutput.trim()).toBe(processedApiData.trim());
}

test("Compare index output to API call", () => {
  const testCases = [
    {
      begin: "2021-03-04T03:00:00Z",
      end: "2021-03-04T11:00:00Z",
      description: "Test with a range of 8 hours",
    },
    {
      begin: "2021-03-04T03:00:00Z",
      end: "2021-03-05T03:00:00Z",
      description: "Test with a 24-hour range",
    },
    {
      begin: "2021-03-04T03:00:00Z",
      end: "2021-03-11T03:00:00Z",
      description: "Test with a 7-day range",
    },
    {
      begin: "2021-03-04T03:00:00Z",
      end: "2021-04-04T03:00:00Z",
      description: "Test with a one-month range",
    },
  ];

  testCases.forEach(({ begin, end, description }) => {
    compare(begin, end);
  });
});
