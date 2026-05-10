import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Landingcss.css";
import Sidebar from "../components/Sidebar";




const BillingPage = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState("All");
    const [selectedYear, setSelectedYear] = useState("All");

    const months = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch(`/api/invoice/${clientId}`);
                const data = await res.json();
                if (res.ok) setInvoices(data);
            } catch (err) {
                console.error("Failed to load invoices:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [clientId]);

    const availableYears = useMemo(() => {
        const yearSet = new Set();
        invoices.forEach(inv => {
            if (inv.created_at) {
                const year = new Date(inv.created_at).getFullYear();
                yearSet.add(year.toString());
            }
        });
        return ["All", ...Array.from(yearSet).sort((a, b) => b - a)];
    }, [invoices]);

    // 2. Filter logic based on the timestamp
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            if (!inv.created_at) return true; 

            const dateObj = new Date(inv.created_at);
            const invMonth = months[dateObj.getMonth() + 1]; 
            const invYear = dateObj.getFullYear().toString();

            const matchesMonth = selectedMonth === "All" || invMonth === selectedMonth;
            const matchesYear = selectedYear === "All" || invYear === selectedYear;

            return matchesMonth && matchesYear;
        });
    }, [invoices, selectedMonth, selectedYear]);


    const selectStyle = {
        width: "100%",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "8px",
        color: "white",
        padding: "8px",
        marginTop: "5px",
        outline: "none",
        fontSize: "14px"
    };


    return (
        <div className="dashboard-container">
            <Sidebar activePage="billing" />
            <main className="main-content">
                <header className="dashboard-header">
                    <h1 className="welcome-text">Billing & Invoices</h1>
                    <button className="btn-outline-warning" onClick={() => navigate(-1)}>Back</button>
                </header>

                <div className="card" style={{ marginTop: "20px" }}>
                    <h3>Subscription Charges</h3>
                    <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "20px" }}>
                        Mock card transactions are created when a coach accepts you and once per month after that.
                    </p>

                    {/* Filter Section */}
                    <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "12px", color: "var(--muted)" }}>Filter by Month</label>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={selectStyle}>
                                {months.map(m => <option key={m} value={m} style={{ background: "#18181b" }}>{m}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: "12px", color: "var(--muted)" }}>Filter by Year</label>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={selectStyle}>
                                {availableYears.map(y => <option key={y} value={y} style={{ background: "#18181b" }}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading charges...</p>
                    ) : filteredInvoices.length === 0 ? (
                        <p style={{ color: "var(--muted)", fontSize: "13px" }}>No subscription charges found.</p>
                    ) : (
                        <div style={{ display: "grid", gap: "10px" }}>
                            {filteredInvoices.map((inv) => (
                                <div key={inv.invoice_id} className="mood-entry" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                                    <div>
                                        <div className="mood-label">Monthly Coach Subscription</div>
                                        <div className="mood-date">
                                            {inv.billing_month} · Charged {new Date(inv.created_at).toLocaleDateString("en-US")}
                                        </div>
                                        <div style={{ color: "var(--muted)", fontSize: "12px", marginTop: "4px" }}>
                                            Transaction #{inv.invoice_id}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ color: "#85fb24", fontWeight: "bold", marginBottom: "5px" }}>
                                            ${Number(inv.amount).toFixed(2)}
                                        </div>
                                        <div style={{ color: "var(--muted)", fontSize: "12px" }}>
                                            Paid
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BillingPage;
