"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Letter Created Email - 3 Variations
 * Sent immediately after a user creates a letter
 */
export function LetterCreatedEmails({ variation }: EmailProps) {
  const sampleData = {
    userName: "Alex",
    letterTitle: "Reflections on My 30th Year",
    letterUrl: "https://capsulenote.com/letters/abc123",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") {
    return <VariationA {...sampleData} />
  }
  if (variation === "B") {
    return <VariationB {...sampleData} />
  }
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist
 * Bold shadows, maximum contrast, charcoal-heavy
 */
function VariationA({ userName, letterTitle, letterUrl, dashboardUrl }: {
  userName: string
  letterTitle: string
  letterUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "24px 32px",
            borderRadius: "2px 2px 0 0"
          }}>
            <div style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#FFDE00",
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}>
              Capsule Note
            </div>
            <div style={{
              fontSize: "11px",
              color: "#ffffff",
              marginTop: "4px",
              letterSpacing: "0.02em",
              textTransform: "uppercase"
            }}>
              Letters to Your Future Self
            </div>
          </td>
        </tr>

        {/* Main Content */}
        <tr>
          <td style={{
            backgroundColor: "#ffffff",
            border: "2px solid #383838",
            borderTop: "none",
            padding: "40px 32px"
          }}>
            {/* Success Badge */}
            <div style={{ marginBottom: "24px" }}>
              <span style={{
                display: "inline-block",
                backgroundColor: "#38C1B0",
                color: "#ffffff",
                padding: "6px 12px",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "2px solid #383838",
                borderRadius: "2px",
                boxShadow: "-2px 2px 0 #383838"
              }}>
                ✓ Letter Saved & Encrypted
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "28px",
              fontWeight: "normal",
              color: "#383838",
              margin: "0 0 16px 0",
              lineHeight: "1.2"
            }}>
              Your Letter is Safe
            </h1>

            <p style={{
              fontSize: "15px",
              color: "#383838",
              margin: "0 0 32px 0",
              lineHeight: "1.6"
            }}>
              Hey {userName}, your letter has been encrypted and securely stored. Only you can read it.
            </p>

            {/* Letter Card */}
            <div style={{
              backgroundColor: "#F4EFE2",
              border: "2px solid #383838",
              padding: "24px",
              marginBottom: "32px",
              borderRadius: "2px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              <div style={{
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#383838",
                marginBottom: "8px"
              }}>
                Your Letter
              </div>
              <div style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#383838"
              }}>
                "{letterTitle}"
              </div>
            </div>

            {/* CTA Button */}
            <div style={{ marginBottom: "32px" }}>
              <a href={letterUrl} style={{
                display: "inline-block",
                backgroundColor: "#6FC2FF",
                color: "#383838",
                padding: "16px 32px",
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textDecoration: "none",
                border: "2px solid #383838",
                borderRadius: "2px",
                boxShadow: "-4px 4px 0 #383838"
              }}>
                View Your Letter →
              </a>
            </div>

            {/* Separator */}
            <div style={{
              borderTop: "2px dashed rgba(56,56,56,0.2)",
              margin: "32px 0"
            }} />

            {/* Next Steps */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#383838",
                marginBottom: "16px"
              }}>
                What's Next?
              </div>
              <div style={{ fontSize: "14px", color: "#383838", lineHeight: "2" }}>
                <div>→ Schedule a delivery date to your future self</div>
                <div>→ Edit your letter anytime before delivery</div>
                <div>→ Write more letters to capture different moments</div>
              </div>
            </div>

            {/* Dashboard Link */}
            <a href={dashboardUrl} style={{
              display: "inline-block",
              backgroundColor: "#ffffff",
              color: "#383838",
              padding: "12px 24px",
              fontSize: "12px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textDecoration: "none",
              border: "2px solid #383838",
              borderRadius: "2px"
            }}>
              Go to Dashboard
            </a>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "24px 32px",
            borderRadius: "0 0 2px 2px"
          }}>
            <div style={{
              fontSize: "11px",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: "1.8"
            }}>
              You received this because you created a letter on Capsule Note.<br />
              <a href={`${dashboardUrl}/settings`} style={{ color: "#FFDE00", textDecoration: "underline" }}>
                Manage notifications
              </a>
            </div>
            <div style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.5)",
              textAlign: "center",
              marginTop: "16px"
            }}>
              © 2025 Capsule Note. All rights reserved.
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION B: Soft Brutalist
 * Cream tones, lighter touch, more breathing room
 */
