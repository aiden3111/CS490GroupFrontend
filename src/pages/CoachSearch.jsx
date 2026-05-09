import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./Landingcss.css";
import React, { useState, useEffect } from "react";
import Modal from "./ModalPage";
import Sidebar from "../components/Sidebar";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

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
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    is_default: false,
  });
  const [reviews, setReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("");

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
    }
  }, [clientId, navigate]);

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
    let url = `/api/coaches_search?`;
    if (query) url += `search=${query}&`;

    if (sortOrder) url += `sort=${sortOrder}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setCoaches(data.error ? [] : data))
      .catch((err) => console.error(err));
  }, [query, sortOrder]);

  const fetchPaymentMethods = async () => {
    setPaymentLoading(true);
    setPaymentError("");
    try {
      const res = await fetch(`/api/payment/client/${clientId}`);
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
      card_number: "",
      expiry: "",
      is_default: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoach]);

  const isValidExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry.split("/").map(Number);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  const handleAddPayment = async () => {
    setPaymentError("");
    const cardNumber = addPaymentForm.card_number;
    const cardType = detectCardType(cardNumber);
    const last4 = cardNumber.slice(-4);
    if (!isValidExpiry(addPaymentForm.expiry)) {
      setPaymentError("Invalid or expired card date");
      return;
    }
    let val = addPaymentForm.expiry.replace(/\D/g, "").slice(0, 4);
    let expiry_month = val.slice(0, 2);
    let expiry_year = val.slice(2);
    try {
      const res = await fetch(`/api/payment/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          card_type: cardType,
          last4: last4,
          expiry_month: Number(expiry_month),
          expiry_year: Number(expiry_year),
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
      const res = await fetch(`/api/review/coach/${coachId}`);
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
  const formatCardNumber = (value = "") => {
    const cleaned = value.replace(/\D/g, "");

    if (/^3[47]/.test(cleaned)) {
      return cleaned
        .slice(0, 15)
        .replace(/(\d{4})(\d{6})(\d{0,5})/, (match, p1, p2, p3) =>
          [p1, p2, p3].filter(Boolean).join(" "),
        );
    }

    return cleaned
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const detectCardType = (number) => {
    const cleaned = number.replace(/\D/g, "");

    if (/^4/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "Amex";
    if (/^6(?:011|5)/.test(cleaned)) return "Discover";

    return "Unknown";
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
        `/api/coach/${selectedCoach.coach_id}/request`,
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
      <Sidebar activePage="mycoach" />

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
            Search
          </button>
        </div>

        {query && <h2 className="section-title">Search Results: "{query}"</h2>}
       
        <section className="filter-panel">
          <Row>
          <Col>
          <div className="filter-group">
            <p>Specialty</p>
            <div className="filter-options">
              {["Fitness", "Nutrition"].map((name) => (
                <label key={name} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(name.toLowerCase())}
                    onChange={() => handleFilterChange(name.toLowerCase())}
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>
              </Col>
              <Col>
          <div className="filter-group">
            <p>Sort by Price</p>
            <div className="filter-options">
              <select
                className="filter-select"
                style={{
                  background: "#18181b",
                  color: "white",
                  border: "1px solid #3f3f46",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  marginTop: "5px",
                }}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          </Col>
           {(selectedFilters.length > 0 || sortOrder) && (
            <button
              className="clear-filters-btn"
              style={{
              backgroundColor: "#294333",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              marginTop: "5px"
            }}
              onClick={() => {
                setselectedFilters([]);
                setSortOrder("");
              }}
            >
              Clear Filters
            </button>
          )}
          </Row>
        </section>

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
                <p>
                  <b>Availability:</b> {coach.availability}
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
                <b>Specialty:</b> {selectedCoach.specialty}{" "}
              </p>
              <p>
                <b>Pricing:</b> ${selectedCoach.pricing}
              </p>
              <p>
                <b>Certifications:</b> {selectedCoach.fitness_certifications}
                {selectedCoach.nutrition_certifications}
              </p>
              <p>
                <b>Availability:</b> {selectedCoach.availability}
              </p>

              <hr />
              <h4>Reviews</h4>

              {reviews.length > 0 ? (
                reviews.map((r, index) => (
                  <div key={index} className="review-card">
                    <p>
                      Client id: {r.client_id} - {r.first_name} {r.last_name}
                    </p>
                    <p>
                      <strong>Rating:</strong> {r.rating}/5
                    </p>
                    <p>
                      <strong>Comment: </strong>
                      <i>"{r.comment}"</i>
                    </p>
                    <p>
                      <small>
                        <strong>Date: </strong>
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
                      <>
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
                            className="back-btn"
                            onClick={() => setShowAddPayment((v) => !v)}
                          >
                            {showAddPayment
                              ? "Hide Add Form"
                              : "Add New Method"}
                          </button>
                          <button
                            className="back-btn"
                            onClick={() => navigate(`/UserProfile/${clientId}`)}
                          >
                            Manage in Profile
                          </button>
                        </div>
                      </>
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

                    {(showAddPayment || paymentMethods.length === 0) && (
                      <div
                        style={{
                          marginTop: 12,
                          background: "var(--card2)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                          }}
                        >
                          <div>
                            <div className="edit-label">Card Number</div>
                            <input
                              className="bitfit-input"
                              placeholder="1234 5678 9012 3456"
                              value={formatCardNumber(
                                addPaymentForm.card_number,
                              )}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  card_number: raw,
                                });
                              }}
                            />
                            <div style={{ fontSize: 12, color: "#aaa" }}>
                              Card Type:{" "}
                              {detectCardType(addPaymentForm.card_number)}
                            </div>
                          </div>
                          <div className="field-group">
                            <label className="field-label">
                              Expiry (MM/YY)
                            </label>
                            <input
                              className="bitfit-input"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={addPaymentForm.expiry}
                              onChange={(e) => {
                                let val = e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4);
                                if (val.length >= 3) {
                                  val = val.slice(0, 2) + "/" + val.slice(2);
                                }
                                setAddPaymentForm({
                                  ...addPaymentForm,
                                  expiry: val,
                                });
                              }}
                            />
                          </div>
                        </div>

                        <label
                          style={{
                            marginTop: 10,
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            color: "var(--muted)",
                            fontSize: 13.5,
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

                        <div
                          style={{
                            marginTop: 12,
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="meal-log-btn"
                            onClick={handleAddPayment}
                          >
                            Save Payment Method
                          </button>
                          {paymentMethods.length > 0 && (
                            <button
                              className="meal-cancel-btn"
                              onClick={() => setShowAddPayment(false)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <button className="coach-find-btn" onClick={handleRequestCoach}>
                  Request Coach
                </button>
                <button
                  className="back-btn"
                  onClick={() => setSelectedCoach(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default CoachSearch;
