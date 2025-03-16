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

const EC2Metrics = () => {
  const [cpuData, setCpuData] = useState({ values: [], timestamps: [] });
  const [networkInData, setNetworkInData] = useState({ values: [], timestamps: [] });
  const [networkOutData, setNetworkOutData] = useState({ values: [], timestamps: [] });

  const fetchMetrics = async () => {
    const params = {
      MetricDataQueries: [
        {
          Id: "cpu",
          MetricStat: {
            Metric: {
              Namespace: "AWS/EC2",
              MetricName: "CPUUtilization",
              Dimensions: [{ Name: "InstanceId", Value: import.meta.env.EC2_INSTANCE_ID }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
        {
          Id: "networkIn",
          MetricStat: {
            Metric: {
              Namespace: "AWS/EC2",
              MetricName: "NetworkIn",
              Dimensions: [{ Name: "InstanceId", Value: import.meta.env.EC2_INSTANCE_ID }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
        {
          Id: "networkOut",
          MetricStat: {
            Metric: {
              Namespace: "AWS/EC2",
              MetricName: "NetworkOut",
              Dimensions: [{ Name: "InstanceId", Value: import.meta.env.EC2_INSTANCE_ID }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
      ],
      StartTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      EndTime: new Date(),
    };

    try {
      const command = new GetMetricDataCommand(params);
      const response = await cloudWatchClient.send(command);
      console.log("CloudWatch EC2 Response:", response);

      response.MetricDataResults.forEach(result => {
        const sortedTimestamps = [...result.Timestamps].sort((a, b) => new Date(a) - new Date(b));
        const timestamps = sortedTimestamps.map(time => new Date(time).toLocaleTimeString());
        const values = result.Values.slice().reverse();

        switch(result.Id) {
          case "cpu":
            setCpuData({ values, timestamps });
            break;
          case "networkIn":
            setNetworkInData({ values, timestamps });
            break;
          case "networkOut":
            setNetworkOutData({ values, timestamps });
            break;
        }
      });
    } catch (err) {
      console.error("Error fetching EC2 metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderChart = (data, title, yAxisLabel, isNetwork = false) => {
    // Calculate dynamic max value for network metrics
    let maxValue;
    if (isNetwork) {
      maxValue = Math.max(...data.values, 1);
      // Round up to nearest 500 and add padding
      maxValue = Math.ceil(maxValue / 500) * 500 + 500;
    } else {
      maxValue = 100; // For CPU percentage
    }
    
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
                      stepSize: isNetwork ? Math.ceil(maxValue / 6) : 10,
                      callback: function(value) {
                        return isNetwork ? value + ' B/s' : value + '%';
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
      <Typography variant="h4" gutterBottom align="center">EC2 Instance Monitoring</Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
        Instance ID: {import.meta.env.EC2_INSTANCE_ID}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {renderChart(cpuData, "CPU Utilization", "CPU Usage (%)")}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(networkInData, "Network In", "Bytes per Second", true)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(networkOutData, "Network Out", "Bytes per Second", true)}
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

export default EC2Metrics; 