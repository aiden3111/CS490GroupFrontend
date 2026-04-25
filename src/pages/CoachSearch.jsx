import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";

const CoachSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");
  const [coaches, setCoaches] = useState([]);
  const navigate = useNavigate();
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [selectedFilters, setselectedFilters] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [addPaymentForm, setAddPaymentForm] = useState({
    card_type: "Visa",
    last4: "",
    expiry_month: "",
    expiry_year: "",
    is_default: false,
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/LoginPage/");
  };

  const handleSearch = () => {
    if (searchTerm.trim().length === 0) {
      navigate(`/CoachSearch/${clientId}`);
      return;
    }
    navigate(
      `/CoachSearch/${clientId}?search=${encodeURIComponent(searchTerm)}`,
    );
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const url = query
      ? `http://127.0.0.1:5000/api/coaches_search/?search=${query}`
      : `http://127.0.0.1:5000/api/coaches_search/`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Backend Error:", data.error);
          setCoaches([]);
        } else {
          setCoaches(data);
        }
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [query]);

  const fetchPaymentMethods = async () => {
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/payment/client/${clientId}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setPaymentMethods([]);
        setPaymentError(data?.error || "Failed to load payment methods");
        return;
      }
      const methods = Array.isArray(data) ? data : [];
      setPaymentMethods(methods);

      const defaultMethod = methods.find((m) => m.is_default);
      if (defaultMethod) setSelectedPaymentId(String(defaultMethod.payment_id));
      else if (methods.length > 0)
        setSelectedPaymentId(String(methods[0].payment_id));
      else setSelectedPaymentId("");
    } catch (_e) {
      setPaymentMethods([]);
      setPaymentError("Failed to load payment methods");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCoach) return;
    fetchPaymentMethods();
    setShowAddPayment(false);
    setAddPaymentForm({
      card_type: "Visa",
      last4: "",
      expiry_month: "",
      expiry_year: "",
      is_default: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoach]);

  const handleAddPayment = async () => {
    setPaymentError("");
    try {
      const res = await fetch(`http://127.0.0.1:5000/payment/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          card_type: addPaymentForm.card_type,
          last4: String(addPaymentForm.last4),
          expiry_month: Number(addPaymentForm.expiry_month),
          expiry_year: Number(addPaymentForm.expiry_year),
          is_default: !!addPaymentForm.is_default,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data?.error || "Failed to add payment method");
        return;
      }
      setShowAddPayment(false);
      await fetchPaymentMethods();
    } catch (_e) {
      setPaymentError("Failed to add payment method");
    }
  };

  const getReviews = async (coachId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/review/coach/${coachId}`);
      const data = await res.json();

      if (res.ok) {
        setReviews(data);
      } else {
        console.error("Failed to fetch reviews:", data.error);
      }
    } catch (err) {
      console.error("Network error fetching reviews:", err);
      setReviews([]);
    }
  };

  const handleFilterChange = (name) => {
    const lowerName = name.toLowerCase();
    setselectedFilters((prev) =>
      prev.includes(lowerName)
        ? prev.filter((item) => item !== lowerName)
        : [...prev, lowerName],
    );
  };

  const displayCoaches =
    selectedFilters.length === 0
      ? coaches
      : coaches.filter((coach) => {
          const specialty = coach.specialty
            ? coach.specialty.toLowerCase().trim()
            : "";
          const wantsFitness = selectedFilters.includes("fitness");
          const wantsNutrition = selectedFilters.includes("nutrition");
          if (
            specialty === "both" ||
            specialty.includes("fitness & nutrition")
          ) {
            return wantsFitness || wantsNutrition;
          }
          return selectedFilters.includes(specialty);
        });

  const handleRequestCoach = async () => {
    try {
      if (!selectedCoach) return;
      if (!selectedPaymentId) {
        setPaymentError(
          "Please select a payment method (or add a new one) before requesting a coach.",
        );
        return;
      }
      const response = await fetch(
        `http://127.0.0.1:5000/api/coach/${selectedCoach.coach_id}/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            payment_id: Number(selectedPaymentId),
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        alert("Sent");
        setSelectedCoach(null);
      } else {
        if (data?.code === "NO_PAYMENT_METHOD") {
          setPaymentError(
            "No payment method on file. Please add one to request a coach.",
          );
          setShowAddPayment(true);
          return;
        }
        if (data?.code === "INVALID_PAYMENT_METHOD") {
          setPaymentError(
            "That payment method is invalid. Please select a valid method.",
          );
          return;
        }
        alert(data.error || "Error");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <div className="brand-logo">BitFit</div>
        <ul className="nav-list">
          <li
            className="nav-item"
            onClick={() => navigate(`/LandingPage/${clientId}`)}
          >
            Dashboard
          </li>
          <li
            className="nav-item"
            onClick={() => navigate(`/UserProfile/${clientId}`)}
          >
            My Profile
          </li>
        </ul>

        {/* Checkbox not checkboxing*/}
        <div className="checkbox">
          <p>Filters</p>
          <label className="checkbox-container1">
            <input
              type="checkbox"
              name="Fitness"
              checked={selectedFilters.includes("fitness")}
              onChange={() => handleFilterChange("fitness")}
            />
            Fitness
          </label>
          <label className="checkbox-container2">
            <input
              type="checkbox"
              name="Nutrition"
              checked={selectedFilters.includes("nutrition")}
              onChange={() => handleFilterChange("nutrition")}
            />
            Nutrition
          </label>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-item" onClickCapture={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <h1 className="welcome-text"> Coach Search</h1>

        <div className="search-container">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleEnter}
          />
          <button className="btn-search" onClick={handleSearch}>
            {" "}
            Search{" "}
          </button>
        </div>

        {query && <h2 className="section-title">Search Results: "{query}"</h2>}

        <div className="coach-grid">
          {displayCoaches.length > 0 ? (
            displayCoaches.map((coach) => (
              <div key={coach.coach_id} className="section-card">
                <h3>
                  Coach: {coach.first_name} {coach.last_name}
                </h3>
                <p className="specialty-tag">
                  <b>Specialty:</b>{" "}
                  {coach.specialty === "both"
                    ? "Fitness & Nutrition"
                    : coach.specialty}
                </p>
                <p>
                  <b>Pricing:</b> ${coach.pricing}
                </p>

                <button
                  className="btn-outline"
                  onClick={() => {
                    setSelectedCoach(coach);
                    getReviews(coach.coach_id);
                  }}
                >
                  View Profile
                </button>
              </div>
            ))
          ) : (
            <p>No coaches found.</p>
          )}
        </div>
        <Modal
          open={selectedCoach !== null}
          onClose={() => setSelectedCoach(null)}
        >
          {selectedCoach && (
            <div className="modal-inner-contentF">
              <strong> Coach Details:</strong>
              <h3>
                {" "}
                Name: {selectedCoach.first_name} {selectedCoach.last_name}
              </h3>
              <p className="specialty-tag">
                <b>Specialty:</b> {selectedCoach.specialty}
              </p>
              <p>
                {" "}
                <b>Pricing:</b> ${selectedCoach.pricing}{" "}
              </p>
              <p>
                {" "}
                <b>Certifications:</b> {selectedCoach.fitness_certifications}{" "}
                 {selectedCoach.nutrition_certifications}{" "}
              </p>

              <hr />
              <h4>Reviews</h4>

              {reviews.length > 0 ? (
                reviews.map((r, index) => (
                  <div key={index} className="review-card">
                    <p>
                      <strong>Rating:</strong> {r.rating}/5
                    </p>
                    <p><strong>Comment: </strong>
                      <i>"{r.comment}"</i>
                    </p>
                    <p>
                      <small><strong>Date: </strong>
                        {new Date(r.created_at).toLocaleDateString()}
                      </small>
                    </p>
                  </div>
                ))
              ) : (
                <p>No reviews yet for this coach.</p>
              )}
              <hr />
              <div style={{ marginTop: 16, textAlign: "left" }}>
                <strong>Payment Method</strong>
                {paymentError && (
                  <div style={{ marginTop: 8, color: "#fca5a5" }}>
                    {paymentError}
                  </div>
                )}

                {paymentLoading ? (
                  <div style={{ marginTop: 8, color: "#a1a1aa" }}>
                    Loading payment methods...
                  </div>
                ) : (
                  <>
                    {paymentMethods.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <select
                          value={selectedPaymentId}
                          onChange={(e) => setSelectedPaymentId(e.target.value)}
                          className="form-control"
                          style={{
                            background: "#27272a",
                            color: "white",
                            border: "1px solid #3f3f46",
                          }}
                        >
                          {paymentMethods.map((m) => (
                            <option
                              key={m.payment_id}
                              value={String(m.payment_id)}
                            >
                              {m.is_default ? "[Default] " : ""}
                              {m.card_type || "Card"} •••• {m.last4 || "----"}{" "}
                              (exp {m.expiry_month ?? "--"}/
                              {m.expiry_year ?? "----"})
                            </option>
                          ))}
                        </select>
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn-outline"
                            onClick={() => setShowAddPayment((v) => !v)}
                          >
                            {showAddPayment
                              ? "Hide Add Form"
                              : "Add New Method"}
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => navigate(`/UserProfile/${clientId}`)}
                          >
                            Manage in Profile
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethods.length === 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ color: "#a1a1aa" }}>
                          You don’t have a payment method yet. Add one below to
                          request a coach.
                        </div>
                        {!showAddPayment && (
                          <button
                            className="btn-outline"
                            style={{ marginTop: 10 }}
                            onClick={() => setShowAddPayment(true)}
                          >
                            Add Payment Method
                          </button>
                        )}
                      </div>
                    )}

                    {showAddPayment && (
                      <div
                        style={{
                          marginTop: 12,
                          border: "1px solid #27272a",
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 10,
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 12,
                                color: "#a1a1aa",
                                marginBottom: 6,
                              }}
                            >
                              Card Type
                            </label>
                            <select
                              className="form-control"
                              style={{
                                background: "#27272a",
                                color: "white",
                                border: "1px solid #3f3f46",
                              }}
                              value={addPaymentForm.card_type}
                              onChange={(e) =>
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  card_type: e.target.value,
                                })
                              }
                            >
                              {[
                                "Visa",
                                "Mastercard",
                                "Amex",
                                "Discover",
                                "Other",
                              ].map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 12,
                                color: "#a1a1aa",
                                marginBottom: 6,
                              }}
                            >
                              Last 4
                            </label>
                            <input
                              className="form-control"
                              style={{
                                background: "#27272a",
                                color: "white",
                                border: "1px solid #3f3f46",
                              }}
                              value={addPaymentForm.last4}
                              maxLength={4}
                              onChange={(e) =>
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  last4: e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 4),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 12,
                                color: "#a1a1aa",
                                marginBottom: 6,
                              }}
                            >
                              Expiry Month
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={12}
                              className="form-control"
                              style={{
                                background: "#27272a",
                                color: "white",
                                border: "1px solid #3f3f46",
                              }}
                              value={addPaymentForm.expiry_month}
                              onChange={(e) =>
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  expiry_month: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: 12,
                                color: "#a1a1aa",
                                marginBottom: 6,
                              }}
                            >
                              Expiry Year
                            </label>
                            <input
                              type="number"
                              min={2024}
                              max={2100}
                              className="form-control"
                              style={{
                                background: "#27272a",
                                color: "white",
                                border: "1px solid #3f3f46",
                              }}
                              value={addPaymentForm.expiry_year}
                              onChange={(e) =>
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  expiry_year: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <label
                            style={{
                              color: "#a1a1aa",
                              display: "flex",
                              gap: 10,
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={addPaymentForm.is_default}
                              onChange={(e) =>
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  is_default: e.target.checked,
                                })
                              }
                            />
                            Set as default
                          </label>
                        </div>
                        <div
                          style={{
                            marginTop: 12,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="rent-btn"
                            onClick={handleAddPayment}
                          >
                            Save Payment Method
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => setShowAddPayment(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                className="rent-btn"
                onClick={handleRequestCoach}
                style={{ marginTop: 16 }}
              >
                Request Coach
              </button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default CoachSearch;
