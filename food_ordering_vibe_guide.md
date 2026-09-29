# Vibe Coding Guide — CraveBite Food Ordering App
This guide contains a series of **9 sequential prompts** designed for students to build a premium, full-stack food delivery web application with Next.js, Prisma (SQLite), NextAuth.js, and Razorpay. 

By feeding these prompts to an AI coding assistant (like Gemini, Claude, or ChatGPT) step-by-step, students can construct the exact architecture, functionalities, and interactive pages of the app, while customizing the colors, style, and branding to their liking.

---

## Technical Architecture & Setup Rules

To ensure students do not run into common Next.js, database, or library bugs, the prompts incorporate specific guardrails for these known pain points:
1. **Windows C++ Compiler Restrictions**: Downgrade Prisma to version `6` (`^6.4.0`) to use the built-in Rust query engine. This avoids native C++ driver adapters (like `better-sqlite3`) that require Visual Studio build tools on Windows.
2. **Lucide React CASING & Icons**: Use `lucide-react` version `0.475.0` to preserve brand social icons.
3. **styled-jsx inside Server Components**: Keep Server Components pure. Never write `styled-jsx` directly in database-fetching Server Components; instead, extract dashboard CSS to dedicated stylesheets.
4. **React Hydration Mismatch**: Random client particle animations or dates must be deferred to post-mount (`useEffect`) to guarantee client-rendered HTML matches server-rendered HTML.
5. **Keyless Payments (Sandbox Simulator)**: Allow testing payments locally without actual Razorpay keys by creating a fallback sandbox simulator checkout modal in the frontend and signature bypass in the API endpoints.

---

# Prompt Sequence

### Step 1: Scaffolding, Theme Customization & Global CSS
> **Student Action**: Copy and paste the prompt below to start the project. Tell the AI what custom colors you want to use.

```text
Initialize a new Next.js 15+ project with TypeScript, App Router, and a `src` directory in the current folder. 
Do not use TailwindCSS; we want to write custom, modern vanilla CSS for maximum design control.

Let's setup the design system and scaffolding:
1. Install core dependencies: `prisma`, `@prisma/client`, `next-auth`, `razorpay`, `lucide-react@0.475.0`, `bcryptjs`, `zod`. (Ensure lucide-react is exactly 0.475.0).
2. Create `src/app/globals.css`. Set up CSS custom properties (variables) for a premium, appetizing theme. Include tokens for background, card backgrounds, borders, typography, and vibrant accents (e.g. food orange, spicy red, or fresh green). Add smooth micro-animations, glassmorphism, and appetizing shadow effects.
3. Set up custom utility classes for buttons (`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-lg`), badges, card-gradients, and responsive grids.
4. Create the root `layout.tsx` incorporating Google Fonts (Inter + Outfit) and SEO metadata. Make sure all pages include responsive styling.

Once done, print Tasks Finished.
```

---

### Step 2: Database Schema (Prisma & SQLite)
> **Student Action**: Run this prompt next to build the relational database schema.

```text
Let's build the relational database schema using Prisma for our food delivery app. 
Create `prisma/schema.prisma` targeting SQLite database provider. Ensure you define the following models:
1. `User` (id, name, email, password, phone, defaultAddress, role [default 'CUSTOMER'], timestamps, relations to orders, reviews, accounts, sessions).
2. `Account` & `Session` & `VerificationToken` (standard models for NextAuth session adapters).
3. `Restaurant` (id, name, slug [unique], address, rating, cuisine [String], coverImage, deliveryTime [mins], isPremium [Boolean], timestamps).
4. `MenuItem` (id, restaurantId [relation], name, description, price, category [String], isVeg [Boolean], imageUrl, available [Boolean]).
5. `Order` (id, userId, restaurantId, totalAmount, status [PENDING/PREPARING/OUT_FOR_DELIVERY/DELIVERED/CANCELLED], deliveryAddress, paymentStatus, razorpayOrderId, razorpayPaymentId, razorpaySignature, timestamps).
6. `OrderItem` (id, orderId, menuItemId, quantity, price).
7. `Review` (id, userId, restaurantId, rating [Int], comment, timestamps).

After generating the schema, run `npx prisma generate` to build the Prisma Client.

Once done, print Tasks Finished.
```

---

### Step 3: Database Seeding
> **Student Action**: Run this prompt to populate the database with default restaurants and menus.

