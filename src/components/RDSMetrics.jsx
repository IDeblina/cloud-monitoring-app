import { useState, useEffect } from "react";
import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { Line } from "react-chartjs-2";
import { 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  Button, 
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow 
} from "@mui/material";
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

// AWS Clients
const cloudWatchClient = new CloudWatchClient({
  region: import.meta.env.AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.AWS_SECRET_KEY,
  },
});

const rdsClient = new RDSClient({
  region: import.meta.env.AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.AWS_SECRET_KEY,
  },
});

const RDSMetrics = () => {
  const [cpuData, setCpuData] = useState({ values: [], timestamps: [] });
  const [connectionsData, setConnectionsData] = useState({ values: [], timestamps: [] });
  const [freeMemoryData, setFreeMemoryData] = useState({ values: [], timestamps: [] });
  const [freeStorageData, setFreeStorageData] = useState({ values: [], timestamps: [] });
  const [dbInfo, setDbInfo] = useState(null);

  const fetchDBInfo = async () => {
    try {
      const command = new DescribeDBInstancesCommand({
        DBInstanceIdentifier: import.meta.env.RDS_INSTANCE_ID
      });
      const response = await rdsClient.send(command);
      console.log("RDS Instance Info:", response);
      
      if (response.DBInstances && response.DBInstances.length > 0) {
        setDbInfo(response.DBInstances[0]);
      }
    } catch (err) {
      console.error("Error fetching RDS instance info:", err);
    }
  };

  const fetchMetrics = async () => {
    const params = {
      MetricDataQueries: [
        {
          Id: "cpu",
          MetricStat: {
            Metric: {
              Namespace: "AWS/RDS",
              MetricName: "CPUUtilization",
              Dimensions: [{ Name: "DBInstanceIdentifier", Value: import.meta.env.RDS_INSTANCE_ID }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
        {
          Id: "connections",
          MetricStat: {
            Metric: {
              Namespace: "AWS/RDS",
              MetricName: "DatabaseConnections",
              Dimensions: [{ Name: "DBInstanceIdentifier", Value: import.meta.env.RDS_INSTANCE_ID }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
        {
          Id: "freeMemory",
          MetricStat: {
            Metric: {
              Namespace: "AWS/RDS",
              MetricName: "FreeableMemory",
              Dimensions: [{ Name: "DBInstanceIdentifier", Value: import.meta.env.RDS_INSTANCE_ID }],
            },
            Period: 300,
            Stat: "Average",
          },
        },
        {
          Id: "freeStorage",
          MetricStat: {
            Metric: {
              Namespace: "AWS/RDS",
              MetricName: "FreeStorageSpace",
              Dimensions: [{ Name: "DBInstanceIdentifier", Value: import.meta.env.RDS_INSTANCE_ID }],
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
      console.log("CloudWatch RDS Response:", response);

      response.MetricDataResults.forEach(result => {
        const sortedTimestamps = [...result.Timestamps].sort((a, b) => new Date(a) - new Date(b));
        const timestamps = sortedTimestamps.map(time => new Date(time).toLocaleTimeString());
        const values = result.Values.slice().reverse();

        switch(result.Id) {
          case "cpu":
            setCpuData({ values, timestamps });
            break;
          case "connections":
            setConnectionsData({ values, timestamps });
            break;
          case "freeMemory":
            // Convert bytes to MB for better readability
            const memoryValuesMB = values.map(value => Math.round(value / (1024 * 1024)));
            setFreeMemoryData({ values: memoryValuesMB, timestamps });
            break;
          case "freeStorage":
            // Convert bytes to GB for better readability
            const storageValuesGB = values.map(value => Math.round(value / (1024 * 1024 * 1024)));
            setFreeStorageData({ values: storageValuesGB, timestamps });
            break;
        }
      });
    } catch (err) {
      console.error("Error fetching RDS metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchDBInfo();
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchMetrics();
      fetchDBInfo();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderDBInfo = () => {
    if (!dbInfo) return null;

    const formatStorage = (bytes) => {
      const gb = bytes / (1024 * 1024 * 1024);
      return `${Math.round(gb)} GB`;
    };

    const infoRows = [
      { label: "Engine", value: `${dbInfo.Engine} ${dbInfo.EngineVersion}` },
      { label: "Instance Class", value: dbInfo.DBInstanceClass },
      { label: "Storage", value: formatStorage(dbInfo.AllocatedStorage * 1024 * 1024 * 1024) },
      { label: "Endpoint", value: dbInfo.Endpoint?.Address },
      { label: "Port", value: dbInfo.Endpoint?.Port },
      { label: "Status", value: dbInfo.DBInstanceStatus },
      { label: "Created", value: dbInfo.InstanceCreateTime?.toLocaleDateString() },
      { label: "Backup Retention", value: `${dbInfo.BackupRetentionPeriod} days` }
    ];

    return (
      <Card style={{ margin: "20px 0", padding: "20px" }}>
        <Typography variant="h6" gutterBottom>Database Information</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              {infoRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell component="th" scope="row" style={{ fontWeight: 'bold', width: '200px' }}>
                    {row.label}
                  </TableCell>
                  <TableCell>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  };

  const renderChart = (data, title, yAxisLabel, type = 'default') => {
    // Calculate dynamic max value based on type
    let maxValue;
    let stepSize;
    
    switch(type) {
      case 'cpu':
        maxValue = 100;
        stepSize = 10;
        break;
      case 'connections':
        maxValue = Math.max(...data.values, 1) + 5;
        stepSize = Math.max(1, Math.ceil(maxValue / 10));
        break;
      case 'memory':
      case 'storage':
        maxValue = Math.max(...data.values, 1);
        maxValue = Math.ceil(maxValue / 100) * 100; // Round to nearest 100
        stepSize = Math.max(100, Math.ceil(maxValue / 10));
        break;
      default:
        maxValue = Math.max(...data.values, 1);
        stepSize = Math.ceil(maxValue / 10);
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
                      stepSize: stepSize,
                      callback: function(value) {
                        switch(type) {
                          case 'cpu':
                            return value + '%';
                          case 'memory':
                            return value + ' MB';
                          case 'storage':
                            return value + ' GB';
                          default:
                            return value;
                        }
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
      <Typography variant="h4" gutterBottom align="center">RDS Instance Monitoring</Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
        Instance ID: {import.meta.env.RDS_INSTANCE_ID}
      </Typography>
      
      {renderDBInfo()}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {renderChart(cpuData, "CPU Utilization", "CPU Usage (%)", 'cpu')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(connectionsData, "Database Connections", "Number of Connections", 'connections')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(freeMemoryData, "Free Memory", "Memory (MB)", 'memory')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart(freeStorageData, "Free Storage Space", "Storage (GB)", 'storage')}
        </Grid>
      </Grid>

      <Button 
        variant="contained" 
        onClick={() => {
          fetchMetrics();
          fetchDBInfo();
        }} 
        style={{ display: 'block', margin: '20px auto' }}
      >
        Refresh Metrics
      </Button>
    </Container>
  );
};

export default RDSMetrics; 