import { Button, Grid, Container, Typography, Box, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Import AWS Service Icons from assets
import ec2Icon from "../assets/aws/aws_ec2.png";
import rdsIcon from "../assets/aws/aws_rds.png";
import lambdaIcon from "../assets/aws/aws_lambda.png";

const ServiceButton = ({ icon, label, onClick, color = "primary" }) => (
  <Button
    variant="contained"
    color={color}
    onClick={onClick}
    style={{
      padding: '15px 25px',
      minWidth: '200px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#f5f6f7',
      color: '#2c3e50',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderRadius: '8px',
      position: 'relative',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 0
      },
      '&:hover': {
        transform: 'scale(1.05) translateY(-2px)',
        backgroundColor: '#e9ecef',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.15)',
        '&:before': {
          opacity: 1,
          boxShadow: '0 0 20px 10px rgba(255, 255, 255, 0.1)'
        }
      },
      '&:active': {
        transform: 'scale(0.98)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    }}
  >
    <Box style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      padding: '8px',
      position: 'relative',
      zIndex: 1
    }}>
      <img 
        src={icon} 
        alt={`${label} icon`} 
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </Box>
    <Box style={{ 
      color: '#2c3e50', 
      fontWeight: 500,
      marginTop: '5px',
      position: 'relative',
      zIndex: 1
    }}>
      {label}
    </Box>
  </Button>
);

const MainDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box style={{ 
      backgroundColor: '#07021f',
      minHeight: '100vh',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <Container 
        style={{ 
          textAlign: "center", 
          paddingTop: "50px", 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column",
          backgroundColor: '#07021f',
          color: '#ffffff'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          style={{ 
            color: '#ffffff',
            fontWeight: 600,
            marginBottom: '2rem'
          }}
        >
          AWS Cloud Resources Monitoring Dashboard
        </Typography>
        <Grid container spacing={4} justifyContent="center" style={{ marginTop: "20px", flex: 1 }}>
          <Grid item>
            <ServiceButton
              icon={ec2Icon}
              label="EC2 Monitoring"
              onClick={() => navigate("/ec2")}
              color="primary"
            />
          </Grid>
          <Grid item>
            <ServiceButton
              icon={rdsIcon}
              label="RDS Monitoring"
              onClick={() => navigate("/rds")}
              color="secondary"
            />
          </Grid>
          <Grid item>
            <ServiceButton
              icon={lambdaIcon}
              label="Lambda Monitoring"
              onClick={() => navigate("/lambda")}
              color="warning"
            />
          </Grid>
        </Grid>
        <Box 
          component="footer" 
          style={{
            padding: "20px",
            marginTop: "auto",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: '#07021f'
          }}
        >
          <Typography variant="body2" style={{ color: '#ffffff' }}>
            Developed by{" "}
            <Link 
              href="https://github.com/Deblina" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: "#9fafff",
                textDecoration: "none",
                fontWeight: 500,
                '&:hover': {
                  textDecoration: "underline",
                  color: "#ffffff"
                }
              }}
            >
              Deblina
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MainDashboard;
