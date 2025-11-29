"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Welcome Email - 3 Variations
 * Sent after user creates account (NEW - not yet implemented)
 */
export function WelcomeEmails({ variation }: EmailProps) {
  const sampleData = {
    userName: "Alex",
    dashboardUrl: "https://capsulenote.com/dashboard",
    writeLetterUrl: "https://capsulenote.com/letters/new",
    guidesUrl: "https://capsulenote.com/guides",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist - Bold Welcome
 */
function VariationA({ userName, dashboardUrl, writeLetterUrl, guidesUrl }: {
  userName: string
  dashboardUrl: string
  writeLetterUrl: string
  guidesUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#383838", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#FFDE00",
            padding: "32px",
            border: "2px solid #383838",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#383838",
              marginBottom: "8px"
            }}>
              Welcome to Capsule Note!
            </div>
            <div style={{
              fontSize: "14px",
              color: "#383838"
            }}>
              Your journey to your future self starts now
            </div>
          </td>
        </tr>

        {/* Main */}
        <tr>
          <td style={{
            backgroundColor: "#ffffff",
            border: "2px solid #383838",
            borderTop: "none",
            padding: "40px 32px"
          }}>
            <p style={{
              fontSize: "16px",
              color: "#383838",
              margin: "0 0 32px 0",
              lineHeight: "1.6"
            }}>
              Hey {userName}! 👋<br /><br />
              We're thrilled to have you. Capsule Note is where you write letters to your future self — capturing thoughts, goals, and moments that matter.
            </p>

            {/* Feature Cards */}
            <div style={{ marginBottom: "32px" }}>
              {/* Feature 1 */}
              <div style={{
                backgroundColor: "#F4EFE2",
                border: "2px solid #383838",
                borderRadius: "2px",
                padding: "20px",
                marginBottom: "12px",
                boxShadow: "-3px 3px 0 #383838"
              }}>
                <table cellPadding={0} cellSpacing={0}>
                  <tr>
                    <td style={{ width: "48px", verticalAlign: "top" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#6FC2FF",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px"
                      }}>
                        ✏️
                      </div>
                    </td>
                    <td style={{ paddingLeft: "16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#383838", marginBottom: "4px" }}>Write Your First Letter</div>
                      <div style={{ fontSize: "13px", color: "#666666" }}>Capture your current thoughts, hopes, or goals</div>
                    </td>
                  </tr>
                </table>
              </div>

              {/* Feature 2 */}
              <div style={{
                backgroundColor: "#F4EFE2",
                border: "2px solid #383838",
                borderRadius: "2px",
                padding: "20px",
                marginBottom: "12px",
                boxShadow: "-3px 3px 0 #383838"
              }}>
                <table cellPadding={0} cellSpacing={0}>
                  <tr>
                    <td style={{ width: "48px", verticalAlign: "top" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#FFDE00",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px"
                      }}>
                        📅
                      </div>
                    </td>
                    <td style={{ paddingLeft: "16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#383838", marginBottom: "4px" }}>Schedule Delivery</div>
                      <div style={{ fontSize: "13px", color: "#666666" }}>Choose when to receive it — via email or physical mail</div>
                    </td>
                  </tr>
                </table>
              </div>

              {/* Feature 3 */}
              <div style={{
                backgroundColor: "#F4EFE2",
                border: "2px solid #383838",
                borderRadius: "2px",
                padding: "20px",
                boxShadow: "-3px 3px 0 #383838"
              }}>
                <table cellPadding={0} cellSpacing={0}>
                  <tr>
                    <td style={{ width: "48px", verticalAlign: "top" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#38C1B0",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px"
                      }}>
                        🔒
                      </div>
                    </td>
                    <td style={{ paddingLeft: "16px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#383838", marginBottom: "4px" }}>Bank-Grade Encryption</div>
                      <div style={{ fontSize: "13px", color: "#666666" }}>AES-256 encryption keeps your letters completely private</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            {/* CTA */}
            <a href={writeLetterUrl} style={{
              display: "inline-block",
              backgroundColor: "#6FC2FF",
              color: "#383838",
              padding: "18px 36px",
              fontSize: "14px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textDecoration: "none",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              Write Your First Letter →
            </a>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#FFDE00",
            padding: "24px 32px",
            border: "2px solid #383838",
            borderTop: "none"
          }}>
            <div style={{ fontSize: "12px", color: "#383838", textAlign: "center" }}>
              Need inspiration? Check out our <a href={guidesUrl} style={{ color: "#383838", fontWeight: "bold" }}>writing guides</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION B: Soft Brutalist - Warm Welcome
 */
function VariationB({ userName, dashboardUrl, writeLetterUrl, guidesUrl }: {
  userName: string
  dashboardUrl: string
  writeLetterUrl: string
  guidesUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "48px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: "center", paddingBottom: "32px" }}>
            <div style={{ fontSize: "22px", color: "#383838" }}>Capsule Note</div>
            <div style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>Letters to Your Future Self</div>
          </td>
        </tr>

        {/* Main Card */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-6px 6px 0 rgba(56,56,56,0.08)"
            }}>
              {/* Teal Bar */}
              <div style={{ backgroundColor: "#38C1B0", height: "6px" }} />

              <div style={{ padding: "48px 40px" }}>
                {/* Welcome Icon */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#FFDE00",
                    border: "2px solid #383838",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "36px"
                  }}>
                    ✉️
                  </div>
                </div>

                <h1 style={{
                  fontSize: "28px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Welcome, {userName}!
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 40px 0",
                  textAlign: "center",
                  lineHeight: "1.7"
                }}>
                  You've just opened a channel to your future self.<br />
                  What will you tell them?
                </p>

                {/* Steps */}
                <div style={{ marginBottom: "40px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#6FC2FF",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginRight: "16px",
                      flexShrink: 0
                    }}>
                      1
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#383838" }}>Write a Letter</div>
                      <div style={{ fontSize: "13px", color: "#666666", marginTop: "4px" }}>Share your thoughts, dreams, or advice</div>
                    </div>
                  </div>

                  <div style={{ borderLeft: "2px dashed rgba(56,56,56,0.15)", height: "16px", marginLeft: "15px" }} />

                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#FFDE00",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginRight: "16px",
                      flexShrink: 0
                    }}>
                      2
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#383838" }}>Pick a Date</div>
                      <div style={{ fontSize: "13px", color: "#666666", marginTop: "4px" }}>When should future-you receive it?</div>
                    </div>
                  </div>

                  <div style={{ borderLeft: "2px dashed rgba(56,56,56,0.15)", height: "16px", marginLeft: "15px" }} />

                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#38C1B0",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginRight: "16px",
                      flexShrink: 0,
                      color: "#ffffff"
                    }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#383838" }}>Receive & Reflect</div>
                      <div style={{ fontSize: "13px", color: "#666666", marginTop: "4px" }}>A gift from your past self arrives</div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center" }}>
                  <a href={writeLetterUrl} style={{
                    display: "inline-block",
                    backgroundColor: "#6FC2FF",
                    color: "#383838",
                    padding: "16px 40px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textDecoration: "none",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    Start Writing
                  </a>
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#666666" }}>
              <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a> · <a href={guidesUrl} style={{ color: "#383838" }}>Guides</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION C: Playful Status - Celebration
 */
function VariationC({ userName, dashboardUrl, writeLetterUrl, guidesUrl }: {
  userName: string
  dashboardUrl: string
  writeLetterUrl: string
  guidesUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#38C1B0", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Celebration Header */}
        <tr>
          <td style={{ paddingBottom: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎉</div>
            <span style={{
              display: "inline-block",
              backgroundColor: "#FFDE00",
              color: "#383838",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-2px 2px 0 #383838"
            }}>
              Welcome to Capsule Note!
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
              boxShadow: "-8px 8px 0 #FFDE00, -10px 10px 0 #383838",
              position: "relative"
            }}>
              {/* Floating Badge */}
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                backgroundColor: "#38C1B0",
                color: "#ffffff",
                padding: "4px 12px",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "2px solid #383838",
                borderRadius: "2px"
              }}>
                🚀 You're In!
              </div>

              <div style={{ padding: "48px 32px 40px" }}>
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Hey {userName}! 👋
                </h1>

                <p style={{
                  fontSize: "16px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center",
                  lineHeight: "1.6"
                }}>
                  Ready to send a message to your future self?
                </p>

                {/* Quick Actions */}
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%", marginBottom: "24px" }}>
                  <tr>
                    <td style={{ width: "50%", paddingRight: "6px" }}>
                      <a href={writeLetterUrl} style={{
                        display: "block",
                        backgroundColor: "#6FC2FF",
                        color: "#383838",
                        padding: "20px 16px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        boxShadow: "-3px 3px 0 #383838"
                      }}>
                        ✏️ Write Now
                      </a>
                    </td>
                    <td style={{ width: "50%", paddingLeft: "6px" }}>
                      <a href={dashboardUrl} style={{
                        display: "block",
                        backgroundColor: "#FFDE00",
                        color: "#383838",
                        padding: "20px 16px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        boxShadow: "-3px 3px 0 #383838"
                      }}>
                        📋 Dashboard
                      </a>
                    </td>
                  </tr>
                </table>

                {/* Features */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "20px"
                }}>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666", marginBottom: "12px", textAlign: "center" }}>
                    What You Can Do
                  </div>
                  <div style={{ fontSize: "14px", color: "#383838", lineHeight: "1.8", textAlign: "center" }}>
                    📝 Write letters to future-you<br />
                    📬 Get them via email or real mail<br />
                    🔒 Everything encrypted & private
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#ffffff" }}>
              Need help? <a href={guidesUrl} style={{ color: "#FFDE00", fontWeight: "bold" }}>Check our guides</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}
