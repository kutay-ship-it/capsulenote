"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Subscription Canceled Email - 3 Variations
 * Sent when subscription is canceled
 */
export function SubscriptionCanceledEmails({ variation }: EmailProps) {
  const sampleData = {
    accessEndsDate: "February 15, 2025",
    reactivateUrl: "https://capsulenote.com/pricing",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist
 */
function VariationA({ accessEndsDate, reactivateUrl, dashboardUrl }: {
  accessEndsDate: string
  reactivateUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#383838", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#F4EFE2",
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
                    backgroundColor: "#666666",
                    color: "#ffffff",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    Canceled
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
              We're Sorry to See You Go
            </h1>

            <p style={{
              fontSize: "15px",
              color: "#666666",
              margin: "0 0 32px 0",
              lineHeight: "1.6"
            }}>
              Your subscription has been canceled. You'll continue to have access to Pro features until <strong>{accessEndsDate}</strong>.
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
                What happens now?
              </div>
              <div style={{ fontSize: "14px", color: "#383838", lineHeight: "1.8" }}>
                → Your letters remain safe and encrypted<br />
                → Scheduled deliveries will still be sent<br />
                → After {accessEndsDate}, you'll move to the free plan<br />
                → You can reactivate anytime
              </div>
            </div>

            {/* CTA */}
            <a href={reactivateUrl} style={{
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
              Reactivate Subscription
            </a>

            <p style={{
              fontSize: "13px",
              color: "#666666",
              marginTop: "24px"
            }}>
              Changed your mind? We'd love to have you back.
            </p>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "24px 32px"
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              <a href={dashboardUrl} style={{ color: "#FFDE00" }}>Dashboard</a> · <a href={`${dashboardUrl}/support`} style={{ color: "#FFDE00" }}>Contact Support</a>
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
function VariationB({ accessEndsDate, reactivateUrl, dashboardUrl }: {
  accessEndsDate: string
  reactivateUrl: string
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
              {/* Gray Bar */}
              <div style={{ backgroundColor: "#666666", height: "4px" }} />

              <div style={{ padding: "40px" }}>
                {/* Icon */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#F4EFE2",
                    border: "2px solid #383838",
                    borderRadius: "2px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px"
                  }}>
                    👋
                  </div>
                </div>

                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Subscription Canceled
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center",
                  lineHeight: "1.6"
                }}>
                  We've processed your cancellation request.
                </p>

                {/* Access Box */}
                <div style={{
                  backgroundColor: "#FFDE00",
                  border: "1px solid #383838",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "32px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#383838", marginBottom: "4px" }}>Pro access until</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#383838" }}>{accessEndsDate}</div>
                </div>

                {/* What's preserved */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#666666",
                    marginBottom: "12px"
                  }}>
                    Don't worry, your data is safe
                  </div>
                  <div style={{ fontSize: "14px", color: "#383838", lineHeight: "1.8" }}>
                    ✓ All letters remain encrypted and accessible<br />
                    ✓ Scheduled deliveries will still send<br />
                    ✓ Reactivate anytime to restore Pro
                  </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center" }}>
                  <a href={reactivateUrl} style={{
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
                    Reactivate
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
              We'd love to have you back · <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a>
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
function VariationC({ accessEndsDate, reactivateUrl, dashboardUrl }: {
  accessEndsDate: string
  reactivateUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "40px 20px" }}>
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
              boxShadow: "-6px 6px 0 #383838",
              position: "relative"
            }}>
              {/* Floating Badge */}
              <div style={{
                position: "absolute",
                top: "-12px",
                left: "20px",
                backgroundColor: "#666666",
                color: "#ffffff",
                padding: "4px 12px",
                fontSize: "10px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "2px solid #383838",
                borderRadius: "2px"
              }}>
                Goodbye for Now
              </div>

              <div style={{ padding: "48px 32px 40px" }}>
                {/* Emoji */}
                <div style={{ textAlign: "center", marginBottom: "16px", fontSize: "48px" }}>
                  🫂
                </div>

                <h1 style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  See You Later!
                </h1>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center"
                }}>
                  We've canceled your subscription as requested.
                </p>

                {/* Access Card */}
                <div style={{
                  backgroundColor: "#6FC2FF",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "20px",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#383838", marginBottom: "4px" }}>
                    Pro features available until
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#383838" }}>
                    {accessEndsDate}
                  </div>
                </div>

                {/* Safety Note */}
                <div style={{
                  backgroundColor: "#38C1B0",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "16px",
                  marginBottom: "32px"
                }}>
                  <div style={{ fontSize: "13px", color: "#ffffff", textAlign: "center" }}>
                    🔒 Your letters are safe and will stay encrypted forever
                  </div>
                </div>

                {/* CTA */}
                <a href={reactivateUrl} style={{
                  display: "block",
                  backgroundColor: "#FFDE00",
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
                  Come Back Anytime →
                </a>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#666666" }}>
              <a href={dashboardUrl} style={{ color: "#383838", fontWeight: "bold" }}>Dashboard</a>
              <span style={{ margin: "0 8px" }}>·</span>
              <a href={`${dashboardUrl}/support`} style={{ color: "#383838" }}>Feedback</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}