```text
Create a Prisma seeding script in `prisma/seed.ts` that will populate the database when we run `npx prisma db seed`.
The seed script must populate:
1. 8+ Restaurants spanning different cuisines (Italian, Indian, Chinese, Fast Food, Healthy). Provide realistic ratings, addresses, and delivery estimates.
2. 5-10 Menu Items per restaurant, covering starters, main courses, desserts, and beverages. Ensure proper distribution of `isVeg` flags and realistic prices.
3. Ensure the seed file compiles properly. Configure the `prisma.seed` command in your `package.json` and tell me how to run the migration and seed the database.

Once done, print Tasks Finished.
```

---

### Step 4: Authentication Core & Route Protection
> **Student Action**: Run this prompt to set up NextAuth session management and route validation.

```text
Let's implement credentials authentication:
1. Create a Prisma client singleton at `src/lib/db.ts` to prevent multiple client instances during hot-reloading.
2. Set up NextAuth configuration in `src/lib/auth.ts` with a CredentialsProvider. Implement email/password validation by fetching from the SQLite user table and comparing passwords using `bcryptjs`.
3. Expose session and role variables inside the JWT token and Session callbacks.
4. Create the Catchall NextAuth API route handler at `src/app/api/auth/[...nextauth]/route.ts`.
5. Create a registration API endpoint at `src/app/api/auth/register/route.ts` that validates email uniqueness, hashes passwords with bcrypt, and registers a new User.
6. Set up route protection middleware in `src/proxy.ts` (Next.js 16 Proxy convention or standard middleware) that redirects unauthenticated users trying to access `/dashboard` routes back to `/login`, and redirects logged-in users away from `/login`/`/register` to `/dashboard`.

Once done, print Tasks Finished.
```

---

### Step 5: Auth UI Pages (Login & Register)
> **Student Action**: Create the forms for user signups.

```text
Create beautiful, responsive split-screen pages for Authentication:
1. Create an auth page layout in `src/app/(auth)/layout.tsx` that displays a mouth-watering food image or pattern block on the left (e.g. background with pizza/burger graphics, fresh ingredients) and the form inputs on the right.
2. Create the Login page `src/app/(auth)/login/page.tsx` using custom CSS. Validate email and password inputs client-side, showing error indicators. Integrate the NextAuth `signIn('credentials')` action and handle post-login redirects.
3. Create the Register page `src/app/(auth)/register/page.tsx` containing fields for Name, Email, Password, Phone Number, and Default Delivery Address.
Ensure both forms look premium, use glassmorphism inputs, smooth hover scales, and clear validation logic.

Once done, print Tasks Finished.
```

---

### Step 6: Navigation, Hero & Restaurant Listings
> **Student Action**: Build the public homepage and restaurant list.

```text
Let's assemble the public homepage and layout navigation:
1. Build a sticky Glassmorphism `Navbar.tsx` component in `src/components/Navbar.tsx`. Make it responsive with a toggleable burger menu on mobile. The navbar must read the NextAuth auth session and show a "Dashboard" link if logged in, and a "Login" CTA button if not. Include a Cart icon showing total items.
2. Build a modern `HeroSection.tsx` component. It should feature a large display heading ("Cravings Delivered Fast!"), a bold gradient tagline, a search bar for restaurants/cuisines, call-to-action buttons, and clean decorative floating food elements (emojis/particles). 
   - CRITICAL: To prevent React hydration mismatches, ensure any dynamic properties are deferred by rendering particles only after mounting (using `useState` and `useEffect` client-side).
3. Build a `CuisineCarousel.tsx` to display horizontal scrolling cuisines (Pizza, Sushi, Burgers, Healthy).
4. Build a `Footer.tsx` component featuring links, descriptions, contact info, and social brand icons using `lucide-react`. Add `use client` to Footer if it utilizes styled-jsx tags to prevent rendering errors.
5. Create the main landing page `src/app/page.tsx`. Fetch top-rated restaurants from the database, render the Hero, Cuisine Carousel, and a "Popular Restaurants near you" Grid.

Once done, print Tasks Finished.
```

---

### Step 7: Restaurant Menus & Global Cart
> **Student Action**: Build the ordering flow.

