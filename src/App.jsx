import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import ProtectedRoutes from './ProtectedRoutes';

import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import UserProfile from './pages/UserProfile';
import CoachSearch from './pages/CoachSearch';
import MyCoach from './pages/MyCoach';
import CoachLanding from './pages/CoachLanding';
import MoodTrackPage from './pages/MoodTrackPage';
import WorkoutLogPage from './pages/WorkoutLogPage';
import SwitchCoach from './pages/SwitchCoach';
import MealTrackPage from './pages/MealTrackPage';
import OnboardingSurveyPage from './pages/OnboardingSurvey';
import AssignMealPlan from './pages/AssignMealPlan';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import WorkoutSearchPage from './pages/WorkoutSearchPage';
import StepsTracker from './pages/StepsTracker';
import CustomExercise from './pages/CustomExercise';
import LogTodaysMeal from './pages/LogTodaysMeal';
import EditTodaysMeal from './pages/EditTodaysMeal';
import MessagingPage from './pages/MessagingPage';
import AddMealstoPlan from './pages/AddMealstoPlan';
import DeleteMoodPage from './pages/DeleteMoodPage';
import EditMealsfromPlan from './pages/EditMealsfromPlan';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminReports from './pages/AdminReports';
import AdminCoachApplications from './pages/AdminCoachApplications';
import ReportUserPage from './pages/ReportUserPage';
import Analytics from './pages/Analytics';
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettings from './pages/NotificationSettings';
import ViewClientProgress from './pages/ViewClientProgress';
import AccountSuspended from './pages/AccountSuspended';
import SeeMyReviews from './pages/SeeMyReviews';
import BillingPage from './pages/BillingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminExerciseBank from './pages/AdminExerciseBank';
import AssignWorkoutPlan from './pages/AssignWorkoutPlan';
import AddWorkoutstoPlan from './pages/AddWorkoutstoPlan';
import EditWorkoutsfromPlan from './pages/EditWorkoutsfromPlan';


function App() {
  return (
    /*Add the routes here*/
    <Router>
      <Routes>
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/OnboardingSurvey/:clientId" element={<OnboardingSurveyPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />
        <Route path="/LandingPage/:clientId" element={<ProtectedRoutes> <LandingPage /> </ProtectedRoutes>} />
        <Route path="/UserProfile/:clientId" element={<ProtectedRoutes> <UserProfile /> </ProtectedRoutes>} />
        <Route path="/CoachSearch/:clientId" element={<ProtectedRoutes> <CoachSearch /> </ProtectedRoutes>} />
        <Route path="/WorkoutPlan/:clientId" element={<ProtectedRoutes> <WorkoutPlanPage /> </ProtectedRoutes>} />
        <Route path="/MyCoach/:clientId" element={<ProtectedRoutes> <MyCoach /> </ProtectedRoutes>} />
        <Route path="/MoodTrackPage/:clientId" element={<ProtectedRoutes> <MoodTrackPage /> </ProtectedRoutes>} />
        <Route path="/MealTrackPage/:clientId" element={<ProtectedRoutes> <MealTrackPage /> </ProtectedRoutes>} />
        <Route path="/WorkoutLogPage/:clientId" element={<ProtectedRoutes> <WorkoutLogPage /> </ProtectedRoutes>} />
        <Route path="/WorkoutSearchPage/:clientId" element={<ProtectedRoutes> <WorkoutSearchPage /> </ProtectedRoutes>} />
        <Route path="/CoachLanding/:clientId" element={<ProtectedRoutes> <CoachLanding /> </ProtectedRoutes>} />
        <Route path="/SwitchCoach/:clientId" element={<ProtectedRoutes> <SwitchCoach /> </ProtectedRoutes>} />
        <Route path="/AssignMealPlan/:clientId" element={<ProtectedRoutes> <AssignMealPlan /> </ProtectedRoutes>} />
        <Route path="/StepsTracker/:clientId" element={<ProtectedRoutes> <StepsTracker /> </ProtectedRoutes>} />
        <Route path="/CustomExercise/:clientId" element={<ProtectedRoutes> <CustomExercise /> </ProtectedRoutes>} />
        <Route path="/LogTodaysMeal/:clientId" element={<ProtectedRoutes> <LogTodaysMeal /> </ProtectedRoutes>} />
        <Route path="/EditTodaysMeal/:clientId" element={<ProtectedRoutes> <EditTodaysMeal /></ProtectedRoutes>} />
        <Route path="/MessagingPage/:clientId" element={<ProtectedRoutes> <MessagingPage /> </ProtectedRoutes>} />
        <Route path="/AddMealstoPlan/:clientId" element={<ProtectedRoutes> <AddMealstoPlan /> </ProtectedRoutes>} />
        <Route path="/DeleteMoodPage/:clientId" element={<ProtectedRoutes> <DeleteMoodPage /> </ProtectedRoutes>} />
        <Route path="/EditMealsfromPlan/:clientId" element={<ProtectedRoutes> <EditMealsfromPlan /> </ProtectedRoutes>} />
        <Route path="/AdminUsers/:clientId" element={<ProtectedRoutes> <AdminUserManagement /> </ProtectedRoutes>} />
        <Route path="/AdminReports/:clientId" element={<ProtectedRoutes> <AdminReports /> </ProtectedRoutes>} />
        <Route path="/AdminCoachApplications/:clientId" element={<ProtectedRoutes> <AdminCoachApplications /> </ProtectedRoutes>} />
        <Route path="/ReportUserPage/:clientId" element={<ProtectedRoutes><ReportUserPage/></ProtectedRoutes>}/>
        <Route path="/Analytics/:clientId" element={<ProtectedRoutes><Analytics/></ProtectedRoutes>}/>
        <Route path="/NotificationsPage/:clientId" element={<ProtectedRoutes><NotificationsPage/></ProtectedRoutes>}/>
        <Route path="/NotificationSettings/:clientId" element={<ProtectedRoutes><NotificationSettings/></ProtectedRoutes>}/>
        <Route path="/ViewClientProgress/:clientId" element={<ProtectedRoutes><ViewClientProgress/></ProtectedRoutes>}/>
        <Route path="/SeeMyReviews/:clientId" element={<ProtectedRoutes><SeeMyReviews/></ProtectedRoutes>}/>
        <Route path="/AccountSuspended" element={<AccountSuspended />} />
        <Route path="/BillingPage/:clientId" element={<ProtectedRoutes><BillingPage/></ProtectedRoutes>} />
        <Route path="/SubscriptionPage/:clientId" element={<ProtectedRoutes><SubscriptionPage/></ProtectedRoutes>} />
        <Route path="/AdminAnalytics/:clientId" element={<ProtectedRoutes><AdminAnalytics /></ProtectedRoutes>} />
        <Route path="/AdminExercises/:clientId" element={<ProtectedRoutes><AdminExerciseBank /></ProtectedRoutes>} />
        <Route path="/AssignWorkoutPlan/:clientId" element={<ProtectedRoutes> <AssignWorkoutPlan /> </ProtectedRoutes>} />
        <Route path="/AddWorkoutstoPlan/:clientId" element={<ProtectedRoutes> <AddWorkoutstoPlan /> </ProtectedRoutes>} />
        <Route path="/EditWorkoutsfromPlan/:clientId" element={<ProtectedRoutes> <EditWorkoutsfromPlan /> </ProtectedRoutes>} />




        <Route path="/" element={<Navigate to="/RegistrationPage" />} />
      </Routes>
    </Router>
  );
}

export default App
