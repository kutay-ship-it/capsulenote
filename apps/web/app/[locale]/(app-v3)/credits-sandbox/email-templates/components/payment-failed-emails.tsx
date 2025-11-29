"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Payment Failed Email - 3 Variations
 * Sent when payment fails
 */
export function PaymentFailedEmails({ variation }: EmailProps) {
  const sampleData = {
    amount: "$9.00",
    attemptCount: 2,
    billingUrl: "https://capsulenote.com/settings/billing",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist - Urgent
 */
function VariationA({ amount, attemptCount, billingUrl, dashboardUrl }: {
  amount: string
  attemptCount: number
  billingUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#383838", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#FF7169",
            padding: "24px 32px",
            border: "2px solid #383838",
            borderBottom: "none"
          }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#ffffff" }}>Capsule Note</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#ffffff",
                    color: "#FF7169",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    ⚠️ Action Required
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
            <h1 style={{
              fontSize: "28px",
              fontWeight: "normal",
              color: "#383838",
              margin: "0 0 12px 0"
            }}>
              Payment Failed
            </h1>

            <p style={{
              fontSize: "15px",
              color: "#666666",
              margin: "0 0 32px 0",
              lineHeight: "1.6"
            }}>
              We couldn't process your payment of <strong>{amount}</strong>. This was attempt #{attemptCount}.
            </p>

            {/* Warning Box */}
            <div style={{
              backgroundColor: "#FF7169",
              border: "2px solid #383838",
              borderRadius: "2px",
              padding: "20px",
              marginBottom: "32px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              <div style={{
                fontSize: "14px",
                color: "#ffffff",
                fontWeight: "bold",
                marginBottom: "8px"
              }}>
                ⚠️ Your subscription may be canceled
              </div>
              <div style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.9)"
              }}>
                We'll try again automatically, but please update your payment method to avoid service interruption.
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              backgroundColor: "#F4EFE2",
              border: "2px solid #383838",
              borderRadius: "2px",
              padding: "20px",
              marginBottom: "32px"
            }}>
              <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#666666" }}>Amount due:</td>
                  <td style={{ padding: "8px 0", fontSize: "18px", color: "#383838", fontWeight: "bold", textAlign: "right" }}>{amount}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#666666" }}>Attempt:</td>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#FF7169", fontWeight: "bold", textAlign: "right" }}>#{attemptCount} of 4</td>
                </tr>
              </table>
            </div>

            {/* CTA */}
            <a href={billingUrl} style={{
              display: "inline-block",
              backgroundColor: "#FF7169",
              color: "#ffffff",
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
              Update Payment Method →
            </a>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "24px 32px"
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              Need help? <a href={`${dashboardUrl}/support`} style={{ color: "#FFDE00" }}>Contact support</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION B: Soft Brutalist - Helpful
 */
function VariationB({ amount, attemptCount, billingUrl, dashboardUrl }: {
  amount: string
  attemptCount: number
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
              {/* Red Bar */}
              <div style={{ backgroundColor: "#FF7169", height: "4px" }} />

              <div style={{ padding: "40px" }}>
                {/* Icon */}
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#FF7169",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  fontSize: "28px"
                }}>
                  💳
                </div>

                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0"
                }}>
                  We couldn't process your payment
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  lineHeight: "1.6"
                }}>
                  Don't worry, this happens sometimes. Let's get it sorted.
                </p>

                {/* Details */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "1px solid rgba(56,56,56,0.15)",
                  borderLeft: "4px solid #FF7169",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "32px"
                }}>
                  <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                    <tr>
                      <td style={{ fontSize: "14px", color: "#666666" }}>Amount:</td>
                      <td style={{ fontSize: "14px", color: "#383838", fontWeight: "bold", textAlign: "right" }}>{amount}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "14px", color: "#666666", paddingTop: "8px" }}>Attempt:</td>
                      <td style={{ fontSize: "14px", color: "#383838", textAlign: "right", paddingTop: "8px" }}>{attemptCount} of 4</td>
                    </tr>
                  </table>
                </div>

                {/* What to do */}
                <div style={{ marginBottom: "32px" }}>
                  <div style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#666666",
                    marginBottom: "12px"
                  }}>
                    Common fixes
                  </div>
                  <div style={{ fontSize: "14px", color: "#383838", lineHeight: "2" }}>
                    → Check your card hasn't expired<br />
                    → Make sure you have sufficient funds<br />
                    → Try a different payment method
                  </div>
                </div>

                {/* CTA */}
                <a href={billingUrl} style={{
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
                  borderRadius: "2px"
                }}>
                  Update Payment
                </a>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#666666" }}>
              <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a> · <a href={`${dashboardUrl}/support`} style={{ color: "#383838" }}>Support</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}

/**
 * VARIATION C: Playful Status - Direct
 */
function VariationC({ amount, attemptCount, billingUrl, dashboardUrl }: {
  amount: string
  attemptCount: number
  billingUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#FF7169", padding: "40px 20px" }}>
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
              borderRadius: "2px"
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
              {/* Floating Badge */}
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                backgroundColor: "#FF7169",
                color: "#ffffff",
                padding: "4px 12px",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "2px solid #383838",
                borderRadius: "2px"
              }}>
                ⚠️ Failed
              </div>

              <div style={{ padding: "48px 32px 40px" }}>
                {/* Big Emoji */}
                <div style={{ textAlign: "center", marginBottom: "16px", fontSize: "48px" }}>
                  😕
                </div>

                <h1 style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Payment Didn't Go Through
                </h1>

                <p style={{
                  fontSize: "14px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center"
                }}>
                  Attempt #{attemptCount} for {amount}
                </p>

                {/* Warning Card */}
                <div style={{
                  backgroundColor: "#FFDE00",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "16px",
                  marginBottom: "32px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "13px", color: "#383838", fontWeight: "bold" }}>
                    ⏰ We'll try {4 - attemptCount} more times before canceling
                  </div>
                </div>

                {/* CTA */}
                <a href={billingUrl} style={{
                  display: "block",
                  backgroundColor: "#6FC2FF",
                  color: "#383838",
                  padding: "18px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  textAlign: "center",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  boxShadow: "-4px 4px 0 #383838"
                }}>
                  Fix Payment Method →
                </a>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "24px 0", textAlign: "center" }}>
            <a href={dashboardUrl} style={{ fontSize: "12px", color: "#ffffff", fontWeight: "bold" }}>Dashboard</a>
            <span style={{ color: "rgba(255,255,255,0.5)", margin: "0 8px" }}>·</span>
            <a href={`${dashboardUrl}/support`} style={{ fontSize: "12px", color: "#ffffff" }}>Get Help</a>
          </td>
        </tr>
      </table>
    </div>
  )
}
