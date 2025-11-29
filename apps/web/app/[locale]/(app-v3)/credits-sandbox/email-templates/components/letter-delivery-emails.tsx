"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Letter Delivery Email - 3 Variations
 * The actual letter delivered to the user's future self
 */
export function LetterDeliveryEmails({ variation }: EmailProps) {
  const sampleData = {
    letterTitle: "Reflections on My 30th Year",
    letterContent: `<p>Dear Future Me,</p>
<p>I hope this letter finds you well. As I write this, I'm sitting in my favorite coffee shop, watching the rain outside and thinking about where life might take us.</p>
<p>Right now, I'm working on becoming a better version of myself. I've started meditating every morning, reading more books, and trying to be more present in my daily life.</p>
<p><strong>My hopes for you:</strong></p>
<ul>
<li>That you've found peace with the decisions we made</li>
<li>That you're surrounded by people who love you</li>
<li>That you still remember to laugh at yourself</li>
</ul>
<p>Remember: you are stronger than you think.</p>
<p>With love,<br/>Past You</p>`,
    writtenDate: "January 15, 2024",
    deliveryUrl: "https://capsulenote.com/letters/abc123",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist - Dramatic Envelope Opening
 */
function VariationA({ letterTitle, letterContent, writtenDate, deliveryUrl, dashboardUrl }: {
  letterTitle: string
  letterContent: string
  writtenDate: string
  deliveryUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#383838", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Dramatic Header */}
        <tr>
          <td style={{
            backgroundColor: "#FFDE00",
            padding: "32px",
            border: "2px solid #383838",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#383838",
              marginBottom: "12px"
            }}>
              A Letter From Your Past
            </div>
            <div style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#383838",
              lineHeight: "1.2"
            }}>
              📬 It's Time.
            </div>
          </td>
        </tr>

        {/* Letter Container */}
        <tr>
          <td style={{
            backgroundColor: "#F4EFE2",
            border: "2px solid #383838",
            borderTop: "none",
            padding: "0"
          }}>
            {/* Letter Header */}
            <div style={{
              backgroundColor: "#ffffff",
              borderBottom: "2px solid #383838",
              padding: "24px 32px"
            }}>
              <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                <tr>
                  <td>
                    <div style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#666666",
                      marginBottom: "4px"
                    }}>
                      Letter Title
                    </div>
                    <div style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "#383838"
                    }}>
                      {letterTitle}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#666666",
                      marginBottom: "4px"
                    }}>
                      Written
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#383838"
                    }}>
                      {writtenDate}
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            {/* Letter Content */}
            <div style={{
              padding: "40px 32px",
              backgroundColor: "#ffffff",
              fontSize: "15px",
              lineHeight: "1.8",
              color: "#383838"
            }} dangerouslySetInnerHTML={{ __html: letterContent }} />

            {/* Letter Footer */}
            <div style={{
              backgroundColor: "#F4EFE2",
              borderTop: "2px dashed rgba(56,56,56,0.2)",
              padding: "24px 32px",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "11px",
                color: "#666666",
                marginBottom: "16px"
              }}>
                🔒 This letter was encrypted and stored securely until today
              </div>
              <a href={deliveryUrl} style={{
                display: "inline-block",
                backgroundColor: "#383838",
                color: "#ffffff",
                padding: "14px 28px",
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textDecoration: "none",
                border: "2px solid #383838",
                borderRadius: "2px"
              }}>
                View on Capsule Note
              </a>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            padding: "24px 32px",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#FFDE00",
              marginBottom: "8px"
            }}>
              Capsule Note
            </div>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.6)"
            }}>
              <a href={dashboardUrl} style={{ color: "#ffffff" }}>Dashboard</a> · <a href={`${dashboardUrl}/settings`} style={{ color: "#ffffff" }}>Settings</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION B: Soft Brutalist - Elegant Paper
 */
