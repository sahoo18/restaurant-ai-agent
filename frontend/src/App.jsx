
import React, { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [orderId, setOrderId] = useState("ORD-1005");
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I’m your restaurant support assistant. Ask me about an order, delivery, cancellation, payment, refund, or support issue.",
    },
  ]);

  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const [sessionId] = useState(() => `customer-${Date.now()}`);

  // ----------------------------------------
  // ORDER STATUS CSS CLASS
  // ----------------------------------------
  const statusClass = useMemo(() => {
    const status = (order?.status || "").toLowerCase();

    if (status.includes("deliver")) {
      return "status delivered";
    }

    if (status.includes("prepar")) {
      return "status preparing";
    }

    if (status.includes("cancel")) {
      return "status cancelled";
    }

    return "status";
  }, [order]);

  // ----------------------------------------
  // LOAD ORDER DETAILS
  // ----------------------------------------
  async function loadOrder(id = orderId) {
    const cleanId = id.trim().toUpperCase();

    if (!cleanId) {
      return;
    }

    setOrderLoading(true);
    setOrderError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(cleanId)}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || "Order could not be loaded."
        );
      }

      setOrder(data);
      setOrderId(cleanId);
    } catch (error) {
      setOrder(null);

      setOrderError(
        error.message ||
        "Unable to connect to the restaurant service."
      );
    } finally {
      setOrderLoading(false);
    }
  }

  // ----------------------------------------
  // LOAD DEFAULT ORDER WHEN PAGE OPENS
  // ----------------------------------------
  useEffect(() => {
    loadOrder("ORD-1005");
  }, []);

  // ----------------------------------------
  // SEND MESSAGE TO AI AGENT
  // ----------------------------------------
  async function sendMessage(event) {
    event?.preventDefault();

    const text = message.trim();

    if (!text || chatLoading) {
      return;
    }

    // Show user's message immediately
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");
    setChatLoading(true);
    setChatError("");

    try {
      let agentMessage = text;

      // ----------------------------------------
      // USE CURRENTLY VIEWED ORDER
      // ----------------------------------------
      if (order?.order_id) {
        const hasOrderId = /\bORD-\d{4}\b/i.test(text);

        if (!hasOrderId) {
          agentMessage = `
The customer is currently viewing order ${order.order_id}.

Customer message:
${text}

If this question is related to the customer's current order,
use order ${order.order_id} to answer it.

Do not ask the customer to provide the order ID again unless
the order ID is actually required.
          `.trim();
        }
      }

      // ----------------------------------------
      // CALL BACKEND AI AGENT
      // ----------------------------------------
      const response = await fetch(
        `${API_BASE_URL}/api/agent/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: agentMessage,
            session_id: sessionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.[0]?.msg ||
          data.message ||
          "Chat request failed."
        );
      }

      // ----------------------------------------
      // SHOW AI RESPONSE
      // ----------------------------------------
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.response ||
            "I could not generate a response.",
        },
      ]);
    } catch (error) {
      setChatError(
        error.message ||
        "Unable to reach the AI agent."
      );

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm unable to reach the support service right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  // ----------------------------------------
  // QUICK QUESTIONS
  // ----------------------------------------
  function quickQuestion(text) {
    setMessage(text);
  }

  // ----------------------------------------
  // UI
  // ----------------------------------------
  return (
    <div className="app-shell">
      {/* =====================================
          HEADER
      ====================================== */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">R</div>

          <div>
            <h1>Restaurant AI Support</h1>
            <p>Customer Overview &amp; AI Assistant</p>
          </div>
        </div>

        <div className="service-pill">
          <span className="online-dot" />
          AI Support Online
        </div>
      </header>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}
      <main className="page">

        {/* ===================================
            HERO
        ==================================== */}
        <section className="hero">
          <div>
            <span className="eyebrow">
              CUSTOMER PORTAL
            </span>

            <h2>
              How can we help with your order?
            </h2>

            <p>
              View your current order and chat with
              our AI support assistant.
            </p>
          </div>

          <div className="session-card">
            <span>Session</span>

            <strong>
              {sessionId.replace("customer-", "#")}
            </strong>
          </div>
        </section>

        {/* ===================================
            CUSTOMER OVERVIEW
        ==================================== */}
        <section className="overview-grid">

          {/* ORDER CARD */}
          <div className="card order-card">

            <div className="card-heading">

              <div>
                <span className="card-label">
                  CUSTOMER OVERVIEW
                </span>

                <h3>Your current order</h3>
              </div>

              {/* ORDER SEARCH */}
              <form
                className="order-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  loadOrder();
                }}
              >
                <input
                  value={orderId}
                  onChange={(event) =>
                    setOrderId(event.target.value)
                  }
                  placeholder="ORD-1005"
                  aria-label="Order ID"
                />

                <button
                  type="submit"
                  disabled={orderLoading}
                >
                  {orderLoading
                    ? "Loading..."
                    : "View"}
                </button>
              </form>
            </div>

            {/* ORDER ERROR */}
            {orderError && (
              <div className="error-box">
                {orderError}
              </div>
            )}

            {/* ORDER INFORMATION */}
            {order && (
              <div className="order-content">

                {/* CUSTOMER */}
                <div className="customer-row">

                  <div className="avatar">
                    {(order.customer_name || "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {order.customer_name ||
                        "Customer"}
                    </strong>

                    <span>
                      Order #{order.order_id}
                    </span>
                  </div>

                  <span className={statusClass}>
                    {order.status}
                  </span>
                </div>

                {/* ORDER STATS */}
                <div className="stats-grid">

                  <div className="stat-box">
                    <span>
                      Estimated delivery
                    </span>

                    <strong>
                      {order.estimated_delivery ||
                        "—"}
                    </strong>
                  </div>

                  <div className="stat-box">
                    <span>Total</span>

                    <strong>
                      ₹
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </strong>
                  </div>

                </div>

                {/* ORDER ITEMS */}
                <div className="items-section">

                  <div className="section-title">
                    Order items
                  </div>

                  <div className="items-list">
                    {(order.items || []).map(
                      (item, index) => (
                        <div
                          className="item-row"
                          key={`${item}-${index}`}
                        >
                          <span className="item-icon">
                            🍽️
                          </span>

                          <span>{item}</span>
                        </div>
                      )
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* =================================
              HELP CARD
          ================================== */}
          <div className="card help-card">

            <span className="card-label">
              NEED HELP?
            </span>

            <h3>
              Ask the AI assistant
            </h3>

            <p>
              Your conversation keeps the same
              session context, so you can ask
              follow-up questions without
              repeating the order ID.
            </p>

            <div className="quick-actions">

              <button
                onClick={() =>
                  quickQuestion(
                    "What is the status of my order?"
                  )
                }
              >
                Order status
              </button>

              <button
                onClick={() =>
                  quickQuestion(
                    "Can I cancel my order?"
                  )
                }
              >
                Cancellation
              </button>

              <button
                onClick={() =>
                  quickQuestion(
                    "My payment failed. Please help me."
                  )
                }
              >
                Payment issue
              </button>

              <button
                onClick={() =>
                  quickQuestion(
                    "When will my order arrive?"
                  )
                }
              >
                Delivery
              </button>

            </div>
          </div>
        </section>

        {/* ===================================
            AI CHAT
        ==================================== */}
        <section className="card chat-card">

          {/* CHAT HEADER */}
          <div className="chat-heading">

            <div className="assistant-avatar">
              AI
            </div>

            <div>
              <h3>
                AI Customer Support
              </h3>

              <p>
                Ask about orders, policies,
                payments, refunds, delivery,
                or complaints.
              </p>
            </div>

            <span className="secure-badge">
              Secure session
            </span>
          </div>

          {/* CHAT WINDOW */}
          <div
            className="chat-window"
            aria-live="polite"
          >
            {messages.map((item, index) => {

              const lines =
                item.content.split("\n");

              return (
                <div
                  className={`message-row ${item.role}`}
                  key={`${item.role}-${index}`}
                >
                  <div className="message-bubble">

                    {lines.map(
                      (line, lineIndex) => (
                        <span
                          key={lineIndex}
                        >
                          {line}

                          {lineIndex <
                            lines.length - 1 && (
                              <br />
                            )}
                        </span>
                      )
                    )}

                  </div>
                </div>
              );
            })}

            {/* AI LOADING */}
            {chatLoading && (
              <div className="message-row assistant">
                <div className="message-bubble typing">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* CHAT ERROR */}
          {chatError && (
            <div className="error-box chat-error">
              {chatError}
            </div>
          )}

          {/* CHAT INPUT */}
          <form
            className="chat-input"
            onSubmit={sendMessage}
          >
            <input
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Type your question..."
              disabled={chatLoading}
              aria-label="Message"
            />

            <button
              type="submit"
              disabled={
                !message.trim() ||
                chatLoading
              }
            >
              {chatLoading
                ? "Sending..."
                : "Send"}
            </button>
          </form>

          <p className="chat-note">
            The assistant uses your session context
            and authoritative order data for
            operational questions.
          </p>
        </section>
      </main>

      {/* =====================================
          FOOTER
      ====================================== */}
      <footer className="footer">
        Restaurant AI Support • Customer Portal •
        API: {API_BASE_URL}
      </footer>
    </div>
  );
}

export default App;

