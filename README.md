# Loadmill Demo: Maker–Checker Funds‑Transfer Approval

This project demonstrates how **Loadmill** can automate testing for a classic maker-checker approval flow.

Roles:

- **Maker** – initiates a funds‑transfer request  
- **Checker** – reviews the request and **approves** or **rejects** it

The demo consists of:

- A **Node.js/Express** backend with `@loadmill/node-recorder` for traffic capture  
- A **React** frontend with dashboards for both roles

---

## Project Structure

```

MAKER-CHECKER-DEMO/
├── backend/                 # Express API with Loadmill recorder
│   └── index.js
├── frontend/                # React app (Maker + Checker UI)
│   ├── public/
│   ├── src/
│   ├── build/              # Created after frontend build
│   └── package.json
├── package.json             # Root-level dependencies and scripts
├── Procfile                 # Used by Heroku to launch the app
└── README.md

````

---

## Quick Start (Local)

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd MAKER-CHECKER-DEMO
````

### 2. Install Dependencies

Install dependencies for both the root (backend) and frontend:

```bash
npm install
cd frontend && npm install
cd ..
```

> No separate `backend/package.json` exists — backend dependencies are declared in the root.

### 3. (Optional) Set Recorder Tracking Code

To capture traffic with your own Loadmill app ID:

```bash
export LOADMILL_CODE=<your-loadmill-tracking-id>
```

If not set, a public sample code is used (see `backend/index.js`).

Supported environment variables:

| Variable        | Default       | Purpose                               |
| --------------- | ------------- | ------------------------------------- |
| `LOADMILL_CODE` | *sample code* | App ID from **Loadmill → Recordings** |
| `DEBUG`         | –             | Set to `loadmill:*` for verbose logs  |

### 4. Start Backend and Frontend Together

```bash
npm run dev
```

* Backend runs at: `http://localhost:3001`
* Frontend runs at: `http://localhost:3000` (proxy setup to backend)

### 5. Log In with Demo Accounts

| Role    | Username | Password     |
| ------- | -------- | ------------ |
| Maker   | maker    | maker1234!   |
| Checker | checker  | checker1234! |

---

## How the Demo Works

1. **Maker** logs in and submits a transfer (amount + recipient).
2. The transfer shows as **PENDING**.
3. **Checker** logs in to approve or reject.
4. Both dashboards update — Checker view auto-refreshes every 5 seconds.
5. All requests go through `expressRecorder`, generating a Loadmill recording.

> All data is in-memory only. Refreshing the app resets state.

---

## Key API Endpoints

| Method | Path                     | Description (Auth: `token` header) |
| ------ | ------------------------ | ---------------------------------- |
| POST   | `/api/login`             | Get token                          |
| POST   | `/api/transfer/initiate` | Maker creates transfer             |
| GET    | `/api/transfer/my`       | Maker lists own transfers          |
| GET    | `/api/transfer/pending`  | Checker lists pending transfers    |
| POST   | `/api/transfer/approve`  | Checker approves transfer          |
| POST   | `/api/transfer/reject`   | Checker rejects transfer           |
| GET    | `/api/transfer/:id`      | Fetch single transfer (any user)   |
| GET    | `/api/audit`             | Simple audit log                   |

---

## Loadmill Recorder Usage

The backend uses `@loadmill/node-recorder` to capture all API traffic:

### Already installed (via root `package.json`):

```bash
npm i @loadmill/node-recorder --save
```

### Example in `backend/index.js`:

```js
const { expressRecorder } = require('@loadmill/node-recorder');
app.use(
  expressRecorder({
    loadmillCode: process.env.LOADMILL_CODE,
    notSecure: true,
    cookieExpiration: 10 * 60 * 1000,
    basePath: 'http://localhost:3000'
  })
);
```

### Debugging

To enable detailed logging:

```bash
DEBUG=loadmill:* npm run backend
```

---

## Running in Production (e.g. Heroku)

### 1. Build + Serve Frontend via Backend

When deploying, the `heroku-postbuild` script runs:

```bash
cd frontend && npm install && npm run build
```

This builds static frontend files into `frontend/build`.

### 2. Serve Frontend from Express

The backend serves these static files using:

```js
app.use(express.static(path.join(__dirname, '../frontend/build')));
```

### 3. Start App

```bash
npm start
```

This runs `node backend/index.js` — and serves everything from a single Node process.

---

## Loadmill Testing Tips

* Run through a full Maker → Checker flow, then check **Loadmill → Recordings**.
* Convert the captured session into a test using Loadmill’s visual editor.
* Parameterize fields like `amount`, `recipient`, and add negative test cases (e.g. too large, rejected twice, etc.).
* Localhost is supported for recording thanks to `notSecure: true`.
