# Richard Cong May 4, 2023 
## MODE Coding Exercise

# To run:
```
npm start <begin> <end>
```

# To test:
```
npm test
```

# Results:
8 hours (2021-03-04T03:00:00Z - 2021-03-04T11:00:00Z): ~500ms
24 hours (2021-03-04T03:00:00Z - 2021-03-05T03:00:00Z): ~500ms
7 days (2021-03-04T03:00:00Z - 2021-03-11T03:00:00Z): ~800ms
1 month (2021-03-04T03:00:00Z - 2021-04-04T03:00:00Z): ~1800ms
1 year (2021-03-04T03:00:00Z - 2022-03-04T03:00:00Z): ~15 seconds
2 years (2021-03-04T03:00:00Z - 2023-03-04T03:00:00Z): ~30 seconds
5 years (2021-03-04T03:00:00Z - 2026-03-04T03:00:00Z): ~75 seconds

# Notes
-To avoid reading all data points into memory and keeping all calculated buckets in memory, I used async generators and processed the data points one by one. 
-```processTimeSeriesData``` yields an object containing the timestamp and the average value for each hour, instead of storing all hourly averages in memory. -```main``` iterates over the async generator and prints the hourly averages one by one.