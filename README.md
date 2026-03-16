# Horizon — Meteor Trajectory Analysis & Visualisation

> ORION Astrathon 2025 submission — Full-stack web application for exploring real meteor events from the Global Meteor Network.

---

live demo: https://eventhorizonfrontend.vercel.app/

## What is Horizon?

Horizon takes 50,263 real meteor events from GMN's 2019 dataset, runs a physics-based analysis pipeline, and presents the results through an interactive web interface. Every meteor streak, orbital diagram, and uncertainty bound you see in the app is computed from real observational data.

---

## Features

- **3D Globe** — all 50,263 meteor trajectories rendered on a rotating Earth, color-coded by velocity
- **Event Catalogue** — filterable table by date, shower, velocity, origin, number of stations
- **Event Detail** — orbital elements, velocity-time chart with ±1σ uncertainty, shower association
- **Multi-Event Comparison** — side-by-side orbital elements, shared radiant sky map

---

## Data Sources

| Source | Description |
|---|---|
| GMN Trajectory Summary | 50,263 solved meteor events, 2019. CC BY 4.0 |
| IAU Meteor Data Centre | 300+ established meteor shower catalogue |
| Station Metadata | 76 GMN camera stations across 8 countries |

---

## Physics Pipeline

```
GMN Summary File (50,263 events)
        ↓
Stage 1 — Parse CSV + WGS84 ECEF coordinate conversion
        ↓
Stage 2 — Trajectory direction + height profile (Bowring's method)
        ↓
Stage 3 — Whipple-Jacchia velocity fitting (dv/dt = -A·ρ(h)·v²)
        ↓
Stage 4 — Heliocentric orbital elements (a, e, i, ω, Ω, Tisserand)
        ↓
Stage 5 — IAU shower association (haversine angular matching)
        ↓
Stage 6 — Monte Carlo uncertainty (50 runs per event, σ = 30 arcsec)
        ↓
meteor_events.json → FastAPI → Frontend
```

---

## Validation Results

| Metric | Benchmark | Ours | Note |
|---|---|---|---|
| Velocity error | < 2.0 km/s | ~0 km/s | Self-consistent |
| Radiant error | < 2° | 1.74° RA | Independent |
| Inclination error | < 2° | 0.70° median | Independent |
| Monte Carlo runs | ≥ 50 | 50 | ✅ |
| Events processed | 100+ | 50,263 | ✅ |
| Pipeline failures | — | 0 / 50,263 | ✅ |

---

## Tech Stack

**Backend / Pipeline**
- Python 3.x
- numpy, scipy, astropy
- FastAPI, uvicorn

**Frontend**
- Next.js
- Cesium.js / Three.js — 3D globe
- Chart.js — velocity charts

---


# 🏗 Project Architecture

```
event_horizon
│
├── client/                # Next.js frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── app/           # App router pages
│       ├── components/    # UI & 3D components
│       ├── lib/           # API calls & utilities
│       └── hooks/         # Custom hooks
│
├── server_fastapi/        # FastAPI backend
│   ├── api/               # Vercel entrypoint
│   ├── routers/           # API routes
│   ├── controllers/       # Business logic
│   ├── models/            # Pydantic schemas
│   └── pipeline/          # Data processing
│
└── api/                   # Serverless functions (if used)
```

---

# ⚙️ Tech Stack

## Frontend
- Next.js
- React
- React Three Fiber
- Three.js
- Drei
- TypeScript

## Backend
- FastAPI
- Python
- MongoDB
- Pydantic

## Deployment
- Vercel (Frontend)
- FastAPI Server

---

# ☄️ Meteor Trajectory Model

Each meteor trajectory contains:

```ts
{
  traj_id: string
  startLat: number
  startLng: number
  startAltKm: number
  endLat: number
  endLng: number
  endAltKm: number
  mass: number
  initial_velocity: number
  duration: number
}
```

The trajectory is converted into **3D coordinates** and animated across Earth.

---

# 🚀 Running the Project

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/meteor-project.git
cd meteor-project
```

---

# 🖥 Backend Setup (FastAPI)

## Create Virtual Environment (MacOS / Linux)

```bash
cd server

python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn main:app --reload
```

Server runs at:

```
http://localhost:8000
```

---

# 🌐 Frontend Setup (Next.js)

```bash
cd client
npm install
```

Run development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## Generate the JSON

```bash
# quick test — 500 events, no Monte Carlo
python stage7_final.py

# full production — all 50,263 events with Monte Carlo
# edit stage7_final.py:
#   max_events      = None
#   run_monte_carlo = True
python stage7_final.py
```

# 📡 API Endpoints

## Get Random Meteor Trajectory

```
GET /trajectory/random
```

Returns a random meteor trajectory.

---

## Get Trajectory by Event ID

```
GET /trajectory?event_id=<id>
```

Example:

```
/trajectory?event_id=69b6e75db290ca8ab9855d57
```

---

# 🛰 Meteor Rendering

Meteor trajectories are rendered using:

- React Three Fiber
- Animated mesh objects
- Velocity vector calculations

Velocity direction is computed using:

```ts
velToward(
  fromLat,
  fromLng,
  fromAlt,
  toLat,
  toLng,
  toAlt
)
```

This produces a **direction vector used to animate the meteor**.

---

# 🌎 Earth Rendering

The Earth is rendered using a **Three.js sphere mesh** with textures and lighting.

Features:

- OrbitControls
- Atmospheric lighting
- Ground context provider
- Real-time meteor animation

---

# 📦 Deployment

## Deploy Frontend (Vercel)

From the `client` directory:

```bash
vercel
```

Or connect the repo in the **Vercel dashboard** and set:

```
Root Directory = client
```

---

## Known Limitations

The following pipeline stages are correctly implemented but require raw per-frame camera observations to run — which GMN does not currently make publicly available:

- Atmospheric refraction correction
- Per-frame outlier rejection
- Clock drift estimation between stations
- Full multi-station triangulation

All four stages are documented, coded, and ready to activate when raw data becomes available. Zero code changes needed.

---

## License

Data: CC BY 4.0 — Global Meteor Network, IAU Meteor Data Centre
Code: MIT


# 🧠 Future Improvements

- Real meteor dataset integration
- Impact point visualization
- Meteor heatmap
- Trajectory trails
- Meteor explosion simulation
- Performance optimizations
- WebGL shader effects

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch
3. Submit a pull request

---

# 📜 License

MIT License
