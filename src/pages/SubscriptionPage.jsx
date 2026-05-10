import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";

const currency = (value) => `$${Number(value || 0).toFixed(2)}`;

const getNextBillingDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
};

const SubscriptionPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const defaultPayment = useMemo(
    () => paymentMethods.find((payment) => payment.is_default) || paymentMethods[0],
    [paymentMethods],
  );

  const latestInvoice = invoices[0];
  const nextBillingDate = getNextBillingDate();

  const fetchSubscriptionData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [coachRes, paymentRes, invoiceRes] = await Promise.all([
        fetch(`/api/my_coach/${clientId}`),
        fetch(`/api/payment/client/${clientId}`),
        fetch(`/api/invoice/${clientId}`),
      ]);

      if (coachRes.ok) {
        setCoach(await coachRes.json());
      } else {
        setCoach(null);
      }

      const paymentData = await paymentRes.json();
      setPaymentMethods(Array.isArray(paymentData) ? paymentData : []);

      const invoiceData = await invoiceRes.json();
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
    } catch (err) {
      setMessage("Failed to load subscription details.");
      console.error("Subscription load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loggedInId = localStorage.getItem("authenticatedClientId");
    if (loggedInId !== clientId) {
      navigate(`/UserProfile/${loggedInId}`);
      return;
    }
    fetchSubscriptionData();
  }, [clientId, navigate]);

  const handleCancelSubscription = async () => {
    const ok = window.confirm(
      "Cancel your coach subscription? This removes your coach and stops future monthly charges.",
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/my_coach/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to cancel subscription");

      setCoach(null);
      setMessage("Subscription cancelled. Existing billing history is preserved.");
    } catch (err) {
      setMessage(err.message || "Failed to cancel subscription.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activePage="subscriptions" />
      <main className="main-content">
        <header className="dashboard-header">
          <h1 className="welcome-text">Subscription</h1>
          <button className="btn-outline-warning" onClick={() => navigate(`/BillingPage/${clientId}`)}>
            Billing History
          </button>
        </header>

        {message && (
          <div className="section-card" style={{ marginBottom: "16px", color: "#d4d4d8" }}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="section-card">Loading subscription...</div>
        ) : (
          <>
            <section className="section-card" style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "18px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ marginBottom: "8px" }}>
                    {coach ? "Active Monthly Coach Subscription" : "No Active Coach Subscription"}
                  </h2>
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    {coach
                      ? "Your coach subscription renews monthly using your saved payment method."
                      : "Choose a coach to start a subscription and begin monthly billing."}
                  </p>
                </div>
                <div
                  style={{
                    color: coach ? "#85fb24" : "#fbbf24",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {coach ? "Active" : "Inactive"}
                </div>
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <section className="section-card">
                <h3>Coach</h3>
                {coach ? (
                  <>
                    <div className="mood-label">
                      {coach.first_name} {coach.last_name}
                    </div>
                    <p style={{ color: "var(--muted)" }}>{coach.specialty}</p>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#85fb24" }}>
                      {currency(coach.pricing)}
                    </div>
                    <p style={{ color: "var(--muted)", marginTop: "4px" }}>per month</p>
                  </>
                ) : (
                  <>
                    <p style={{ color: "var(--muted)" }}>You are not currently subscribed to a coach.</p>
                    <button className="btn-primary" onClick={() => navigate(`/CoachSearch/${clientId}`)}>
                      Find a Coach
                    </button>
                  </>
                )}
              </section>

              <section className="section-card">
                <h3>Payment Method</h3>
                {defaultPayment ? (
                  <>
                    <div className="mood-label">
                      {defaultPayment.card_type || "Card"} ending in {defaultPayment.last4 || "----"}
                    </div>
                    <p style={{ color: "var(--muted)" }}>
                      Expires {defaultPayment.expiry_month ?? "--"}/{defaultPayment.expiry_year ?? "--"}
                    </p>
                    <button className="btn-secondary" onClick={() => navigate(`/UserProfile/${clientId}`)}>
                      Manage Payment Methods
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ color: "var(--muted)" }}>No payment method on file.</p>
                    <button className="btn-primary" onClick={() => navigate(`/UserProfile/${clientId}`)}>
                      Add Payment Method
                    </button>
                  </>
                )}
              </section>

              <section className="section-card">
                <h3>Billing</h3>
                {coach ? (
                  <>
                    <div className="mood-label">Next Monthly Charge</div>
                    <p style={{ color: "var(--muted)" }}>{nextBillingDate.toLocaleDateString("en-US")}</p>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#85fb24" }}>
                      {currency(coach.pricing)}
                    </div>
                  </>
                ) : (
                  <p style={{ color: "var(--muted)" }}>No future charges scheduled.</p>
                )}
              </section>
            </div>

            <section className="section-card" style={{ marginTop: "18px" }}>
              <h3>Latest Charge</h3>
              {latestInvoice ? (
                <div className="mood-entry" style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <div className="mood-label">Monthly Coach Subscription</div>
                    <div className="mood-date">
                      {latestInvoice.billing_month} · {new Date(latestInvoice.created_at).toLocaleDateString("en-US")}
                    </div>
                  </div>
                  <div style={{ color: "#85fb24", fontWeight: 800 }}>
                    {currency(latestInvoice.amount)}
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--muted)" }}>No charges yet.</p>
              )}
            </section>

            {coach && (
              <section className="section-card" style={{ marginTop: "18px", borderColor: "rgba(248,113,113,.35)" }}>
                <h3>Cancel Subscription</h3>
                <p style={{ color: "var(--muted)" }}>
                  Cancelling removes your current coach and stops future monthly subscription charges. Existing charges stay in billing history.
                </p>
                <button className="btn-secondary" onClick={handleCancelSubscription}>
                  Cancel Coach Subscription
                </button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SubscriptionPage;
