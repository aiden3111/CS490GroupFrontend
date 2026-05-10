import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Container, Row, Col } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const CLOUD_NAME = "dnmk4tvun";
  const UPLOAD_PRESET = "bitfit_preset";

  const [calorieData, setCalorieData] = useState([]);
  const [stepData, setStepData] = useState([]);
  const [moodData, setMoodData] = useState([]);

  const [range, setRange] = useState("week");
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoType, setPhotoType] = useState("before");
  const [progressPhotos, setProgressPhotos] = useState([]);

  const [enlargedImage, setEnlargedImage] = useState(null);
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a photo first!");

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("client_id", clientId);
    formData.append("photo_type", photoType);

    try {
      const response = await fetch("/api/progress/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Photo uploaded successfully!");
        fetchPhotos();
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/progress/${clientId}`);
      const data = await res.json();
      setProgressPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch photos", err);
    }
  };

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const calRes = await fetch(
          `/api/calorie_graph/${clientId}?range=${range}`,
        );
        const rawCalorieData = await calRes.json();

        if (Array.isArray(rawCalorieData)) {
          const dailyTotals = rawCalorieData.reduce((acc, current) => {
            const date = current.log_date;
            if (!acc[date]) {
              acc[date] = { log_date: date, actual_calories: 0 };
            }
            acc[date].actual_calories += Number(current.actual_calories);
            return acc;
          }, {});
          setCalorieData(Object.values(dailyTotals));
        }

        const stepRes = await fetch(
          `/api/steps_graph/${clientId}?range=${range}`,
        );
        const stpData = await stepRes.json();
        setStepData(Array.isArray(stpData) ? stpData : []);

        const moodRes = await fetch(`/api/mood/${clientId}`);
        const mdData = await moodRes.json();
        setMoodData(Array.isArray(mdData) ? mdData : []);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      }
    };
    fetchAllData();
    fetchPhotos();
  }, [clientId, range]);

const handleDelete = async (imageUrl) => {
  if (!window.confirm("Are you sure?")) return;

  const identifier = imageUrl.startsWith("http") 
    ? encodeURIComponent(imageUrl) 
    : imageUrl.split("/").pop();

  try {
    const res = await fetch(`/api/progress/delete/${identifier}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProgressPhotos((prev) => prev.filter((p) => p.image_url !== imageUrl));
    }
  } catch (err) {
    console.error("Failed to delete", err);
  }
};

 const formatListDate = (dateStr) => {
  const date = new Date(dateStr.replace(/-/g, '\/'));
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace(/,/g, ''); 
};

const formatGraphDate = (dateStr) => {
  const date = new Date(dateStr.replace(/-/g, '\/'));
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: '2-digit' 
  });
};