```text
Let's build the restaurant detail and cart system:
1. **Restaurants Catalog** (`src/app/restaurants/page.tsx`): Fetch all restaurants. Build a filterable UI where users can search, sort by rating/delivery time, and filter by Veg-only or Cuisine type.
2. **Restaurant Detail Page** (`src/app/restaurants/[slug]/page.tsx`): 
   - Display the Restaurant header (cover image, rating, cuisine).
   - Display the Menu categorized (Starters, Mains, etc.).
   - Each menu item has an "Add to Cart" button with a Veg/Non-Veg icon indicator.
3. **Cart State Management**: Use React Context (`src/context/CartContext.tsx`) or Zustand to manage global cart state. 
   - CRITICAL: Ensure a user can only add items from one restaurant at a time (clear cart if adding from a different restaurant).

Once done, print Tasks Finished.
```

---

### Step 8: Razorpay Checkout & Sandbox Simulator Gateway
> **Student Action**: Implement this prompt to build the payment workflow with a keyless fallback modal.

```text
Let's set up the checkout and payments workflow supporting both real Razorpay transactions and a mock/development sandbox simulator:
1. Create a Checkout Page (`src/app/checkout/page.tsx`) that displays cart items, subtotal, delivery fee, taxes, total, delivery address, and a "Place Order" button.
2. Create a Razorpay helper file `src/lib/razorpay.ts` that instantiates the Razorpay client using `process.env.RAZORPAY_KEY_ID` and `process.env.RAZORPAY_KEY_SECRET`. 
3. Create a POST endpoint `/api/payments/create-order/route.ts` that retrieves the cart items, calculates total, and checks if keys are default placeholders (e.g. `rzp_test_yourkeyhere`).
   - If keys are default placeholders, return a mock order payload (`isMock: true`, fake order ID).
   - If keys are valid, call `razorpay.orders.create` to generate a real Razorpay order ID.
   - Insert a `PENDING` transaction record in the `Order` table along with `OrderItem`s.
4. Create a verification POST endpoint `/api/payments/verify/route.ts` that validates signature parameters:
   - If `orderId` starts with `order_mock_`, check if `signature === 'mock_signature'`.
   - Otherwise, verify the HMAC SHA-256 hash using the Razorpay key secret.
   - On successful payment, mark the order as `PREPARING` and clear the user's cart.
5. Modify Checkout Page to handle order responses:
   - If `orderData.isMock` is returned, open a beautiful, custom glassmorphism **Sandbox Simulator checkout overlay modal** showing Total Price and Order ID. Add two buttons: "Simulate Success" (calls `/api/payments/verify` with mock signature) and "Cancel".
   - If real keys are present, load the Razorpay SDK script dynamically and prompt the native Razorpay payment overlay.
   - Redirect successful checkouts to `/dashboard/orders`.

Once done, print Tasks Finished.
```

---

### Step 9: Customer Dashboard & Live Order Tracking
> **Student Action**: Build the main private customer panels.

```text
Let's build the customer workspace dashboard:
1. Create a shared sidebar navigation layout at `src/app/dashboard/layout.tsx` providing links to: Overview, Order History, Addresses, and Reviews.
2. Build the Main Overview dashboard home page `src/app/dashboard/page.tsx`. Fetch user session details and display a welcoming banner, active/recent orders, and a quick link to browse restaurants.
3. Build the Orders page `src/app/dashboard/orders/page.tsx`:
   - Display a list of all past and active orders with their status badge (PENDING, PREPARING, OUT_FOR_DELIVERY, DELIVERED).
   - Clicking an order shows order items and total amount paid.
   - For an active order, render a "Live Tracking" UI (a simple mocked visual progress bar with steps like "Order Placed" -> "Preparing" -> "On the Way" -> "Delivered").
   - CRITICAL: Save all component styles inside a dedicated `dashboard.css` file and import it directly. Do not use styled-jsx within server-rendered pages to prevent styled-jsx hydration mismatches.

Once done, print Tasks Finished.
```

---

## Tips for Success (Vibe Coding)

* **Customize Colors**: Students can adjust the CSS custom properties in `globals.css` to instantly change the theme.
* **Troubleshooting Compilation**: If Next.js fails to compile styled-jsx or throws client/server mismatches, verify you have added `'use client';` at the top of interactive components (like navigation, carousels, lists, and forms).
* **Database Reset**: To wipe the SQLite database and start fresh with seed data, run:
  ```bash
  npx prisma db push --force-reset
  npx prisma db seed
  ```
