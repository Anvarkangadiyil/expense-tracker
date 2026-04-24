# Expense Tracker

A modern full-stack **Expense Tracker** built using Next.js and MongoDB.
The application allows users to record, filter, sort, and analyze personal expenses while ensuring reliability under real-world conditions such as network retries and page refreshes.

The system is designed with **production-like quality**, focusing on correctness, maintainability, and reliability.

---

# 📌 Project Overview

This application enables users to:

* Add new expense entries
* View all recorded expenses
* Filter expenses by category
* Sort expenses by date (newest first)
* View the total of currently visible expenses
* Handle duplicate submissions safely
* Maintain persistent expense records

The application simulates **real-world usage conditions**, including:

* Multiple form submissions
* Network retries
* Page refresh after submission
* Slow or failed API requests

Special care was taken to ensure **data correctness**, particularly for financial values.

---

# 🧰 Tech Stack

## Frontend

* **Next.js (App Router)** — Full-stack React framework
* **TypeScript** — Type safety and maintainability
* **Tailwind CSS** — Utility-first styling
* **shadcn/ui** — Reusable accessible UI components
* **date-fns** — Date formatting utilities

## Backend

* **Next.js API Routes** — Backend API implementation
* **Node.js** — Runtime environment
* **Zod** — Request validation

## Database

* **MongoDB Atlas** — Cloud-hosted NoSQL database
* **Mongoose** — Schema modeling and validation

## Utilities

* **UUID** — Unique request identifier generation

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd expense-tracker
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root:

```env
DATA_BASE_URL=mongodb+srv://username:password@cluster.mongodb.net/expense_tracker
NODE_ENV=development
```

Ensure:

* MongoDB Atlas cluster is running
* Your IP is allowed in MongoDB Atlas

---

## 4️⃣ Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 5️⃣ Build for Production

```bash
npm run build
npm start
```

---

# 📡 API Endpoints

## GET `/api/expenses`

Retrieve all expenses.

Supports filtering and sorting.

### Query Parameters

| Parameter      | Description                 |
| -------------- | --------------------------- |
| category       | Filter expenses by category |
| sort=date_desc | Sort newest first           |

### Example

```bash
/api/expenses?category=Food&sort=date_desc
```

### Response

```json
[
  {
    "id": "uuid",
    "amount": 250,
    "category": "Food",
    "description": "Lunch",
    "date": "2026-04-24T00:00:00.000Z",
    "created_at": "2026-04-24T10:30:00.000Z"
  }
]
```

---

## POST `/api/expenses`

Create a new expense.

### Request Body

```json
{
  "amount": 250,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-24",
  "requestId": "unique-uuid"
}
```

### Behavior

* Creates new expense
* Prevents duplicate creation using `requestId`
* Supports retry-safe operations

### Response

```json
{
  "id": "uuid",
  "amount": 250,
  "category": "Food",
  "description": "Lunch",
  "date": "...",
  "created_at": "..."
}
```

---

# 🗂️ Project Structure

```text
app/
 ├── api/
 │    └── expenses/
 │         └── route.ts

 ├── layout.tsx
 └── page.tsx

components/
 ├── expense-form.tsx
 ├── expense-table.tsx
 ├── category-summary.tsx

lib/
 ├── db.ts
 ├── validations/

services/
 └── expense.service.ts

models/
 └── Expense.ts

public/
 └── screenshots/
```

---

# 🧠 Design Decisions

## 1️⃣ Idempotent API Design

**Decision:**
Use `requestId` to ensure safe retries.

**Why:**

Users may:

* Click submit multiple times
* Refresh the page
* Retry after network failure

Without idempotency:

```text
Duplicate expenses could be created
```

**Solution:**

* Client generates UUID
* Server checks if request exists
* If found → return existing record
* Else → create new record

This ensures **data correctness under unreliable networks**.

---

## 2️⃣ MongoDB + Mongoose

**Why MongoDB?**

MongoDB was selected because:

* Flexible schema design
* Fast development iteration
* Suitable for lightweight financial tools
* Easy cloud deployment using MongoDB Atlas

**Why Mongoose?**

Mongoose provides:

* Schema validation
* Data consistency
* Model-based structure
* Cleaner database interactions

---

## 3️⃣ MongoDB Connection Caching

MongoDB connections are cached globally.

**Why:**

Creating new connections repeatedly:

* Slows performance
* Increases database load

Global caching ensures:

```text
Faster requests
Lower overhead
Better scalability
```

---

## 4️⃣ Zod Validation

All request payloads are validated using Zod.

**Benefits:**

* Prevent invalid data
* Ensure positive expense values
* Provide clear error messages
* Maintain data integrity

---

## 5️⃣ UI Component Strategy

UI built using:

```text
shadcn/ui + Tailwind CSS
```

**Why:**

* Accessible components
* Minimal styling overhead
* Clean professional layout
* Consistent design patterns

---

# 🧮 Expense Total Calculation

The application dynamically calculates the total of **currently visible expenses**.

Behavior:

* Updates automatically after filtering
* Updates after sorting
* Reflects only visible records
* Currency formatted using ₹ (INR)

Example:

```text
Total: ₹1,250
```

This ensures accurate financial visibility.

---

# ⚖️ Trade-offs

## 1️⃣ No Update/Delete Operations

Expenses can only be created.

**Reason:**

Focus was placed on:

* Reliable creation
* Filtering
* Sorting

These are core requirements.

**Future improvement:**

```text
PATCH /api/expenses/:id
DELETE /api/expenses/:id
```

---

## 2️⃣ Client-Side Aggregation

Category totals are calculated on the client.

**Advantages:**

* Simpler backend
* Faster UI updates
* Reduced API complexity

**Limitation:**

Not suitable for very large datasets.

---

## 3️⃣ Basic Category System

Categories are stored as strings.

**Trade-off:**

No category management UI yet.

Future:

```text
Category CRUD system
```

---

# 🚀 Future Improvements

If more time were available, the following features would be added.

---

## Core Improvements

* Update existing expenses
* Delete expenses
* Date range filtering
* Category management
* Expense editing UI

---

## Advanced Features

* Budget tracking
* Recurring expenses
* CSV export
* Monthly reports
* Spending insights dashboard

---

## Performance Improvements

* Database indexing
* Pagination
* Caching layer
* API rate limiting

---

## Infrastructure Improvements

* Docker containerization
* CI/CD pipeline
* Error monitoring
* Performance logging

---

# 🧪 Error Handling Strategy

The system handles:

* Network failures
* Slow API responses
* Invalid requests
* Duplicate submissions

Users receive:

* Clear error messages
* Safe retry behavior
* Consistent system responses

---

# 🌐 Deployment

Recommended deployment:

* **Frontend + API:** Vercel
* **Database:** MongoDB Atlas

Deployment command:

```bash
vercel deploy
```

After deployment:

Update environment variables in Vercel.

---

# 📌 Key Highlights

✔ Retry-safe expense creation
✔ Clean modular architecture
✔ Production-ready API design
✔ Reliable MongoDB integration
✔ Responsive UI
✔ Real-world reliability handling

---

# 🧑‍💻 Author

**Anvar Kangadiyil**

Full Stack Developer
Next.js | MongoDB | TypeScript