function VariationB({ userName, letterTitle, letterUrl, dashboardUrl }: {
  userName: string
  letterTitle: string
  letterUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{ padding: "0 0 24px 0", textAlign: "center" }}>
            <div style={{
              fontSize: "24px",
              fontWeight: "normal",
              color: "#383838",
              letterSpacing: "0.02em"
            }}>
              Capsule Note
            </div>
          </td>
        </tr>

        {/* Main Card */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-6px 6px 0 rgba(56,56,56,0.1)",
              overflow: "hidden"
            }}>
              {/* Top Accent */}
              <div style={{
                backgroundColor: "#38C1B0",
                height: "4px"
              }} />

              {/* Content */}
              <div style={{ padding: "48px 40px" }}>
                {/* Icon */}
                <div style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#FFDE00",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  fontSize: "24px"
                }}>
                  ✉️
                </div>

                <h1 style={{
                  fontSize: "26px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 12px 0",
                  lineHeight: "1.3"
                }}>
                  Letter Created Successfully
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  lineHeight: "1.7"
                }}>
                  Hi {userName}, your letter has been encrypted with AES-256 and safely stored. It's waiting for you to schedule its delivery.
                </p>

                {/* Letter Preview */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "1px solid rgba(56,56,56,0.2)",
                  borderLeft: "4px solid #FFDE00",
                  padding: "20px 24px",
                  marginBottom: "32px",
                  borderRadius: "2px"
                }}>
                  <div style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#666666",
                    marginBottom: "6px"
                  }}>
                    Letter Title
                  </div>
                  <div style={{
                    fontSize: "17px",
                    color: "#383838"
                  }}>
                    {letterTitle}
                  </div>
                </div>

                {/* Buttons */}
                <div style={{ marginBottom: "32px" }}>
                  <a href={letterUrl} style={{
                    display: "inline-block",
                    backgroundColor: "#6FC2FF",
                    color: "#383838",
                    padding: "14px 28px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textDecoration: "none",
                    border: "2px solid #383838",
                    borderRadius: "2px",
                    marginRight: "12px"
                  }}>
                    View Letter
                  </a>
                  <a href={`${letterUrl}/schedule`} style={{
                    display: "inline-block",
                    backgroundColor: "#ffffff",
                    color: "#383838",
                    padding: "14px 28px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textDecoration: "none",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    Schedule Delivery
                  </a>
                </div>

                {/* Steps */}
                <div style={{
                  borderTop: "1px dashed rgba(56,56,56,0.2)",
                  paddingTop: "24px"
                }}>
                  <div style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#666666",
                    marginBottom: "16px"
                  }}>
                    Next Steps
                  </div>
                  <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                    <tr>
                      <td style={{ padding: "8px 0", fontSize: "14px", color: "#383838" }}>
                        <span style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: "#FFDE00",
                          border: "1px solid #383838",
                          borderRadius: "2px",
                          textAlign: "center",
                          lineHeight: "18px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          marginRight: "12px"
                        }}>1</span>
                        Schedule when you want to receive it
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0", fontSize: "14px", color: "#383838" }}>
                        <span style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: "#FFDE00",
                          border: "1px solid #383838",
                          borderRadius: "2px",
                          textAlign: "center",
                          lineHeight: "18px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          marginRight: "12px"
                        }}>2</span>
                        Edit anytime before delivery
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "8px 0", fontSize: "14px", color: "#383838" }}>
                        <span style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: "#FFDE00",
                          border: "1px solid #383838",
                          borderRadius: "2px",
                          textAlign: "center",
                          lineHeight: "18px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          marginRight: "12px"
                        }}>3</span>
                        Receive it via email or physical mail
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0 0", textAlign: "center" }}>
            <div style={{
              fontSize: "11px",
              color: "#666666",
              lineHeight: "1.8"
            }}>
              You received this because you created a letter.<br />
              <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a>
              {" · "}
              <a href={`${dashboardUrl}/settings`} style={{ color: "#383838" }}>Settings</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION C: Playful Status
 * Color-led, floating badges, high contrast
 */
