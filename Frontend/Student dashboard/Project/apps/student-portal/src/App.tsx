import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { DashboardV2 } from './pages/Dashboard/DashboardV2';

// Placeholder components for navigation
const TrackBusPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold mb-4">📍 Track Bus</h1>
    <p className="text-gray-600">Live bus tracking feature</p>
  </div>
);

const TripHistoryPage = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold mb-4">📋 Trip History</h1>
    <p className="text-gray-600">Your past journeys</p>
  </div>
);

const ReportIssuePage = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold mb-4">🆘 Report Issue</h1>
    <p className="text-gray-600">Submit a complaint or feedback</p>
  </div>
);

const ProfilePage = () => (
  <div className="p-8 text-center">
    <h1 className="text-3xl font-bold mb-4">👤 My Profile</h1>
    <p className="text-gray-600">Your account details</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardV2 />} />
        <Route path="/track-bus" element={<TrackBusPage />} />
        <Route path="/trip-history" element={<TripHistoryPage />} />
        <Route path="/report-issue" element={<ReportIssuePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
