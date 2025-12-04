/**
 * Test Lob Letter API Route
 *
 * POST /api/test/send-lob-letter
 *
 * Sends a test letter to Lob using the V3 template.
 * Only works with test API keys (no real mail sent).
 */

import { NextRequest, NextResponse } from "next/server"
import { sendTemplatedLetter, isLobConfigured } from "@/server/providers/lob"

export async function POST(request: NextRequest) {
  // Only allow in development or with test API key
  if (process.env.NODE_ENV === "production" && !process.env.LOB_API_KEY?.startsWith("test_")) {
    return NextResponse.json(
      { error: "Test endpoint not available in production with live API key" },
      { status: 403 }
    )
  }

  if (!isLobConfigured()) {
    return NextResponse.json(
      { error: "Lob is not configured. Set LOB_API_KEY in environment." },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const {
      recipientName = "Future Self",
      letterTitle,
      letterContent,
      writtenDate,
      deliveryDate,
      useMinimal = false,
    } = body

    // Validate required fields
    if (!letterContent) {
      return NextResponse.json(
        { error: "letterContent is required" },
        { status: 400 }
      )
    }

    // Test address (San Francisco)
    const testAddress = {
      name: recipientName,
      line1: "185 Berry St",
      line2: "Suite 6100",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "US",
    }

    const result = await sendTemplatedLetter({
      to: testAddress,
      letterContent,
      writtenDate: writtenDate ? new Date(writtenDate) : new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      letterTitle,
      recipientName,
      minimalTemplate: useMinimal,
      description: `Test Letter - ${new Date().toISOString()}`,
    })

    return NextResponse.json({
      success: true,
      letterId: result.id,
      pdfUrl: result.url,
      expectedDeliveryDate: result.expectedDeliveryDate,
      carrier: result.carrier,
      thumbnails: result.thumbnails,
    })
  } catch (error) {
    console.error("Failed to send test letter:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send letter" },
      { status: 500 }
    )
  }
}
