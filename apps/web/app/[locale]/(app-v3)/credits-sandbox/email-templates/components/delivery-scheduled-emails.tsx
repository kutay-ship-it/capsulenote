"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Delivery Scheduled Email - 3 Variations
 * Sent when user schedules a letter for future delivery
 */
export function DeliveryScheduledEmails({ variation }: EmailProps) {
  const sampleData = {
    userName: "Alex",
    letterTitle: "Reflections on My 30th Year",
    deliveryDate: "December 31, 2025 at 9:00 AM",
    deliveryMethod: "email" as const,
    recipientEmail: "alex@example.com",
    deliveryUrl: "https://capsulenote.com/deliveries/xyz789",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist
 */
function VariationA({ userName, letterTitle, deliveryDate, deliveryMethod, recipientEmail, deliveryUrl, dashboardUrl }: {
  userName: string
  letterTitle: string
  deliveryDate: string
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  deliveryUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#383838", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#FFDE00",
            padding: "20px 32px",
            border: "2px solid #383838",
            borderBottom: "none",
            borderRadius: "2px 2px 0 0"
          }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
                  <span style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#383838",
                    letterSpacing: "0.02em"
                  }}>
                    Capsule Note
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#6FC2FF",
                    color: "#383838",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    ⏰ Scheduled
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Main */}
        <tr>
          <td style={{
            backgroundColor: "#ffffff",
            border: "2px solid #383838",
            padding: "40px 32px"
          }}>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "normal",
              color: "#383838",
              margin: "0 0 12px 0",
              lineHeight: "1.2"
            }}>
              Delivery Confirmed! 🎯
            </h1>

            <p style={{
              fontSize: "15px",
              color: "#666666",
              margin: "0 0 32px 0",
              lineHeight: "1.6"
            }}>
              Hey {userName}, your letter is scheduled and will be delivered exactly when you asked.
            </p>

            {/* Delivery Details Box */}
            <div style={{
              backgroundColor: "#F4EFE2",
              border: "2px solid #383838",
              borderRadius: "2px",
              marginBottom: "32px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              {/* Header */}
              <div style={{
                backgroundColor: "#6FC2FF",
                padding: "12px 20px",
                borderBottom: "2px solid #383838"
              }}>
                <span style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#383838"
                }}>
                  📬 Delivery Details
                </span>
              </div>

              {/* Details */}
              <div style={{ padding: "20px" }}>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#666666", width: "100px" }}>Letter:</td>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#383838", fontWeight: "bold" }}>"{letterTitle}"</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#666666" }}>Date:</td>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#383838", fontWeight: "bold" }}>{deliveryDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#666666" }}>Method:</td>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#383838" }}>
                      <span style={{
                        display: "inline-block",
                        backgroundColor: deliveryMethod === "email" ? "#6FC2FF" : "#38C1B0",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        border: "1px solid #383838",
                        borderRadius: "2px"
                      }}>
                        {deliveryMethod === "email" ? "📧 Email" : "📮 Physical Mail"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#666666" }}>To:</td>
                    <td style={{ padding: "8px 0", fontSize: "13px", color: "#383838" }}>{recipientEmail}</td>
                  </tr>
                </table>
              </div>
            </div>

            {/* What Happens Next */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#383838",
                marginBottom: "16px"
              }}>
                What Happens Next
              </div>
              <div style={{ fontSize: "14px", color: "#383838", lineHeight: "2" }}>
                <div>✓ Your letter is securely stored and encrypted</div>
                <div>✓ On {deliveryDate}, it will be sent automatically</div>
                <div>✓ You'll receive a confirmation when delivered</div>
                <div>✓ You can edit or cancel anytime before delivery</div>
              </div>
            </div>

            {/* CTA */}
            <a href={deliveryUrl} style={{
              display: "inline-block",
              backgroundColor: "#383838",
              color: "#ffffff",
              padding: "16px 32px",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textDecoration: "none",
              border: "2px solid #383838",
              borderRadius: "2px"
            }}>
              View Delivery Details →
            </a>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#FFDE00",
            padding: "20px 32px",
            border: "2px solid #383838",
            borderTop: "none",
            borderRadius: "0 0 2px 2px"
          }}>
            <div style={{
              fontSize: "11px",
              color: "#383838",
              textAlign: "center"
            }}>
              Need to make changes? <a href={deliveryUrl} style={{ color: "#383838", fontWeight: "bold" }}>Edit delivery</a> or <a href={dashboardUrl} style={{ color: "#383838", fontWeight: "bold" }}>go to dashboard</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION B: Soft Brutalist
 */
