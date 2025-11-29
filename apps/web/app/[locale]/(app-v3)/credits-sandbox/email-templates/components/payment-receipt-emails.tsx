"use client"

interface EmailProps {
  variation: "A" | "B" | "C"
}

/**
 * Payment Receipt Email - 3 Variations
 * Sent after successful invoice payment
 */
export function PaymentReceiptEmails({ variation }: EmailProps) {
  const sampleData = {
    amount: "$9.00",
    invoiceNumber: "INV-2025-001234",
    invoiceUrl: "https://stripe.com/invoice/abc123",
    pdfUrl: "https://stripe.com/invoice/abc123.pdf",
    dashboardUrl: "https://capsulenote.com/dashboard",
  }

  if (variation === "A") return <VariationA {...sampleData} />
  if (variation === "B") return <VariationB {...sampleData} />
  return <VariationC {...sampleData} />
}

/**
 * VARIATION A: Classic Brutalist
 */
function VariationA({ amount, invoiceNumber, invoiceUrl, pdfUrl, dashboardUrl }: {
  amount: string
  invoiceNumber: string
  invoiceUrl: string
  pdfUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{
            backgroundColor: "#383838",
            padding: "20px 32px",
            borderRadius: "2px 2px 0 0"
          }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
                  <span style={{ fontSize: "18px", fontWeight: "bold", color: "#FFDE00" }}>Capsule Note</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#ffffff" }}>Payment Receipt</span>
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
            {/* Amount */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#666666",
                marginBottom: "8px"
              }}>
                Amount Paid
              </div>
              <div style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "#383838"
              }}>
                {amount}
              </div>
            </div>

            {/* Receipt Details */}
            <div style={{
              backgroundColor: "#F4EFE2",
              border: "2px solid #383838",
              borderRadius: "2px",
              padding: "20px",
              marginBottom: "32px",
              boxShadow: "-4px 4px 0 #383838"
            }}>
              <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#666666" }}>Invoice #</td>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#383838", fontWeight: "bold", textAlign: "right" }}>{invoiceNumber}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#666666" }}>Date</td>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#383838", textAlign: "right" }}>{new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", fontSize: "14px", color: "#666666" }}>Status</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>
                    <span style={{
                      display: "inline-block",
                      backgroundColor: "#38C1B0",
                      color: "#ffffff",
                      padding: "4px 10px",
                      fontSize: "10px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      border: "1px solid #383838",
                      borderRadius: "2px"
                    }}>
                      ✓ Paid
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            {/* Actions */}
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td style={{ width: "50%", paddingRight: "8px" }}>
                  <a href={invoiceUrl} style={{
                    display: "block",
                    backgroundColor: "#383838",
                    color: "#ffffff",
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
                    View Invoice
                  </a>
                </td>
                <td style={{ width: "50%", paddingLeft: "8px" }}>
                  <a href={pdfUrl} style={{
                    display: "block",
                    backgroundColor: "#ffffff",
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
                    Download PDF
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
            padding: "20px 32px",
            borderRadius: "0 0 2px 2px"
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              <a href={dashboardUrl} style={{ color: "#FFDE00" }}>Dashboard</a> · <a href={`${dashboardUrl}/settings/billing`} style={{ color: "#FFDE00" }}>Billing Settings</a>
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
function VariationB({ amount, invoiceNumber, invoiceUrl, pdfUrl, dashboardUrl }: {
  amount: string
  invoiceNumber: string
  invoiceUrl: string
  pdfUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#F4EFE2", padding: "48px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{ textAlign: "center", paddingBottom: "32px" }}>
            <div style={{ fontSize: "22px", color: "#383838" }}>Capsule Note</div>
            <div style={{ fontSize: "11px", color: "#666666", marginTop: "4px" }}>Payment Receipt</div>
          </td>
        </tr>

        {/* Main Card */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-4px 4px 0 rgba(56,56,56,0.1)"
            }}>
              {/* Green Bar */}
              <div style={{ backgroundColor: "#38C1B0", height: "4px" }} />

              <div style={{ padding: "40px" }}>
                {/* Success Icon */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#38C1B0",
                    border: "2px solid #383838",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px"
                  }}>
                    ✓
                  </div>
                </div>

                <h1 style={{
                  fontSize: "24px",
                  fontWeight: "normal",
                  color: "#383838",
                  margin: "0 0 8px 0",
                  textAlign: "center"
                }}>
                  Payment Received
                </h1>

                <p style={{
                  fontSize: "14px",
                  color: "#666666",
                  margin: "0 0 32px 0",
                  textAlign: "center"
                }}>
                  Thank you for your continued support!
                </p>

                {/* Receipt */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  borderRadius: "2px",
                  padding: "24px",
                  marginBottom: "32px"
                }}>
                  <div style={{
                    fontSize: "40px",
                    fontWeight: "bold",
                    color: "#383838",
                    textAlign: "center",
                    marginBottom: "16px"
                  }}>
                    {amount}
                  </div>
                  <div style={{
                    borderTop: "1px dashed rgba(56,56,56,0.2)",
                    paddingTop: "16px"
                  }}>
                    <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                      <tr>
                        <td style={{ fontSize: "12px", color: "#666666" }}>Invoice</td>
                        <td style={{ fontSize: "12px", color: "#383838", textAlign: "right" }}>{invoiceNumber}</td>
                      </tr>
                    </table>
                  </div>
                </div>

                {/* Buttons */}
                <table cellPadding={0} cellSpacing={0}>
                  <tr>
                    <td style={{ paddingRight: "12px" }}>
                      <a href={invoiceUrl} style={{
                        display: "inline-block",
                        backgroundColor: "#6FC2FF",
                        color: "#383838",
                        padding: "12px 20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        View Online
                      </a>
                    </td>
                    <td>
                      <a href={pdfUrl} style={{
                        display: "inline-block",
                        backgroundColor: "#ffffff",
                        color: "#383838",
                        padding: "12px 20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textDecoration: "none",
                        border: "2px solid #383838",
                        borderRadius: "2px"
                      }}>
                        PDF ↓
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
              <a href={dashboardUrl} style={{ color: "#383838" }}>Dashboard</a> · <a href={`${dashboardUrl}/settings/billing`} style={{ color: "#383838" }}>Billing</a>
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
function VariationC({ amount, invoiceNumber, invoiceUrl, pdfUrl, dashboardUrl }: {
  amount: string
  invoiceNumber: string
  invoiceUrl: string
  pdfUrl: string
  dashboardUrl: string
}) {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace", backgroundColor: "#38C1B0", padding: "40px 20px" }}>
      <table cellPadding={0} cellSpacing={0} style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <tr>
          <td style={{ paddingBottom: "24px" }}>
            <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
              <tr>
                <td>
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
                <td style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: "#ffffff",
                    color: "#38C1B0",
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    Receipt
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        {/* Main Card */}
        <tr>
          <td>
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #383838",
              borderRadius: "2px",
              boxShadow: "-8px 8px 0 #383838"
            }}>
              <div style={{ padding: "40px 32px" }}>
                {/* Amount with decoration */}
                <div style={{
                  textAlign: "center",
                  marginBottom: "32px"
                }}>
                  <div style={{ fontSize: "14px", marginBottom: "8px" }}>💸</div>
                  <div style={{
                    fontSize: "56px",
                    fontWeight: "bold",
                    color: "#383838",
                    lineHeight: "1"
                  }}>
                    {amount}
                  </div>
                  <div style={{
                    display: "inline-block",
                    marginTop: "12px",
                    backgroundColor: "#38C1B0",
                    color: "#ffffff",
                    padding: "6px 14px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    border: "2px solid #383838",
                    borderRadius: "2px"
                  }}>
                    ✓ Paid in Full
                  </div>
                </div>

                {/* Invoice Info */}
                <div style={{
                  backgroundColor: "#F4EFE2",
                  border: "2px solid #383838",
                  borderRadius: "2px",
                  padding: "16px",
                  marginBottom: "24px"
                }}>
                  <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                    <tr>
                      <td style={{ fontSize: "12px", color: "#666666" }}>Invoice #{invoiceNumber}</td>
                      <td style={{ fontSize: "12px", color: "#383838", textAlign: "right" }}>{new Date().toLocaleDateString()}</td>
                    </tr>
                  </table>
                </div>

                {/* Actions */}
                <table cellPadding={0} cellSpacing={0} style={{ width: "100%" }}>
                  <tr>
                    <td style={{ width: "50%", paddingRight: "6px" }}>
                      <a href={invoiceUrl} style={{
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
                        View Invoice
                      </a>
                    </td>
                    <td style={{ width: "50%", paddingLeft: "6px" }}>
                      <a href={pdfUrl} style={{
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
                        Download ↓
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
            <a href={dashboardUrl} style={{ fontSize: "12px", color: "#ffffff", fontWeight: "bold" }}>Go to Dashboard →</a>
          </td>
        </tr>
      </table>
    </div>
  )
}
