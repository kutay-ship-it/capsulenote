"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Payment Confirmation Email - 3 Variations
 * Sent after successful payment (anonymous checkout)
 */
export function PaymentConfirmationEmails({ variation }: EmailProps) {
  const sampleData = {
    planName: "Digital Annual",
    amount: "$79.00",
    email: "alex@example.com",
    signUpUrl: "https://capsulenote.com/signup?token=abc123",
    supportEmail: "support@capsulenote.com",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist
 */
function VariationA({ planName, amount, email, signUpUrl, supportEmail }: {
  planName: string
  amount: string
  email: string
  signUpUrl: string
  supportEmail: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#383838", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#38C1B0",
            padding: "24px 32px",
            border: "2px solid #383838",
            borderBottom: "none"
          }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
                  <span style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#ffffff"
                  }}>
                    Capsule Note
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#ffffff",
                    color: "#38C1B0",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    ✓ Payment Received
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
              Thank You! 🎉
            </h1>

            <p style={{
              fontSize: "15px",
              color: "#666666",
              margin: "0 0 32px 0",
              lineHeight: "1.6"
            }}>
              Your payment has been received. Here's your receipt:
            </p>

            {/* Receipt Box */}
            <div style={{
              backgroundColor: "#F4EFE2",
              border: "2px solid #383838",
              borderRadius: "2px",
              marginBottom: "32px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              <div style={{
                backgroundColor: "#FFDE00",
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
                  💳 Payment Details
                </span>
              </div>
              <div style={{ padding: "20px" }}>
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td style={{ padding: "10px 0", fontSize: "14px", color: "#666666" }}>Plan:</td>
                    <td style={{ padding: "10px 0", fontSize: "14px", color: "#383838", fontWeight: "bold", textAlign: "right" }}>{planName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 0", fontSize: "14px", color: "#666666" }}>Amount:</td>
                    <td style={{ padding: "10px 0", fontSize: "20px", color: "#383838", fontWeight: "bold", textAlign: "right" }}>{amount}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 0", fontSize: "14px", color: "#666666" }}>Email:</td>
                    <td style={{ padding: "10px 0", fontSize: "14px", color: "#383838", textAlign: "right" }}>{email}</td>
                  </tr>
                </table>
              </div>
            </div>

            {/* Warning Box */}
            <div style={{
              backgroundColor: "#FFDE00",
              border: "2px solid #383838",
              borderRadius: "2px",
              padding: "16px 20px",
              marginBottom: "32px"
            }}>
              <div style={{
                fontSize: "13px",
                color: "#383838",
                fontWeight: "bold"
              }}>
                ⚠️ Important: Sign up within 30 days to activate your subscription
              </div>
            </div>

            {/* Next Steps */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#383838",
                marginBottom: "16px"
              }}>
                Next Steps
              </div>
              <div style={{ fontSize: "14px", color: "#383838", lineHeight: "2" }}>
                <div>1. Create your account using the button below</div>
                <div>2. Start writing letters to your future self</div>
                <div>3. Schedule deliveries via email or physical mail</div>
              </div>
            </div>

            {/* CTA */}
            <a href={signUpUrl} style={{
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
              Create Your Account →
            </a>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "24px 32px",
            border: "2px solid #383838",
            borderTop: "none"
          }}>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.7)",
              textAlign: "center"
            }}>
              Questions? Contact <a href={`mailto:${supportEmail}`} style={{ color: "#FFDE00" }}>{supportEmail}</a>
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
function VariationB({ planName, amount, email, signUpUrl, supportEmail }: {
  planName: string
  amount: string
  email: string
  signUpUrl: string
  supportEmail: string
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
              {/* Success Banner */}
              <div style={{
                backgroundColor: "#38C1B0",
                padding: "20px",
                textAlign: "center"
              }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#ffffff",
                  border: "2px solid #383838",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "12px"
                }}>
                  ✓
                </div>
                <div style={{
                  fontSize: "20px",
                  color: "#ffffff",
                  fontWeight: "bold"
                }}>
                  Payment Successful
                </div>
              </div>

              <div style={{ padding: "40px" }}>
                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  lineHeight: "1.6",
                  textAlign: "center"
                }}>
                  Thank you for your purchase! Your subscription is ready to be activated.
                </p>

                {/* Receipt */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "1px solid rgba(56,56,56,0.15)",
                  borderLeft: "4px solid #38C1B0",
                  padding: "24px",
                  marginBottom: "32px",
                  borderRadius: "2px"
                }}>
                  <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                    <tr>
                      <td style={{ padding: "8px 0" }}>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666" }}>Plan</div>
                        <div style={{ fontSize: "16px", color: "#383838", fontWeight: "bold", marginTop: "4px" }}>{planName}</div>
                      </td>
                      <td style={{ padding: "8px 0", textAlign: "right" }}>
                        <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#666666" }}>Amount</div>
                        <div style={{ fontSize: "24px", color: "#383838", fontWeight: "bold", marginTop: "4px" }}>{amount}</div>
                      </td>
                    </tr>
                  </table>
                  <div style={{ borderTop: "1px dashed rgba(56,56,56,0.2)", marginTop: "16px", paddingTop: "16px" }}>
                    <div style={{ fontSize: "12px", color: "#666666" }}>Receipt sent to: {email}</div>
                  </div>
                </div>

                {/* Expiry Notice */}
                <div style={{
                  backgroundColor: "#FFDE00",
                  border: "1px solid #383838",
                  borderRadius: "2px",
                  padding: "16px",
                  marginBottom: "32px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#383838" }}>
                    ⏰ Sign up within <strong>30 days</strong> to activate your subscription
                  </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center" }}>
                  <a href={signUpUrl} style={{
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
                    Create Account
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
              Need help? <a href={`mailto:${supportEmail}`} style={{ color: "#383838" }}>{supportEmail}</a>
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
function VariationC({ planName, amount, email, signUpUrl, supportEmail }: {
  planName: string
  amount: string
  email: string
  signUpUrl: string
  supportEmail: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#ffffff", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Logo */}
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
              boxShadow: "-8px 8px 0 #38C1B0, -10px 10px 0 #383838",
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
                💰 Paid
              </div>

              <div style={{ padding: "48px 32px 40px" }}>
                {/* Celebration */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎊</div>
                  <h1 style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#383838",
                    margin: "0"
                  }}>
                    You're In!
                  </h1>
                </div>

                <p style={{
                  fontSize: "15px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  lineHeight: "1.6",
                  textAlign: "center"
                }}>
                  Payment successful. Just one more step to start writing to your future self.
                </p>

                {/* Receipt Card */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  marginBottom: "24px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    backgroundColor: "#FFDE00",
                    padding: "12px 16px",
                    borderBottom: "2px solid #383838"
                  }}>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "#383838"
                    }}>
                      🧾 Your Receipt
                    </span>
                  </div>
                  <div style={{ padding: "16px" }}>
                    <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                      <tr>
                        <td style={{ fontSize: "14px", color: "#383838", padding: "6px 0" }}>{planName}</td>
                        <td style={{ fontSize: "18px", color: "#383838", fontWeight: "bold", textAlign: "right", padding: "6px 0" }}>{amount}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                {/* Timer Warning */}
                <div style={{
                  backgroundColor: "#FFDE00",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "16px",
                  marginBottom: "32px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "13px", color: "#383838" }}>
                    ⏳ <strong>30 days</strong> to create your account
                  </div>
                </div>

                {/* Big CTA */}
                <a href={signUpUrl} style={{
                  display: "block",
                  backgroundColor: "#6FC2FF",
                  color: "#383838",
                  padding: "20px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  textAlign: "center",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  boxShadow: "-4px 4px 0 #383838"
                }}>
                  Create Your Account →
                </a>
              </div>
            </div>
          </td>
        </tr>

        {/* Footer */}
        <tr>
          <td style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#666666" }}>
              Questions? <a href={`mailto:${supportEmail}`} style={{ color: "#383838", fontWeight: "bold" }}>{supportEmail}</a>
            </div>
          </td>
        </tr>
      </table>
    </div>
  )
}
