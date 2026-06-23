# 🏋️‍♂️ Exercise Tracker REST API

An asynchronous, layer-architected REST API built with Node.js, Express, and SQLite. This project implements the core specifications for the **freeCodeCamp Back End Development and APIs** certification curriculum.

It features a modern codebase leveraging native **ES Modules (ESM)**, **TypeScript**, strict type boundaries, and automated integration test suites.

---

## 🛠️ Tech Stack & Tools

* **Runtime:** Node.js (v20+)
* **Language:** TypeScript (Configured with `NodeNext` resolution)
* **Framework:** Express.js
* **Database:** SQLite via `sqlite-async`
* **Dev Engine:** `tsx` (TypeScript Execute / Watcher)
* **Testing:** Jest, `ts-jest` (utilizing `--experimental-vm-modules`), and Supertest

---

## 📐 Architecture Layers

The backend follows a strict separation of concerns to maximize modularity and testability:

```
📦 src
 ┣ 📂 db          # Database connection, schemas, and lifecycle init
 ┣ 📂 modules     # Feature-driven modules
 ┃ ┗ 📂 users
 ┃   ┣ 📜 users.controller.ts # Validates HTTP inputs & shapes payloads
 ┃   ┣ 📜 users.repo.ts       # Executes raw SQL statements safely
 ┃   ┣ 📜 users.routes.ts     # Maps routes to controllers
 ┃   ┣ 📜 users.service.ts    # Coordinates business rules & logic
 ┃   ┗ 📜 users.types.ts      # Strictly typed interfaces (User, Log, Exercise)
 ┣ 📜 app.ts      # Express middleware & router mounting
 ┗ 📜 index.ts    # Database bootstrapper and application listener

```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/wfaratgd/exercise-tracker
cd boilerplate-project-exercisetracker
npm install
  
```

### 2. Environment Setup

Create a `.env` file in the root directory (optional, falls back to port `3000` by default):

```env
PORT=3000

```

### 3. Run the App

| Command | Action |
| --- | --- |
| `npm run dev` | Spins up the development server with hot-reloading via `tsx` |
| `npm test` | Executes the complete unit and integration Jest ESM test suites |
| `npm run build` | Compiles TypeScript source files into the native production `./dist` directory |
| `npm start` | Executes the compiled production build using standard Node |

---

## 🛰️ API Specification

> ⚠️ **Crucial Detail:** To satisfy the freeCodeCamp microservice testing agent, form endpoints expect fields delivered as standard HTML URL-encoded inputs (`application/x-www-form-urlencoded`), rather than raw JSON strings.

### 👤 User Endpoints

#### Create a User

* **URL:** `/api/users`
* **Method:** `POST`
* **Payload (Form Data):** `username`
* **Response (201 Created):**
```json
{
  "_id": 1,
  "username": "charlie"
}

```



#### List All Users

* **URL:** `/api/users`
* **Method:** `GET`
* **Response (200 OK):**
```json
[
  { "_id": 1, "username": "charlie" },
  { "_id": 2, "username": "jane" }
]

```



---

### 🏃‍♂️ Exercise & Log Endpoints

#### Add Exercise Entry

* **URL:** `/api/users/:_id/exercises`
* **Method:** `POST`
* **Payload (Form Data):**
* `description` (Required, string)
* `duration` (Required, integer minutes)
* `date` (Optional, `YYYY-MM-DD`. Defaults to current system date if omitted)


* **Response (201 Created):**
```json
{
  "_id": 1,
  "username": "charlie",
  "description": "Running",
  "duration": 30,
  "date": "Tue Jun 23 2026"
}

```



#### Retrieve Exercise History Logs

* **URL:** `/api/users/:_id/logs`
* **Method:** `GET`
* **Query Parameters (Optional Filters):**
* `from` (`YYYY-MM-DD` start bounds)
* `to` (`YYYY-MM-DD` end bounds)
* `limit` (Integer ceiling representing max entries returned)


* **Response (200 OK):**
```json
{
  "_id": 1,
  "username": "charlie",
  "count": 1,
  "log": [
    {
      "description": "Running",
      "duration": 30,
      "date": "Tue Jun 23 2026"
    }
  ]
}

```



---

## 🗃️ Database Schema Blueprint

The tables are initialized automatically at application startup before opening the network port:

### `users` Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
);

```

### `exercises` Table

```sql
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

```