import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../pages/Landingcss.css";

const Sidebar = ({ activePage = "" }) => {
  const navigate = useNavigate();
  const clientId = localStorage.getItem("authenticatedClientId");
  const userRole = localStorage.getItem("userRole");
  const coachSpecialty = localStorage.getItem("coachSpecialty");
  const [hasUnread, setHasUnread] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    workouts: ["workoutlogs", "workoutplan", "exercise-library", "steps", "customexercise"].includes(activePage),
    meals: ["mealtracker", "logmeal", "editmeal"].includes(activePage),
    coachMeals: ["assignmealplan", "addmealstoplan", "editmealsfromplan"].includes(activePage),
    coachWorkouts: ["assignworkoutplan", "addworkoutstoplan", "editworkoutsfromplan"].includes(activePage),
  });

  // Everyone is a client. Additional roles stack on top.
  const isCoach = userRole === "coach" || userRole === "nutritionist";
  const isAdmin = userRole === "admin";
  // Admins can also have coach specialty
  const hasCoachRole =
    isCoach ||
    (isAdmin &&
      (coachSpecialty === "fitness" ||
        coachSpecialty === "nutrition" ||
        coachSpecialty === "both"));
  const canAssignMeals =
    coachSpecialty === "nutrition" || coachSpecialty === "both";
  
  const canAssignWorkouts =
    coachSpecialty === "fitness" || coachSpecialty === "both";

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/notifications/unread-count/${clientId}`);
        const data = await res.json();
        setHasUnread(data.success && data.unread_count > 0);
      } catch {}
    };
    if (clientId) checkUnread();
  }, [clientId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/LoginPage/");
  };

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Coaches go to CoachLanding as their primary dashboard
  const dashboardPath = isCoach
    ? `/CoachLanding/${clientId}`
    : `/LandingPage/${clientId}`;

  return (
    <nav className="sidebar">
      <div className="brand-logo">BitFit</div>

      {/* ── Client routes (everyone) ── */}
      <span className="nav-section-label">Main</span>
      <ul className="nav-list">
        <li
          className={`nav-item${activePage === "dashboard" ? " active" : ""}`}
          onClick={() => navigate(dashboardPath)}
        >
          Dashboard
        </li>
        <li
          className={`nav-item${activePage === "notifications" ? " active" : ""}`}
          onClick={() => navigate(`/NotificationsPage/${clientId}`)}
        >
          Notifications{hasUnread && <span className="notification-dot" />}
        </li>
        <li
          className={`nav-item${activePage === "mycoach" ? " active" : ""}`}
          onClick={() => navigate(`/MyCoach/${clientId}`)}
        >
          My Coach
        </li>
        <li
          className={`nav-item nav-parent${["workoutlogs", "workoutplan", "exercise-library", "steps", "customexercise"].includes(activePage) ? " active" : ""}`}
          onClick={() => toggleMenu("workouts")}
        >
          <span>Workouts</span>
          <span className={`nav-caret${openMenus.workouts ? " open" : ""}`}>▾</span>
        </li>
        {openMenus.workouts && (
          <ul className="nav-sublist">
            <li
              className={`nav-item nav-subitem${activePage === "workoutlogs" ? " active" : ""}`}
              onClick={() => navigate(`/WorkoutLogPage/${clientId}`)}
            >
              Workout Logs
            </li>
            <li
              className={`nav-item nav-subitem${activePage === "workoutplan" ? " active" : ""}`}
              onClick={() => navigate(`/WorkoutPlan/${clientId}`)}
            >
              Workout Plan
            </li>
            <li
              className={`nav-item nav-subitem${activePage === "exercise-library" ? " active" : ""}`}
              onClick={() => navigate(`/WorkoutSearchPage/${clientId}`)}
            >
              Exercise Library
            </li>
            <li
              className={`nav-item nav-subitem${activePage === "steps" ? " active" : ""}`}
              onClick={() => navigate(`/StepsTracker/${clientId}`)}
            >
              Steps Tracker
            </li>
            <li
              className={`nav-item nav-subitem${activePage === "customexercise" ? " active" : ""}`}
              onClick={() => navigate(`/CustomExercise/${clientId}`)}
            >
              Custom Exercises
            </li>
          </ul>
        )}
        <li
          className={`nav-item nav-parent${["mealtracker", "logmeal", "editmeal"].includes(activePage) ? " active" : ""}`}
          onClick={() => toggleMenu("meals")}
        >
          <span>Meal Tracker</span>
          <span className={`nav-caret${openMenus.meals ? " open" : ""}`}>▾</span>
        </li>
        {openMenus.meals && (
          <ul className="nav-sublist">
            <li
              className={`nav-item nav-subitem${activePage === "mealtracker" ? " active" : ""}`}
              onClick={() => navigate(`/MealTrackPage/${clientId}`)}
            >
              Meal Overview
            </li>
            <li
              className={`nav-item nav-subitem${activePage === "logmeal" ? " active" : ""}`}
              onClick={() => navigate(`/LogTodaysMeal/${clientId}`)}
            >
              Log Today&apos;s Meal
            </li>
            <li
              className={`nav-item nav-subitem${activePage === "editmeal" ? " active" : ""}`}
              onClick={() => navigate(`/EditTodaysMeal/${clientId}`)}
            >
              Edit Today&apos;s Meals
            </li>
          </ul>
        )}

        <span className="nav-section-label">Insights</span>
        <li
          className={`nav-item${activePage === "moodtracker" ? " active" : ""}`}
          onClick={() => navigate(`/MoodTrackPage/${clientId}`)}
        >
          Mood Tracker
        </li>
        <li
          className={`nav-item${activePage === "messages" ? " active" : ""}`}
          onClick={() => navigate(`/MessagingPage/${clientId}`)}
        >
          Messages
        </li>
        <li
          className={`nav-item${activePage === "analytics" ? " active" : ""}`}
          onClick={() => navigate(`/Analytics/${clientId}`)}
        >
          Analytics
        </li>
        <li
          className={`nav-item${activePage === "subscriptions" ? " active" : ""}`}
          onClick={() => navigate(`/SubscriptionPage/${clientId}`)}
        >
          Subscriptions
        </li>

        {/* ── Coach routes (coach / nutritionist / admin-with-specialty) ── */}
        {hasCoachRole && (
          <>
            <span className="nav-section-label">Coach</span>
            {canAssignWorkouts && (
              <>
                <li
                  className={`nav-item nav-parent${["assignworkoutplan", "addworkoutstoplan", "editworkoutsfromplan"].includes(activePage) ? " active" : ""}`}
                  onClick={() => toggleMenu("coachWorkouts")}
                >
                  <span>Client Workout Plans</span>
                  <span className={`nav-caret${openMenus.coachWorkouts ? " open" : ""}`}>▾</span>
                </li>
                {openMenus.coachWorkouts && (
                  <ul className="nav-sublist">
                    <li
                      className={`nav-item nav-subitem${activePage === "assignworkoutplan" ? " active" : ""}`}
                      onClick={() => navigate(`/AssignWorkoutPlan/${clientId}`)}
                    >
                      Assign Workout Plan
                    </li>
                    <li
                      className={`nav-item nav-subitem${activePage === "addworkoutstoplan" ? " active" : ""}`}
                      onClick={() => navigate(`/AddWorkoutstoPlan/${clientId}`)}
                    >
                      Add Workouts
                    </li>
                    <li
                      className={`nav-item nav-subitem${activePage === "editworkoutsfromplan" ? " active" : ""}`}
                      onClick={() => navigate(`/EditWorkoutsfromPlan/${clientId}`)}
                    >
                      Edit/Delete Workouts
                    </li>
                  </ul>
                )}
              </>
            )}
            
            {canAssignMeals && (
              <>
                <li
                  className={`nav-item nav-parent${["assignmealplan", "addmealstoplan", "editmealsfromplan"].includes(activePage) ? " active" : ""}`}
                  onClick={() => toggleMenu("coachMeals")}
                >
                  <span>Client Meal Plans</span>
                  <span className={`nav-caret${openMenus.coachMeals ? " open" : ""}`}>▾</span>
                </li>
                {openMenus.coachMeals && (
                  <ul className="nav-sublist">
                    <li
                      className={`nav-item nav-subitem${activePage === "assignmealplan" ? " active" : ""}`}
                      onClick={() => navigate(`/AssignMealPlan/${clientId}`)}
                    >
                      Assign Meal Plan
                    </li>
                    <li
                      className={`nav-item nav-subitem${activePage === "addmealstoplan" ? " active" : ""}`}
                      onClick={() => navigate(`/AddMealstoPlan/${clientId}`)}
                    >
                      Add Meals
                    </li>
                    <li
                      className={`nav-item nav-subitem${activePage === "editmealsfromplan" ? " active" : ""}`}
                      onClick={() => navigate(`/EditMealsfromPlan/${clientId}`)}
                    >
                      Edit/Delete Meals
                    </li>
                  </ul>
                )}
              </>
            )}
            <li
              className={`nav-item${activePage === "myreviews" ? " active" : ""}`}
              onClick={() => navigate(`/SeeMyReviews/${clientId}`)}
            >
              My Reviews
            </li>
          </>
        )}

        {/* ── Admin routes ── */}
        {isAdmin && (
          <>
            <span className="nav-section-label">Admin</span>
            <li
              className={`nav-item${activePage === "admindashboard" ? " active" : ""}`}
              onClick={() => navigate(`/AdminAnalytics/${clientId}`)}
            >
              Admin Dashboard
            </li>
            <li
              className={`nav-item${activePage === "usermanagement" ? " active" : ""}`}
              onClick={() => navigate(`/AdminUsers/${clientId}`)}
            >
              User Management
            </li>
            <li
              className={`nav-item${activePage === "coachreports" ? " active" : ""}`}
              onClick={() => navigate(`/AdminReports/${clientId}`)}
            >
              Coach Reports
            </li>
            <li
              className={`nav-item${activePage === "coachapplications" ? " active" : ""}`}
              onClick={() => navigate(`/AdminCoachApplications/${clientId}`)}
            >
              Coach Applications
            </li>
          </>
        )}

        {/* ── Account routes (everyone) ── */}
        <span className="nav-section-label">Account</span>
        <li
          className={`nav-item${activePage === "billing" ? " active" : ""}`}
          onClick={() => navigate(`/BillingPage/${clientId}`)}
        >
          Billing &amp; Invoices
        </li>
        <li
          className={`nav-item${activePage === "profile" ? " active" : ""}`}
          onClick={() => navigate(`/UserProfile/${clientId}`)}
        >
          My Profile
        </li>
        <li
          className={`nav-item${activePage === "notification-settings" ? " active" : ""}`}
          onClick={() => navigate(`/NotificationSettings/${clientId}`)}
        >
          Notification Settings
        </li>
        <li
          className={`nav-item${activePage === "report-user" ? " active" : ""}`}
          onClick={() => navigate(`/ReportUserPage/${clientId}`)}
        >
          Report User
        </li>
      </ul>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
