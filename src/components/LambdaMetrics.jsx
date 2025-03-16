import { useState, useEffect } from "react";
import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { Line } from "react-chartjs-2";
import { Card, CardContent, Typography, Container, Button, Grid } from "@mui/material";
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// AWS CloudWatch Client
const cloudWatchClient = new CloudWatchClient({
  region: import.meta.env.AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.AWS_SECRET_KEY,
  },
});

const LambdaMetrics = () => {
  const [invocationsData, setInvocationsData] = useState({ values: [], timestamps: [] });
  const [durationData, setDurationData] = useState({ values: [], timestamps: [] });
  const [errorsData, setErrorsData] = useState({ values: [], timestamps: [] });

  const fetchMetrics = async () => {
    const params = {
      MetricDataQueries: [
        {
          Id: "invocations",
          MetricStat: {
            Metric: {
              Namespace: "AWS/Lambda",
              MetricName: "Invocations",
              Dimensions: [{ Name: "FunctionName", Value: import.meta.env.LAMBDA_FUNCTION_NAME }],
            },
            Period: 300,
            Stat: "Sum",
          },
        },
        {
          Id: "duration",
          MetricStat: {
            Metric: {
              Namespace: "AWS/Lambda",
              MetricName: "Duration",
              Dimensions: [{ Name: "FunctionName", Value: import.meta.env.LAMBDA_FUNCTION_NAME }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
        {
          Id: "errors",
          MetricStat: {
            Metric: {
              Namespace: "AWS/Lambda",
              MetricName: "Errors",
              Dimensions: [{ Name: "FunctionName", Value: import.meta.env.LAMBDA_FUNCTION_NAME }],
            },
            Period: 300,
            Stat: "Sum",
          },
        },
      ],
      StartTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      EndTime: new Date(),
    };

    try {
      const command = new GetMetricDataCommand(params);
      const response = await cloudWatchClient.send(command);
      console.log("CloudWatch Lambda Response:", response);

      response.MetricDataResults.forEach(result => {
        const sortedTimestamps = [...result.Timestamps].sort((a, b) => new Date(a) - new Date(b));
        const timestamps = sortedTimestamps.map(time => new Date(time).toLocaleTimeString());
        const values = result.Values.slice().reverse();

        switch(result.Id) {
          case "invocations":
            setInvocationsData({ values, timestamps });
            break;
          case "duration":
            setDurationData({ values, timestamps });
            break;
          case "errors":
            setErrorsData({ values, timestamps });
            break;
        }
      });
    } catch (err) {
      console.error("Error fetching Lambda metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderChart = (data, title, yAxisLabel, isDuration = false) => {
    // Calculate dynamic max value
    let maxValue = Math.max(...data.values, 1); // minimum of 1 to avoid empty charts
    maxValue = isDuration ? Math.ceil(maxValue / 100) * 100 : Math.ceil(maxValue);
    
    return (
      <Card style={{ margin: "20px 0", padding: "20px" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <div style={{ height: "300px", width: "100%" }}>
            <Line
              data={{
                labels: data.timestamps,
                datasets: [
                  {
                    label: title,
                    data: data.values,
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
                    max: maxValue,
                    ticks: {
                      stepSize: isDuration ? Math.ceil(maxValue / 5) : 1,
                      callback: function(value) {
                        return isDuration ? value + ' ms' : value;
                      }
                    },
                    title: {
                      display: true,
                      text: yAxisLabel
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
                    text: title
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth={false} style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom align="center">Lambda Function Monitoring</Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
        Function: {import.meta.env.LAMBDA_FUNCTION_NAME}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {renderChart(invocationsData, "Function Invocations", "Number of Invocations")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(durationData, "Execution Duration", "Duration (milliseconds)", true)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(errorsData, "Function Errors", "Number of Errors")}
        </Grid>
      </Grid>

      <Button 
        variant="contained" 
        onClick={fetchMetrics} 
        style={{ display: 'block', margin: '20px auto' }}
      >
        Refresh Metrics
      </Button>
    </Container>
  );
};

export default LambdaMetrics; 