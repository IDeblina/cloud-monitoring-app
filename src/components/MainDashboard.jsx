import { Button, Grid, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MainDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container style={{ textAlign: "center", paddingTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        AWS Cloud Monitoring Dashboard
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item>
          <Button variant="contained" color="primary" onClick={() => navigate("/ec2")}>
            EC2 CPU Monitoring
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={() => navigate("/rds")}>
            RDS CPU Usage
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="secondary" onClick={() => navigate("/rds/memory")}>
            RDS Memory Usage
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="success" onClick={() => navigate("/s3")}>
            S3 Storage Size
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="info" onClick={() => navigate("/s3/requests")}>
            S3 Object Count
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" color="warning" onClick={() => navigate("/lambda")}>
            Lambda Monitoring
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MainDashboard;