function VariationB({ userName, letterTitle, deliveryDate, deliveryMethod, recipientEmail, deliveryUrl, dashboardUrl }: {
  userName: string
  letterTitle: string
  deliveryDate: string
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  deliveryUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "48px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Centered Header */}
        <tr>
          <td style={{ textAlign: "center", paddingBottom: "32px" }}>
            <div style={{
              fontSize: "22px",
              fontWeight: "normal",
              color: "#383838"
            }}>
              Capsule Note
            </div>
            <div style={{
              fontSize: "11px",
              color: "#666666",
              marginTop: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.1em"
            }}>
              Time Capsule for Your Thoughts
            </div>
          </td>
        </tr>

        {/* Main Card */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px"
            }}>
              {/* Accent Bar */}
              <div style={{
                backgroundColor: "#6FC2FF",
                height: "6px"
              }} />

              <div style={{ padding: "40px" }}>
                {/* Status Icon */}
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#6FC2FF",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  fontSize: "28px",
                  boxShadow: "-3px 3px 0 #383838"
                }}>
                  📅
                </div>

                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0"
                }}>
                  Delivery Scheduled
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  lineHeight: "1.6"
                }}>
                  Hi {userName}, we've locked in your delivery. Here's the summary:
                </p>

                {/* Timeline Visual */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "1px solid rgba(56,56,56,0.15)",
                  borderRadius: "2px",
                  padding: "24px",
                  marginBottom: "32px"
                }}>
                  {/* Now */}
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#38C1B0",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      marginRight: "16px",
                      marginTop: "4px",
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#38C1B0", fontWeight: "bold" }}>Now</div>
                      <div style={{ fontSize: "14px", color: "#383838" }}>Letter encrypted & scheduled</div>
                    </div>
                  </div>

                  {/* Line */}
                  <div style={{ borderLeft: "2px dashed rgba(56,56,56,0.2)", height: "24px", marginLeft: "5px" }} />

                  {/* Delivery */}
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#6FC2FF",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      marginRight: "16px",
                      marginTop: "4px",
                      flexShrink: 0
                    }} />
                    <div>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6FC2FF", fontWeight: "bold" }}>Delivery</div>
                      <div style={{ fontSize: "14px", color: "#383838", fontWeight: "bold" }}>{deliveryDate}</div>
                    </div>
                  </div>
                </div>

                {/* Details Table */}
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%", marginBottom: "32px" }}>
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid rgba(56,56,56,0.1)" }}>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666", marginBottom: "4px" }}>Letter</div>
                      <div style={{ fontSize: "14px", color: "#383838" }}>{letterTitle}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid rgba(56,56,56,0.1)" }}>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666", marginBottom: "4px" }}>Delivery Method</div>
                      <div style={{ fontSize: "14px", color: "#383838" }}>{deliveryMethod === "email" ? "Email delivery" : "Physical mail"}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 0" }}>
                      <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666", marginBottom: "4px" }}>Recipient</div>
                      <div style={{ fontSize: "14px", color: "#383838" }}>{recipientEmail}</div>
                    </td>
                  </tr>
                </table>

                {/* Buttons */}
                <table cellPadding={0} cellSpacing={0}>
                  <tr>
                    <td style={{ paddingRight: "12px" }}>
                      <a href={deliveryUrl} style={{
                        display: "inline-block",
                        backgroundColor: "#6FC2FF",
                        color: "#383838",
                        padding: "14px 24px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        View Details
                      </a>
                    </td>
                    <td>
                      <a href={`${deliveryUrl}/edit`} style={{
                        display: "inline-block",
                        backgroundColor: "#ffffff",
                        color: "#383838",
                        padding: "14px 24px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        Edit Delivery
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#666666" }}>
              <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a> · <a href={`${dashboardUrl}/settings`} style={{ color: "#383838" }}>Notification Settings</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION C: Playful Status
 */
function VariationC({ userName, letterTitle, deliveryDate, deliveryMethod, recipientEmail, deliveryUrl, dashboardUrl }: {
  userName: string
  letterTitle: string
  deliveryDate: string
  deliveryMethod: "email" | "mail"
  recipientEmail: string
  deliveryUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#6FC2FF", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{ paddingBottom: "24px" }}>
            <span style={{
              display: "inline-block",
              backgroundColor: "#FFDE00",
              color: "#383838",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-2px 2px 0 #383838"
            }}>
              Capsule Note
            </span>
          </td>
        </tr>

        {/* Main Card */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-8px 8px 0 #383838",
              position: "relative"
            }}>
              {/* Floating Status Badge */}
              <div style={{
                position: "absolute",
                top: "-14px",
                right: "24px",
                backgroundColor: "#6FC2FF",
                color: "#383838",
                padding: "6px 14px",
                fontSize: "11px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                border: "2px solid #383838",
                borderRadius: "2px"
              }}>
                ⏰ Scheduled
              </div>

              <div style={{ padding: "48px 32px 40px" }}>
                {/* Big Announcement */}
                <div style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#666666",
                  marginBottom: "8px"
                }}>
                  Mark Your Calendar
                </div>

                <h1 style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#383838",
                  margin: "0 0 24px 0",
                  lineHeight: "1.1"
                }}>
                  {deliveryDate.split(" at ")[0]}
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0"
                }}>
                  {userName}, your letter will arrive at exactly <strong>{deliveryDate.split(" at ")[1]}</strong>
                </p>

                {/* Letter Card */}
                <div style={{
                  backgroundColor: "#FFDE00",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "24px"
                }}>
                  <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                    <tr>
                      <td>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#383838", marginBottom: "4px" }}>📝 Letter</div>
                        <div style={{ fontSize: "16px", fontWeight: "bold", color: "#383838" }}>"{letterTitle}"</div>
                      </td>
                    </tr>
                  </table>
                </div>

                {/* Delivery Info Pills */}
                <table cellPadding={0} cellSpacing={0} style={{ marginBottom: "32px" }}>
                  <tr>
                    <td style={{ paddingRight: "8px", paddingBottom: "8px" }}>
                      <span style={{
                        display: "inline-block",
                        backgroundColor: "#F4EFE2",
                        padding: "8px 14px",
                        fontSize: "12px",
                        color: "#383838",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        {deliveryMethod === "email" ? "📧 Email" : "📮 Mail"}
                      </span>
                    </td>
                    <td style={{ paddingBottom: "8px" }}>
                      <span style={{
                        display: "inline-block",
                        backgroundColor: "#F4EFE2",
                        padding: "8px 14px",
                        fontSize: "12px",
                        color: "#383838",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        To: {recipientEmail}
                      </span>
                    </td>
                  </tr>
                </table>

                {/* Countdown Visual */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "32px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666", marginBottom: "8px" }}>
                    Countdown Started
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#383838" }}>
                    ⏳ Waiting for the perfect moment...
                  </div>
                </div>

                {/* Actions */}
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td style={{ width: "50%", paddingRight: "6px" }}>
                      <a href={deliveryUrl} style={{
                        display: "block",
                        backgroundColor: "#383838",
                        color: "#ffffff",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        View Details
                      </a>
                    </td>
                    <td style={{ width: "50%", paddingLeft: "6px" }}>
                      <a href={`${deliveryUrl}/reschedule`} style={{
                        display: "block",
                        backgroundColor: "#ffffff",
                        color: "#383838",
                        padding: "16px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        Reschedule
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "24px 0", textAlign: "center" }}>
            <a href={dashboardUrl} style={{
              fontSize: "12px",
              color: "#383838",
              fontWeight: "bold"
            }}>
              Go to Dashboard →
            </a>
          </td>
        </tr>
      </table>
    </div>
  )
}
