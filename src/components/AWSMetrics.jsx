import { useState, useEffect } from "react";
import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { Line } from "react-chartjs-2";
import { Card, CardContent, Typography, Container, Button } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const cloudWatchClient = new CloudWatchClient({
  region: import.meta.env.AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.AWS_SECRET_KEY,
  },
});

const AWSMetrics = ({ resourceType, metricName, namespace, dimensionName, dimensionValue }) => {
  const [metricData, setMetricData] = useState([]);
  const [timestamps, setTimestamps] = useState([]);

  const fetchMetrics = async () => {
    const params = {
      MetricDataQueries: [
        {
          Id: "metric1",
          MetricStat: {
            Metric: {
              Namespace: namespace,
              MetricName: metricName,
              Dimensions: [{ Name: dimensionName, Value: dimensionValue }],
            },
            Period: 60, // 1-minute intervals
            Stat: "Average",
          },
        },
      ],
      StartTime: new Date(Date.now() - 60 * 60 * 1000), // Last 1 hour
      EndTime: new Date(),
    };

    try {
      const command = new GetMetricDataCommand(params);
      const response = await cloudWatchClient.send(command);
      console.log(response);

      if (response.MetricDataResults.length > 0) {
        const result = response.MetricDataResults[0];
        // Reverse the arrays to get ascending order
        const sortedTimestamps = [...result.Timestamps].sort((a, b) => new Date(a) - new Date(b));
        const sortedValues = result.Values.slice().reverse();
        setMetricData(sortedValues);
        setTimestamps(sortedTimestamps.map((time) => new Date(time).toLocaleTimeString()));
      }
    } catch (err) {
      console.error(`Error fetching ${resourceType} metrics:`, err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <Container 
      maxWidth={false}
      disableGutters
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="h4" gutterBottom>{resourceType} Monitoring</Typography>
      <Card style={{ 
        width: "90%", 
        maxWidth: "1400px",
        margin: "20px auto",
        padding: "20px",
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{metricName} (%)</Typography>
          <div style={{ height: "500px", width: "100%" }}>
            <Line
              data={{
                labels: timestamps,
                datasets: [
                  {
                    label: metricName,
                    data: metricData,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                    fill: false,
                  }
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: {
                      stepSize: 10
                    },
                    title: {
                      display: true,
                      text: 'Percentage (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Time'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top'
                  },
                  title: {
                    display: true,
                    text: `${resourceType} ${metricName}`
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
      <Button variant="contained" onClick={fetchMetrics} style={{ marginTop: "20px" }}>
        Refresh Metrics
      </Button>
    </Container>
  );
};

export default AWSMetrics;