function VariationB({ letterTitle, letterContent, writtenDate, deliveryUrl, dashboardUrl }: {
  letterTitle: string
  letterContent: string
  writtenDate: string
  deliveryUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "48px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Pre-header */}
        <tr>
          <td style={{ textAlign: "center", paddingBottom: "32px" }}>
            <div style={{
              display: "inline-block",
              backgroundColor: "#38C1B0",
              color: "#ffffff",
              padding: "6px 16px",
              fontSize: "10px",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              border: "2px solid #383838",
              borderRadius: "2px"
            }}>
              ✉️ Letter Delivered
            </div>
          </td>
        </tr>

        {/* Main Letter */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-6px 6px 0 rgba(56,56,56,0.08)"
            }}>
              {/* Top Stamp Area */}
              <div style={{
                padding: "24px 32px",
                borderBottom: "1px dashed rgba(56,56,56,0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#666666"
                  }}>
                    From Your Past Self
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "#383838",
                    marginTop: "4px"
                  }}>
                    Written on {writtenDate}
                  </div>
                </div>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#FFDE00",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px"
                }}>
                  💌
                </div>
              </div>

              {/* Title */}
              <div style={{
                padding: "32px 32px 0",
                textAlign: "center"
              }}>
                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0",
                  lineHeight: "1.3"
                }}>
                  "{letterTitle}"
                </h1>
              </div>

              {/* Decorative Divider */}
              <div style={{
                padding: "24px 32px",
                textAlign: "center"
              }}>
                <div style={{
                  display: "inline-block",
                  width: "60px",
                  height: "2px",
                  backgroundColor: "#383838"
                }} />
              </div>

              {/* Letter Content */}
              <div style={{
                padding: "0 40px 40px",
                fontSize: "15px",
                lineHeight: "1.9",
                color: "#383838"
              }} dangerouslySetInnerHTML={{ __html: letterContent }} />

              {/* CTA Section */}
              <div style={{
                backgroundColor: "#F4EFE2",
                padding: "24px 32px",
                textAlign: "center",
                borderTop: "1px solid rgba(56,56,56,0.1)"
              }}>
                <a href={deliveryUrl} style={{
                  display: "inline-block",
                  backgroundColor: "#6FC2FF",
                  color: "#383838",
                  padding: "14px 32px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  border: "2px solid #383838",
                  borderRadius: "2px"
                }}>
                  View Full Letter →
                </a>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{
              fontSize: "18px",
              color: "#383838",
              marginBottom: "8px"
            }}>
              Capsule Note
            </div>
            <div style={{
              fontSize: "11px",
              color: "#666666"
            }}>
              Letters to your future self · <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a>
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
function VariationC({ letterTitle, letterContent, writtenDate, deliveryUrl, dashboardUrl }: {
  letterTitle: string
  letterContent: string
  writtenDate: string
  deliveryUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#38C1B0", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Celebration Header */}
        <tr>
          <td style={{ paddingBottom: "24px", textAlign: "center" }}>
            <div style={{
              fontSize: "40px",
              marginBottom: "8px"
            }}>
              🎉
            </div>
            <div style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#ffffff"
            }}>
              The wait is over
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
              boxShadow: "-8px 8px 0 #383838",
              overflow: "hidden"
            }}>
              {/* Floating Badge */}
              <div style={{
                backgroundColor: "#FFDE00",
                padding: "16px 24px",
                borderBottom: "2px solid #383838"
              }}>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#383838"
                      }}>
                        📬 A Letter From {writtenDate}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span style={{
                        display: "inline-block",
                        backgroundColor: "#38C1B0",
                        color: "#ffffff",
                        padding: "4px 10px",
                        fontSize: "9px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        ✓ Delivered
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              {/* Title Section */}
              <div style={{
                padding: "32px 24px 24px",
                textAlign: "center",
                backgroundColor: "#F4EFE2"
              }}>
                <h1 style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#383838",
                  margin: "0",
                  lineHeight: "1.2"
                }}>
                  {letterTitle}
                </h1>
              </div>

              {/* Letter Content */}
              <div style={{
                padding: "32px 24px",
                backgroundColor: "#ffffff",
                fontSize: "15px",
                lineHeight: "1.8",
                color: "#383838",
                borderTop: "2px dashed rgba(56,56,56,0.15)"
              }} dangerouslySetInnerHTML={{ __html: letterContent }} />

              {/* Action Section */}
              <div style={{
                padding: "24px",
                backgroundColor: "#F4EFE2",
                borderTop: "2px solid #383838"
              }}>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td style={{ width: "50%", paddingRight: "8px" }}>
                      <a href={deliveryUrl} style={{
                        display: "block",
                        backgroundColor: "#6FC2FF",
                        color: "#383838",
                        padding: "14px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        View Online
                      </a>
                    </td>
                    <td style={{ width: "50%", paddingLeft: "8px" }}>
                      <a href={`${deliveryUrl}/write`} style={{
                        display: "block",
                        backgroundColor: "#FFDE00",
                        color: "#383838",
                        padding: "14px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        textAlign: "center",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        Write Back ✏️
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
            <div style={{
              display: "inline-block",
              backgroundColor: "#FFDE00",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "#383838",
              border: "2px solid #383838",
              borderRadius: "2px"
            }}>
              Capsule Note
            </div>
            <div style={{
              marginTop: "16px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.8)"
            }}>
              <a href={dashboardUrl} style={{ color: "#ffffff" }}>Dashboard</a> · <a href={`${dashboardUrl}/settings`} style={{ color: "#ffffff" }}>Settings</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}
