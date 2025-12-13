import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      colors: {
        // MotherDuck Brand Colors
        "duck-yellow": "rgb(255, 222, 0)",
        "duck-blue": "rgb(111, 194, 255)",
        charcoal: "rgb(56, 56, 56)",
        cream: "rgb(244, 239, 234)",
        "duck-cream": "rgb(244, 239, 234)", // alias for cream

        // Accent Colors
        "teal-primary": "rgb(56, 193, 176)",
        "teal-light": "rgb(83, 219, 201)",
        "sky-blue": "rgb(84, 180, 222)",
        periwinkle: "rgb(117, 151, 238)",
        lavender: "rgb(178, 145, 222)",
        lime: "rgb(179, 196, 25)",
        coral: "rgb(255, 113, 105)",
        peach: "rgb(245, 177, 97)",
        salmon: "rgb(243, 142, 132)",
        mustard: "rgb(225, 196, 39)",

        // Neutrals
        white: "rgb(255, 255, 255)",
        "off-white": "rgb(248, 248, 247)",
        "light-gray": "rgb(236, 239, 241)",
        gray: "rgb(161, 161, 161)",
        "gray-secondary": "rgb(162, 162, 162)",
        "slate-gray": "rgb(132, 166, 188)",
        black: "rgb(0, 0, 0)",

        // Background Tints
        "bg-blue-light": "rgb(234, 240, 255)",
        "bg-blue-pale": "rgb(235, 249, 255)",
        "bg-yellow-pale": "rgb(255, 253, 231)",
        "bg-yellow-cream": "rgb(249, 251, 231)",
        "bg-peach-light": "rgb(253, 237, 218)",
        "bg-pink-light": "rgb(255, 235, 233)",
        "bg-purple-light": "rgb(247, 241, 255)",
        "bg-green-light": "rgb(232, 245, 233)",

        // Semantic Tokens (mapped to MotherDuck palette)
        border: "rgb(56, 56, 56)", // charcoal
        input: "rgb(56, 56, 56)", // charcoal
        ring: "rgb(111, 194, 255)", // duck-blue
        background: "rgb(244, 239, 234)", // cream
        foreground: "rgb(56, 56, 56)", // charcoal

        primary: {
          DEFAULT: "rgb(111, 194, 255)", // duck-blue
          foreground: "rgb(56, 56, 56)", // charcoal
        },
        secondary: {
          DEFAULT: "rgb(248, 248, 247)", // off-white
          foreground: "rgb(56, 56, 56)", // charcoal
        },
        destructive: {
          DEFAULT: "rgb(255, 113, 105)", // coral
          foreground: "rgb(255, 255, 255)", // white
        },
        muted: {
          DEFAULT: "rgb(248, 248, 247)", // off-white
          foreground: "rgb(162, 162, 162)", // gray-secondary
        },
        accent: {
          DEFAULT: "rgb(255, 222, 0)", // duck-yellow
          foreground: "rgb(56, 56, 56)", // charcoal
        },
        popover: {
          DEFAULT: "rgb(255, 255, 255)", // white
          foreground: "rgb(56, 56, 56)", // charcoal
        },
        card: {
          DEFAULT: "rgb(255, 255, 255)", // white
          foreground: "rgb(56, 56, 56)", // charcoal
        },
      },
      borderRadius: {
        // Brutalist minimal radius
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "2px",
        xl: "2px",
        "2xl": "2px",
        "3xl": "2px",
        full: "9999px", // Only for circles (avatars)
      },
      borderWidth: {
        DEFAULT: "2px",
        0: "0px",
        2: "2px",
        4: "4px",
      },
      spacing: {
        // 4px-based system
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
        "28": "112px",
        "32": "128px",
      },
      boxShadow: {
        // Brutalist hard offset shadows
        none: "none",
        sm: "rgb(56, 56, 56) -4px 4px 0px 0px",
        DEFAULT: "rgb(56, 56, 56) -4px 4px 0px 0px",
        md: "rgb(56, 56, 56) -8px 8px 0px 0px",
        lg: "rgb(56, 56, 56) -12px 12px 0px 0px",
        xl: "rgb(56, 56, 56) -16px 16px 0px 0px",
      },
      fontSize: {
        // MotherDuck type scale
        xs: "12px",
        sm: "14px",
        base: "16px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "44px",
        "5xl": "48px",
        "6xl": "56px",
      },
      lineHeight: {
        tight: "1.2",
        snug: "1.4",
        normal: "1.5",
        relaxed: "1.6",
      },
      letterSpacing: {
        tight: "-0.02em",
        normal: "0",
        wide: "0.02em",
        wider: "0.05em",
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "200ms",
        slow: "300ms",
      },
      transitionTimingFunction: {
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        ease: "cubic-bezier(0.4, 0, 1, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "brutalist-hover": {
          "0%": {
            transform: "translate(0, 0)",
            boxShadow: "rgb(56, 56, 56) -4px 4px 0px 0px",
          },
          "100%": {
            transform: "translate(2px, -2px)",
            boxShadow: "rgb(56, 56, 56) -8px 8px 0px 0px",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Performance-optimized animations (replacing framer-motion)
        "scale-x-in": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scroll-indicator": {
          "0%, 100%": { transform: "translateY(0)", opacity: "1" },
          "50%": { transform: "translateY(12px)", opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "brutalist-hover": "brutalist-hover 0.12s ease-in-out forwards",
        shimmer: "shimmer 1.5s ease-in-out infinite",
        // Performance-optimized animations (replacing framer-motion)
        "scale-x-in": "scale-x-in 0.6s ease-out forwards",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "scroll-indicator": "scroll-indicator 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
