# Agent Prompt: Build "CapsuleNote" - The Digital Stoic Time Capsule

**Role:** You are a world-class Full-Stack Product Engineer with a specialty in "Visceral Design." You do not just build functional apps; you build emotional experiences.

**Objective:** Build **CapsuleNote**, a web application that allows users to write letters to their future selves. The experience must be grounded in **"Digital Stoicism"**—a design philosophy that combines Brutalist minimalism with the emotional weight of a physical vault.

---

## 1. The Core Concept & Vibe
*   **Metaphor:** A Swiss Bank Vault for your thoughts.
*   **Aesthetic:** **Modern Brutalism**. High contrast, hard edges, raw materials, but warm and inviting.
*   **Key Emotions:** Permanence, Calm, Anticipation, Trust.
*   **The "Wow" Factor:** Writing a letter is a *ritual*. Sending it is a *commitment*.

## 2. Technology Stack (Non-Negotiable)
*   **Framework:** Next.js 15 (App Router).
*   **Language:** TypeScript (Strict).
*   **Styling:** Tailwind CSS + Framer Motion (for animations).
*   **3D/Visuals:** Three.js / React Three Fiber (for the "Time Tunnel" hero).
*   **Database:** PostgreSQL with Prisma ORM.
*   **Auth:** Clerk.
*   **Background Jobs:** Inngest (for delivering scheduled letters).
*   **Security:** Web Crypto API (Letters must be encrypted at rest).

---

## 3. Design System: "The Brutalist Sanctuary"

### Color Palette
*   **Background:** `Cream` (`#F4EFEA`) - The paper texture.
*   **Foreground/Text:** `Charcoal` (`#383838`) - The ink and structure.
*   **Accent:** `Duck Yellow` (`#FFDE00`) - The highlighter/attention.
*   **Secondary:** `Periwinkle` (`#7597EE`) and `Coral` (`#FF7169`) for subtle tags.

### Typography
*   **UI/Headings:** `JetBrains Mono` or `Geist Mono`. Technical, precise, archival.
*   **Letter Content:** `Playfair Display` or `Merriweather`. Human, elegant, timeless.

### UI Patterns
*   **Hard Shadows:** No blur. `box-shadow: -4px 4px 0px 0px #383838`.
*   **Borders:** Thick, consistent `2px solid #383838`.
*   **Radius:** Minimal. `2px` or `0px`. No rounded "app-like" buttons.
*   **Interactions:** Buttons should physically depress (translate) on click.

---

## 4. Key Pages & UX Flows

### A. The Landing Page ("The Time Tunnel")
*   **Hero Section:**
    *   **Left:** Bold, mono typography: "WRITE TO YOUR FUTURE SELF."
    *   **Right:** A **3D Interactive Element**. A floating, glass-textured capsule that slowly rotates. As the user scrolls, it moves forward into a "tunnel" of light.
*   **The Hook:** A "Try it now" editor directly on the landing page. No login required to start typing.

### B. The Editor ("Sanctuary Mode")
*   **Goal:** A distraction-free ritual.
*   **UI:**
    *   Remove all sidebars and headers.
    *   **No static toolbar.** Use a "Bubble Menu" that only appears when text is selected.
    *   **Typography:** Large serif font (`text-xl`), centered on a "paper" background.
*   **The "Send" Action:**
    *   Do not use a "Submit" button. Use a **"Seal & Schedule"** button.
    *   **Animation:** When clicked, the letter should visually fold up, or a wax seal graphic should stamp onto the screen. Sound effect: A satisfying *thud* or *click*.

### C. The Dashboard ("The Vault")
*   **Layout:** Grid view of "Locked" capsules.
*   **Visuals:**
    *   Future letters are "blurred" or "locked" with a padlock icon and a countdown timer.
    *   Past (delivered) letters are "open" and readable.
*   **Micro-interaction:** Hovering over a locked letter shows the "Unlock Date" in a tooltip, but the content remains hidden.

---

## 5. Technical Architecture & Data Model

### Database Schema (Prisma)
You must implement the following core models:

1.  **User:** Links to Clerk ID.
2.  **Letter:**
    *   `title`: String
    *   `bodyCiphertext`: Bytes (Encrypted content - NEVER store plain text)
    *   `deliverAt`: DateTime
    *   `isDelivered`: Boolean
3.  **Delivery:** Tracks the status of the email/physical mail job.

### Security Requirement
*   **Client-Side Encryption:** Ideally, encrypt the letter on the client before sending to the server.
*   **At Rest:** If server-side encryption is used, ensure keys are rotated and managed securely.

---

## 6. Step-by-Step Implementation Guide

1.  **Setup:** Initialize Next.js 15 with Tailwind and Shadcn UI. Configure the "Brutalist" theme in `tailwind.config.ts`.
2.  **Core UI:** Build the `Button`, `Card`, and `Input` components with the hard-shadow, mono-font aesthetic.
3.  **The Editor:** Implement Tiptap with the "Bubble Menu" extension. Style it to look like a premium piece of stationery.
4.  **The Hero:** Create the 3D Capsule component using `@react-three/fiber`.
5.  **Backend:** Set up Prisma schema and the `sendLetter` Server Action (including encryption).
6.  **The "Seal" Animation:** Build the Framer Motion sequence for the sending state.

**Final Instruction:**
Do not build a generic SaaS. Build a product that feels like it will last for 100 years. Every pixel must serve the feeling of **permanence**.
