import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from "./components/MainDashboard";
import AWSMetrics from "./components/AWSMetrics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route
          path="/ec2"
          element={<AWSMetrics resourceType="EC2" metricName="CPUUtilization" namespace="AWS/EC2" dimensionName="InstanceId" dimensionValue={import.meta.env.VITE_EC2_INSTANCE_ID} />}
        />
        <Route
          path="/rds"
          element={<AWSMetrics resourceType="RDS" metricName="CPUUtilization" namespace="AWS/RDS" dimensionName="DBInstanceIdentifier" dimensionValue={import.meta.env.VITE_RDS_INSTANCE_ID} />}
        />
        <Route
          path="/rds/memory"
          element={<AWSMetrics resourceType="RDS" metricName="FreeableMemory" namespace="AWS/RDS" dimensionName="DBInstanceIdentifier" dimensionValue={import.meta.env.VITE_RDS_INSTANCE_ID} />}
        />
        <Route
          path="/s3"
          element={<AWSMetrics 
            resourceType="S3" 
            metricName="BucketSizeBytes" 
            namespace="AWS/S3"
            dimensionName={["BucketName", "StorageType"]}
            dimensionValue={[import.meta.env.VITE_S3_BUCKET_NAME, "StandardStorage"]}
          />}
        />
        <Route
          path="/s3/requests"
          element={<AWSMetrics 
            resourceType="S3" 
            metricName="NumberOfObjects" 
            namespace="AWS/S3"
            dimensionName={["BucketName", "StorageType"]}
            dimensionValue={[import.meta.env.VITE_S3_BUCKET_NAME, "AllStorageTypes"]}
          />}
        />
        <Route
          path="/lambda"
          element={<AWSMetrics resourceType="Lambda" metricName="Invocations" namespace="AWS/Lambda" dimensionName="FunctionName" dimensionValue="your-lambda-function-name" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