function VariationC({ userName, letterTitle, letterUrl, dashboardUrl }: {
  userName: string
  letterTitle: string
  letterUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#ffffff", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header with Logo */}
        <tr>
          <td style={{ padding: "0 0 32px 0" }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: "#FFDE00",
                    padding: "8px 16px",
                    border: "2px solid #383838",
                    borderRadius: "2px",
                    boxShadow: "-2px 2px 0 #383838"
                  }}>
                    <span style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#383838",
                      letterSpacing: "0.02em"
                    }}>
                      Capsule Note
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#38C1B0",
                    color: "#ffffff",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    ✓ Saved
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Main Content Card */}
        <tr>
          <td>
            <div style={{
              position: "relative",
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-8px 8px 0 #FFDE00, -10px 10px 0 #383838"
            }}>
              {/* Floating Badge */}
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                backgroundColor: "#FFDE00",
                padding: "4px 12px",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#383838",
                border: "2px solid #383838",
                borderRadius: "2px"
              }}>
                📝 New Letter
              </div>

              <div style={{ padding: "48px 32px 40px" }}>
                {/* Greeting */}
                <h1 style={{
                  fontSize: "32px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  lineHeight: "1.1"
                }}>
                  Hey {userName}! 👋
                </h1>

                <p style={{
                  fontSize: "16px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  lineHeight: "1.6"
                }}>
                  Your letter is now encrypted and safely stored.
                </p>

                {/* Letter Card with Status */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginBottom: "32px"
                }}>
                  {/* Status Bar */}
                  <div style={{
                    backgroundColor: "#FFDE00",
                    padding: "8px 16px",
                    borderBottom: "2px solid #383838",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#383838"
                    }}>
                      ✏️ Draft
                    </span>
                    <span style={{
                      fontSize: "10px",
                      color: "#383838"
                    }}>
                      · Ready to schedule
                    </span>
                  </div>

                  {/* Letter Info */}
                  <div style={{ padding: "20px" }}>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#383838",
                      marginBottom: "8px"
                    }}>
                      "{letterTitle}"
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#666666"
                    }}>
                      🔒 AES-256 encrypted · Created just now
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%", marginBottom: "32px" }}>
                  <tr>
                    <td style={{ width: "50%", paddingRight: "8px" }}>
                      <a href={letterUrl} style={{
                        display: "block",
                        backgroundColor: "#6FC2FF",
                        color: "#383838",
                        padding: "16px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        boxShadow: "-3px 3px 0 #383838"
                      }}>
                        View Letter
                      </a>
                    </td>
                    <td style={{ width: "50%", paddingLeft: "8px" }}>
                      <a href={`${letterUrl}/schedule`} style={{
                        display: "block",
                        backgroundColor: "#38C1B0",
                        color: "#ffffff",
                        padding: "16px",
                        fontSize: "13px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px",
                        boxShadow: "-3px 3px 0 #383838"
                      }}>
                        Schedule →
                      </a>
                    </td>
                  </tr>
                </table>

                {/* Quick Tips */}
                <div style={{
                  borderTop: "2px dashed rgba(56,56,56,0.15)",
                  paddingTop: "24px"
                }}>
                  <div style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#383838",
                    fontWeight: "bold",
                    marginBottom: "12px"
                  }}>
                    💡 Quick Tips
                  </div>
                  <div style={{ fontSize: "13px", color: "#666666", lineHeight: "1.8" }}>
                    → Schedule delivery for a meaningful date<br />
                    → You can edit until delivery day<br />
                    → Choose email or physical mail
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0 0" }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td style={{ textAlign: "center" }}>
                  <a href={dashboardUrl} style={{
                    display: "inline-block",
                    backgroundColor: "#ffffff",
                    color: "#383838",
                    padding: "10px 20px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textDecoration: "none",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    Go to Dashboard
                  </a>
                </td>
              </tr>
              <tr>
                <td style={{ paddingTop: "24px", textAlign: "center" }}>
                  <div style={{
                    fontSize: "10px",
                    color: "#999999"
                  }}>
                    © 2025 Capsule Note · <a href={`${dashboardUrl}/settings`} style={{ color: "#666666" }}>Manage emails</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  )
}