const handleUploadCloud = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please select a photo first!");

   
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        
        const cloudResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!cloudResponse.ok) {
            const errorData = await cloudResponse.json();
            console.error("Cloudinary Error:", errorData);
            return alert("Failed to upload to Cloudinary. Check your Preset!");
        }

        const cloudData = await cloudResponse.json();
        const permanentUrl = cloudData.secure_url; 
        
        const dbResponse = await fetch(`/api/progress/upload/${clientId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image_url: permanentUrl, 
                photo_type: photoType,    
            }),
        });

        if (dbResponse.ok) {
            alert("Success! Photo is now permanent for the 4-day stress test.");
           
            if (typeof fetchPhotos === "function") fetchPhotos(); 
        } else {
            alert("Cloudinary worked, but saving to your Database failed.");
        }
    } catch (err) {
        console.error("Upload process failed:", err);
        alert("An error occurred during the upload process.");
    }
};

  return (
    <div className="dashboard-container">
      <Sidebar activePage="analytics" />

      <main className="main-content">
        <h1>Health Analytics</h1>
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              color: "var(--muted)",
              fontSize: "13px",
              marginRight: "8px",
            }}
          >
            Filter Range:
          </label>
          <select
            className="bitfit-input"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              background: "#032a0d",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "6px",
              color: "white",
              padding: "6px 10px",
            }}
          >
              <option value="day" style={{ background: "#032a0d", color: "white" }}>Today</option>
              <option value="week" style={{ background: "#032a0d", color: "white" }}>This Week</option>
              <option value="month" style={{ background: "#032a0d", color: "white" }}>This Month</option>
              </select>
        </div>

        <Container fluid>
          <Row className="mb-4">
            <Col md={12} className="section-card">
              <h3>Daily Calorie Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="log_date" 
                        tickFormatter={formatGraphDate} />
                    <YAxis />
                    <Tooltip labelFormatter={formatListDate} />
                    <Line
                      type="monotone"
                      dataKey="actual_calories"
                      stroke="#509e54"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={12} className="section-card">
              <h3>Daily Steps Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={stepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="log_date" 
                      tickFormatter={formatGraphDate} 
                    />
                    <YAxis />
                    <Tooltip labelFormatter={formatListDate} />
                    <Line type="monotone" dataKey="steps" stroke="#3b9ff6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={12} className="section-card">
              <h3>Daily Mood Score Trends</h3>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="log_date" 
                      tickFormatter={formatGraphDate} 
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip labelFormatter={formatListDate} />
                    <Line
                      type="monotone"
                      dataKey="mood_score"
                      stroke="#94b43c"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="section-card">
              <h3>Before and After Progress</h3>

              <form
                onSubmit={handleUploadCloud}
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="bitfit-input"
                  style={{ padding: "5px" }}
                />
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                  className="bitfit-input"
                  style={{ width: "120px" }}
                >
                  <option value="before">Before</option>
                  <option value="after">After</option>
                </select>
                <button
                  type="submit"
                  className="bitfit-button"
                  style={{ padding: "8px 15px" }}
                >
                  Upload Photo
                </button>
              </form>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "15px",
                }}
              >
             {progressPhotos.map((photo, index) => {
               
                const imageUrl = photo.image_url.startsWith("http") 
                  ? photo.image_url 
                  : `/api/uploads/${photo.image_url.split("/").pop()}`;

                return (
                  <div key={index} >
                    <img
                      src={imageUrl}
                      alt="progress"
                      onClick={() => setEnlargedImage(imageUrl)}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
      />
                      <img
                        src={imageUrl}
                        alt="progress"
                        onClick={() => setEnlargedImage(imageUrl)}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      />

                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          textTransform: "capitalize",
                        }}
                      >
                        {photo.photo_type}
                      </p>
                      <button
                          onClick={() => handleDelete(photo.image_url)}
                          style={{
                            width: "100%",
                            padding: "6px",
                            fontSize: "11px",
                            background: "rgba(255, 77, 77, 0.2)",
                            border: "1px solid #8a3131",
                            borderRadius: "4px",
                            color: "white",
                            cursor: "pointer",
                            transition: "0.3s"
                          }}
                          onMouseEnter={(e) => (e.target.style.background = "rgba(126, 27, 27, 0.5)")}
                          onMouseLeave={(e) => (e.target.style.background = "rgba(255, 77, 77, 0.2)")}
                        >
                          Delete Photo
                        </button>
                
                    </div>
                  );
                })}
                {enlargedImage && (
                  <div
                    onClick={() => setEnlargedImage(null)}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      backgroundColor: "rgba(0,0,0,0.85)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                      cursor: "zoom-out",
                    }}
                  >
                    <img
                      src={enlargedImage}
                      alt="Enlarged progress"
                      style={{
                        maxHeight: "90%",
                        maxWidth: "90%",
                        borderRadius: "8px",
                        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
                      }}
                    />
                    <button
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "30px",
                        color: "white",
                        fontSize: "30px",
                        background: "none",
                        border: "none",
                      }}
                      onClick={() => setEnlargedImage(null)}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
};

export default Analytics;
