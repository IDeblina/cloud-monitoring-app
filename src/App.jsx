import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from "./components/MainDashboard";
import AWSMetrics from "./components/AWSMetrics";
import EC2Metrics from "./components/EC2Metrics";
import LambdaMetrics from "./components/LambdaMetrics";
import RDSMetrics from "./components/RDSMetrics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/ec2" element={<EC2Metrics />} />
        <Route path="/lambda" element={<LambdaMetrics />} />
        <Route path="/rds" element={<RDSMetrics />} />
        <Route
          path="/s3"
          element={<AWSMetrics 
            resourceType="S3" 
            metricName="BucketSizeBytes" 
            namespace="AWS/S3"
            dimensionName="BucketName"
            dimensionValue={import.meta.env.S3_BUCKET_NAME}
          />}
        />
        <Route
          path="/rds/memory"
          element={<AWSMetrics resourceType="RDS" metricName="FreeableMemory" namespace="AWS/RDS" dimensionName="DBInstanceIdentifier" dimensionValue={import.meta.env.VITE_RDS_INSTANCE_ID} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
