import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createLogger, logger, logBufferSerializationDetected } from "../logger"

describe("createLogger", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-15T10:30:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe("info", () => {
    it("logs info message with correct format", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const log = createLogger()

      log.info("Test message")

      expect(consoleSpy).toHaveBeenCalledOnce()
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(logEntry.level).toBe("info")
      expect(logEntry.message).toBe("Test message")
      expect(logEntry.timestamp).toBe("2024-01-15T10:30:00.000Z")
      expect(logEntry.service).toBe("inngest-worker")
    })

    it("includes metadata in log entry", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const log = createLogger()

      log.info("Processing delivery", { deliveryId: "123", attempt: 1 })

      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(logEntry.deliveryId).toBe("123")
      expect(logEntry.attempt).toBe(1)
    })
  })

  describe("warn", () => {
    it("logs warning message with correct format", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      const log = createLogger()

      log.warn("Warning message")

      expect(consoleSpy).toHaveBeenCalledOnce()
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(logEntry.level).toBe("warn")
      expect(logEntry.message).toBe("Warning message")
    })
  })

  describe("error", () => {
    it("logs error message with correct format", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      const log = createLogger()

      log.error("Error occurred", { error: "Something failed", errorType: "ValidationError" })

      expect(consoleSpy).toHaveBeenCalledOnce()
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(logEntry.level).toBe("error")
      expect(logEntry.message).toBe("Error occurred")
      expect(logEntry.error).toBe("Something failed")
      expect(logEntry.errorType).toBe("ValidationError")
    })
  })

  describe("debug", () => {
    it("does not log debug in production by default", () => {
      const originalEnv = process.env.NODE_ENV
      const originalLogLevel = process.env.LOG_LEVEL
      process.env.NODE_ENV = "production"
      delete process.env.LOG_LEVEL

      const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
      const log = createLogger()

      log.debug("Debug message")

      expect(consoleSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
      if (originalLogLevel) process.env.LOG_LEVEL = originalLogLevel
    })

    it("logs debug in development mode", () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = "development"

      const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
      const log = createLogger()

      log.debug("Debug message")

      expect(consoleSpy).toHaveBeenCalledOnce()
      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(logEntry.level).toBe("debug")
      expect(logEntry.message).toBe("Debug message")

      process.env.NODE_ENV = originalEnv
    })

    it("logs debug when LOG_LEVEL=debug", () => {
      const originalEnv = process.env.NODE_ENV
      const originalLogLevel = process.env.LOG_LEVEL
      process.env.NODE_ENV = "production"
      process.env.LOG_LEVEL = "debug"

      const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
      const log = createLogger()

      log.debug("Debug message")

      expect(consoleSpy).toHaveBeenCalledOnce()

      process.env.NODE_ENV = originalEnv
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel
      } else {
        delete process.env.LOG_LEVEL
      }
    })
  })

  describe("context", () => {
    it("includes persistent context in all log entries", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const log = createLogger({ deliveryId: "abc-123", step: "decrypt" })

      log.info("First message")
      log.info("Second message")

      const firstEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      const secondEntry = JSON.parse(consoleSpy.mock.calls[1][0] as string)

      expect(firstEntry.deliveryId).toBe("abc-123")
      expect(firstEntry.step).toBe("decrypt")
      expect(secondEntry.deliveryId).toBe("abc-123")
      expect(secondEntry.step).toBe("decrypt")
    })

    it("allows meta to override context", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
      const log = createLogger({ step: "initial" })

      log.info("Message", { step: "override" })

      const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
      expect(logEntry.step).toBe("override")
    })
  })
})

describe("default logger", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("exports a default logger instance", () => {
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe("function")
    expect(typeof logger.warn).toBe("function")
    expect(typeof logger.error).toBe("function")
    expect(typeof logger.debug).toBe("function")
  })

  it("works without context", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    logger.info("Default logger message")

    expect(consoleSpy).toHaveBeenCalledOnce()
    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
    expect(logEntry.message).toBe("Default logger message")
  })
})

describe("logBufferSerializationDetected", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("logs buffer serialization warning with correct format", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-15T10:30:00.000Z"))
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    logBufferSerializationDetected("bodyCiphertext", "decrypt-letter", {
      deliveryId: "delivery-123",
      letterId: "letter-456",
    })

    expect(consoleSpy).toHaveBeenCalledOnce()
    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)

    expect(logEntry.level).toBe("warn")
    expect(logEntry.message).toBe("BUFFER_SERIALIZATION_DETECTED")
    expect(logEntry.fieldName).toBe("bodyCiphertext")
    expect(logEntry.step).toBe("decrypt-letter")
    expect(logEntry.severity).toBe("high")
    expect(logEntry.recommendation).toBe("Fetch encrypted data fresh inside the step that needs it")
    expect(logEntry.deliveryId).toBe("delivery-123")
    expect(logEntry.letterId).toBe("letter-456")

    vi.useRealTimers()
  })

  it("works without additional meta", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    logBufferSerializationDetected("bodyNonce", "test-step")

    expect(consoleSpy).toHaveBeenCalledOnce()
    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
    expect(logEntry.fieldName).toBe("bodyNonce")
    expect(logEntry.step).toBe("test-step")
  })
})

describe("JSON output format", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("produces valid JSON for all log levels", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})

    const log = createLogger()

    log.info("info message")
    log.warn("warn message")
    log.error("error message")

    // All outputs should be valid JSON
    expect(() => JSON.parse(consoleSpy.mock.calls[0][0] as string)).not.toThrow()
  })

  it("escapes special characters in messages", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
    const log = createLogger()

    log.info('Message with "quotes" and\nnewlines')

    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
    expect(logEntry.message).toBe('Message with "quotes" and\nnewlines')
  })
})
