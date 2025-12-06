import { describe, it, expect, vi, beforeEach } from "vitest"

const createMock = vi.fn().mockResolvedValue({
  id: "ltr_mock",
  url: "https://lob.test/letters/ltr_mock",
  expected_delivery_date: "2024-01-05",
  send_date: "2024-01-02",
  carrier: "USPS",
  thumbnails: [],
})

vi.mock("@/env.mjs", () => ({
  env: {
    LOB_API_KEY: "lob_test_key",
    LOB_TEMPLATE_ID: "tmpl_123",
    LOB_TEMPLATE_VERSION_ID: "vrsn_456",
    NODE_ENV: "test",
  },
}))

vi.mock("lob", () => {
  return {
    __esModule: true,
    default: vi.fn(() => ({
      letters: {
        create: createMock,
      },
    })),
  }
})

describe("Lob provider template usage", () => {
  beforeEach(() => {
    createMock.mockClear()
  })

  it("sends stored Lob template with merge variables instead of inline HTML", async () => {
    const { sendTemplatedLetter } = await import("@/server/providers/lob")

    await sendTemplatedLetter({
      to: {
        name: "Recipient Name",
        line1: "185 Berry St",
        city: "San Francisco",
        state: "CA",
        postalCode: "94107",
        country: "US",
      },
      letterContent: "<p>Hello from template</p>",
      writtenDate: new Date("2024-01-01"),
      deliveryDate: new Date("2024-01-02"),
      recipientName: "Recipient Name",
      letterTitle: "Test Letter",
      idempotencyKey: "test-key",
    })

    expect(createMock).toHaveBeenCalledTimes(1)
    const [params, headers] = createMock.mock.calls[0]

    // IMPORTANT: Lob requires template_id to be passed as the 'file' parameter
    expect(params.file).toBe("tmpl_123")
    expect(params.merge_variables).toMatchObject({
      variable_name: "",
      recipient_name: "Recipient Name",
      letter_content: expect.any(String),
      letter_title: "Test Letter",
    })
    expect(headers["Idempotency-Key"]).toBe("test-key")
    // template_id should NOT be a separate param - it goes in 'file'
    expect(params.template_id).toBeUndefined()
  })
})
