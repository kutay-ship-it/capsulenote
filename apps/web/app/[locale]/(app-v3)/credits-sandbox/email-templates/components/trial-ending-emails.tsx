"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Trial Ending Email - 3 Variations
 * Sent 3 days before trial ends
 */
export function TrialEndingEmails({ variation }: EmailProps) {
  const sampleData = {
    daysRemaining: 3,
    trialEndsDate: "January 20, 2025",
    monthlyAmount: "$2.22",
    billingUrl: "https://capsulenote.com/settings/billing",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist
 */
function VariationA({ daysRemaining, trialEndsDate, monthlyAmount, billingUrl, dashboardUrl }: {
  daysRemaining: number
  trialEndsDate: string
  monthlyAmount: string
  billingUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#FFDE00",
            padding: "24px 32px",
            border: "2px solid #383838",
            borderBottom: "none"
          }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#383838" }}>Capsule Note</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#383838",
                    color: "#FFDE00",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    ⏰ Trial Ending
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
            borderTop: "none",
            padding: "40px 32px"
          }}>
            {/* Countdown */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "#383838",
                lineHeight: "1"
              }}>
                {daysRemaining}
              </div>
              <div style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#666666",
                marginTop: "8px"
              }}>
                Days Left in Your Trial
              </div>
            </div>

            <p style={{
              fontSize: "15px",
              color: "#666666",
              margin: "0 0 32px 0",
              lineHeight: "1.6",
              textAlign: "center"
            }}>
              Your free trial ends on <strong>{trialEndsDate}</strong>.<br />
              After that, you'll be charged <strong>{monthlyAmount}/month</strong>.
            </p>

            {/* Info Box */}
            <div style={{
              backgroundColor: "#F4EFE2",
              border: "2px solid #383838",
              borderRadius: "2px",
              padding: "24px",
              marginBottom: "32px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#383838",
                marginBottom: "12px"
              }}>
                What happens next?
              </div>
              <div style={{ fontSize: "14px", color: "#383838", lineHeight: "1.8" }}>
                → Your card will be charged {monthlyAmount} on {trialEndsDate}<br />
                → All your letters and deliveries continue as normal<br />
                → Cancel anytime before to avoid being charged
              </div>
            </div>

            {/* CTAs */}
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td style={{ width: "50%", paddingRight: "8px" }}>
                  <a href={dashboardUrl} style={{
                    display: "block",
                    backgroundColor: "#6FC2FF",
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
                    Keep Exploring
                  </a>
                </td>
                <td style={{ width: "50%", paddingLeft: "8px" }}>
                  <a href={billingUrl} style={{
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
                    Manage Subscription
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "20px 32px"
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              You can cancel anytime from your <a href={billingUrl} style={{ color: "#FFDE00" }}>billing settings</a>
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
function VariationB({ daysRemaining, trialEndsDate, monthlyAmount, billingUrl, dashboardUrl }: {
  daysRemaining: number
  trialEndsDate: string
  monthlyAmount: string
  billingUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "48px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: "center", paddingBottom: "32px" }}>
            <div style={{ fontSize: "22px", color: "#383838" }}>Capsule Note</div>
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
              {/* Yellow Bar */}
              <div style={{ backgroundColor: "#FFDE00", height: "4px" }} />

              <div style={{ padding: "40px" }}>
                {/* Clock Icon */}
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
                    ⏳
                  </div>
                </div>

                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Your Trial Ends Soon
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center"
                }}>
                  {daysRemaining} days remaining · Ends {trialEndsDate}
                </p>

                {/* Timeline */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  borderRadius: "2px",
                  padding: "24px",
                  marginBottom: "32px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor: "#38C1B0",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      marginRight: "12px",
                      flexShrink: 0
                    }}>
                      ✓
                    </div>
                    <div style={{ fontSize: "14px", color: "#383838" }}>
                      <strong>Now:</strong> Full access to Pro features
                    </div>
                  </div>
                  <div style={{ borderLeft: "2px dashed rgba(56,56,56,0.2)", height: "16px", marginLeft: "11px" }} />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      backgroundColor: "#FFDE00",
                      border: "2px solid #383838",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      marginRight: "12px",
                      flexShrink: 0
                    }}>
                      →
                    </div>
                    <div style={{ fontSize: "14px", color: "#383838" }}>
                      <strong>{trialEndsDate}:</strong> Charged {monthlyAmount}/month
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center" }}>
                  <a href={billingUrl} style={{
                    display: "inline-block",
                    backgroundColor: "#6FC2FF",
                    color: "#383838",
                    padding: "14px 32px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textDecoration: "none",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    Manage Subscription
                  </a>
                </div>

                <div style={{
                  fontSize: "12px",
                  color: "#666666",
                  textAlign: "center",
                  marginTop: "16px"
                }}>
                  Cancel anytime before {trialEndsDate}
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#666666" }}>
              <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a> · <a href={billingUrl} style={{ color: "#383838" }}>Billing</a>
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
function VariationC({ daysRemaining, trialEndsDate, monthlyAmount, billingUrl, dashboardUrl }: {
  daysRemaining: number
  trialEndsDate: string
  monthlyAmount: string
  billingUrl: string
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
              boxShadow: "-8px 8px 0 #FFDE00, -10px 10px 0 #383838"
            }}>
              <div style={{ padding: "48px 32px" }}>
                {/* Big Number */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: "#FFDE00",
                    padding: "20px 40px",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    <div style={{ fontSize: "64px", fontWeight: "bold", color: "#383838", lineHeight: "1" }}>
                      {daysRemaining}
                    </div>
                    <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#383838" }}>
                      Days Left
                    </div>
                  </div>
                </div>

                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Time Flies! ⏰
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center"
                }}>
                  Your free trial ends on {trialEndsDate}
                </p>

                {/* Pricing Card */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "32px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#666666", marginBottom: "4px" }}>After trial</div>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#383838" }}>{monthlyAmount}<span style={{ fontSize: "14px", fontWeight: "normal" }}>/mo</span></div>
                </div>

                {/* CTAs */}
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td style={{ width: "50%", paddingRight: "6px" }}>
                      <a href={dashboardUrl} style={{
                        display: "block",
                        backgroundColor: "#38C1B0",
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
                        Continue ✓
                      </a>
                    </td>
                    <td style={{ width: "50%", paddingLeft: "6px" }}>
                      <a href={billingUrl} style={{
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
                        Cancel
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
            <div style={{ fontSize: "11px", color: "#383838" }}>
              Cancel anytime · No questions asked
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}
