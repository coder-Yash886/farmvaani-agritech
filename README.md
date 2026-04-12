<div align="center">

```
███████╗ █████╗ ██████╗ ███╗   ███╗██╗   ██╗ █████╗  █████╗ ███╗   ██╗██╗
██╔════╝██╔══██╗██╔══██╗████╗ ████║██║   ██║██╔══██╗██╔══██╗████╗  ██║██║
█████╗  ███████║██████╔╝██╔████╔██║██║   ██║███████║███████║██╔██╗ ██║██║
██╔══╝  ██╔══██║██╔══██╗██║╚██╔╝██║╚██╗ ██╔╝██╔══██║██╔══██║██║╚██╗██║██║
██║     ██║  ██║██║  ██║██║ ╚═╝ ██║ ╚████╔╝ ██║  ██║██║  ██║██║ ╚████║██║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝
```

### 🌾 फार्म वाणी — AI-Powered AgriTech Platform for Indian Farmers
<br/>

> *"FarmVaani gives a voice to India's 140 million farmers through the power of AI."*

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌾 **AI Crop Advisory** | Personalized crop recommendations via Claude AI based on soil, region & season |
| 🌦️ **Weather Forecasting** | Real-time hyperlocal weather data to plan farming activities smartly |
| 📊 **Live Mandi Rates** | Live market crop prices — help farmers get fair rates |
| 🤖 **AI Chatbot (Hindi)** | Voice & text chatbot powered by Claude AI — supports Hindi language |
| 🦠 **Disease Detection** | Upload a crop image → instant AI-based disease diagnosis & remedy |
| 👥 **Community Forum** | Groups & messaging for farmers to connect and share knowledge |
| 🔐 **Secure Auth** | JWT-based farmer registration & login system |
| 📢 **Smart Alerts** | Real-time weather & farming alerts with audio notification support |

---

## 🛠️ Tech Stack

### 🌐 Frontend
| Technology | Purpose |
|-----------|---------|
| React.js (Vite) | UI Framework |
| React Router DOM | Client-side Routing |
| Axios | API Calls |
| CSS | Styling |

### 🖥️ Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication & Authorization |
| Claude AI (Anthropic) | AI Advisory & Chatbot Service |
| Groq API | Fast LLM Integration |
| Multer | Image & Audio File Uploads |
| Weather API | Real-time Weather Service |

---

## 📁 Project Structure

```
FarmVaani/
└── farmvaani-app/
    │
    ├── 🖥️ Backend/
    │   ├── node_modules/
    │   ├── src/
    │   │   │
    │   │   ├── controllers/                  # Route handlers & business logic
    │   │   │   ├── advisoryController.js     # AI crop advice & chatbot logic
    │   │   │   ├── alertController.js        # Alert creation & fetching
    │   │   │   ├── authController.js         # Register, Login, JWT issuance
    │   │   │   ├── communityController.js    # Groups, messages & community posts
    │   │   │   ├── farmerController.js       # Farmer profile management
    │   │   │   └── mandiController.js        # Live mandi market rates
    │   │   │
    │   │   ├── middleware/
    │   │   │   └── auth.js                   # JWT verification middleware
    │   │   │
    │   │   ├── models/                       # MongoDB Mongoose Schemas
    │   │   │   ├── Alert.js                  # Alert data model
    │   │   │   ├── Farmer.js                 # Farmer user model
    │   │   │   ├── Group.js                  # Community group model
    │   │   │   ├── Message.js                # Chat message model
    │   │   │   ├── Query.js                  # Advisory query model
    │   │   │   └── User.js                   # Base user model
    │   │   │
    │   │   ├── routes/                       # Express API Route Definitions
    │   │   │   ├── advisoryRoutes.js         # /api/advisory/*
    │   │   │   ├── alertRoutes.js            # /api/alerts/*
    │   │   │   ├── authRoutes.js             # /api/auth/*
    │   │   │   ├── farmerRoutes.js           # /api/farmer/*
    │   │   │   └── mandiRoutes.js            # /api/mandi/*
    │   │   │
    │   │   └── services/                     # Third-party API Integrations
    │   │       ├── alertService.js           # Alert processing & scheduling
    │   │       ├── claudeService.js          # Anthropic Claude AI integration
    │   │       └── weatherService.js         # Weather API integration
    │   │
    │   ├── uploads/                          # Farmer-uploaded images & audio files
    │   │   ├── audio-*.mp3                   # Voice query recordings
    │   │   └── img-*.jpg / img-*.png         # Crop disease detection images
    │   │
    │   ├── .env                              # ⚠️ Secret keys (never commit!)
    │   ├── .gitignore
    │   ├── app.js                            # Express app entry point
    │   ├── test-groq.js                      # Groq API test/debug script
    │   ├── package.json
    │   └── package-lock.json
    │
    └── 🌐 Frontend/
        ├── node_modules/
        ├── public/                           # Static public assets
        ├── src/
        │   ├── assets/                       # Images, icons, fonts
        │   │
        │   ├── components/                   # Shared/reusable UI components
        │   │   ├── Footer.jsx                # Site footer
        │   │   └── Navbar.jsx                # Navigation bar
        │   │
        │   └── pages/                        # Full page components (routed)
        │       ├── Advisory.jsx              # AI Crop Advisory page
        │       ├── Community.jsx             # Community Forum page
        │       ├── Home.jsx                  # Landing / Home page
        │       ├── Login.jsx                 # Farmer Login page
        │       ├── MandiRates.jsx            # Live Mandi Rates page
        │       └── Signup.jsx                # Farmer Registration page
        │
        ├── App.css                           # Global styles
        ├── App.jsx                           # Root component with route setup
        ├── index.css                         # CSS reset & base styles
        ├── main.jsx                          # Vite app entry point
        ├── .env                              # Frontend env variables
        ├── .gitignore
        ├── eslint.config.js                  # ESLint configuration
        ├── index.html                        # HTML shell
        ├── package.json
        ├── package-lock.json
        └── README.md
```

---

### 📦 Step-by-Step Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/coder-Yash886/farmvaani-agritech.git
cd farmvaani-agritech/farmvaani-app
```

---

#### 2️⃣ Setup & Run the Backend

```bash
cd Backend
npm install
```
Create a `.env` file inside `Backend/` (see [Environment Variables](#-environment-variables) section):

```bash
# Start backend in development mode
npm run dev
```

> ✅ Backend runs at: `http://localhost:5000`

---

#### 3️⃣ Setup & Run the Frontend

```bash
cd ../Frontend
npm install
```

Create a `.env` file inside `Frontend/`:

```bash
# Start frontend dev server
npm run dev
```

> ✅ Frontend runs at: `http://localhost:5173`

---

#### 4️⃣ Open in Browser

```
http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend — `Backend/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/farmvaani
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
WEATHER_API_KEY=your_openweather_or_weatherapi_key
```

### Frontend — `Frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

| Variable | Description | Required |
|----------|-------------|:--------:|
| `PORT` | Backend server port | ✅ |
| `MONGO_URI` | MongoDB Atlas connection URI | ✅ |
| `JWT_SECRET` | Secret key for signing JWT tokens | ✅ |
| `GROQ_API_KEY` | Groq LLM API key | ✅ |
| `WEATHER_API_KEY` | Weather data API key | ✅ |
| `VITE_API_BASE_URL` | Backend base URL for frontend | ✅ |

---

## 🌐 API Endpoints

### 🔐 Auth — `/api/auth`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/auth/register` | Register new farmer account | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT token | ❌ |

### 🌾 Advisory — `/api/advisory`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/api/advisory/recommend` | Get AI-based crop recommendations | ✅ |
| `POST` | `/api/advisory/chat` | Chat with Hindi AI assistant | ✅ |
| `POST` | `/api/advisory/disease` | Upload image → disease detection | ✅ |

### 📢 Alerts — `/api/alerts`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/alerts` | Fetch all active alerts | ✅ |
| `POST` | `/api/alerts/create` | Create a new farming alert | ✅ |

### 📊 Mandi — `/api/mandi`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/mandi/rates` | Get all live mandi crop rates | ✅ |
| `GET` | `/api/mandi/rates/:crop` | Get rate for a specific crop | ✅ |

### 👥 Community
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/community/groups` | Get all community groups | ✅ |
| `POST` | `/api/community/groups` | Create a new group | ✅ |
| `POST` | `/api/community/message` | Post a message in a group | ✅ |

### 👨‍🌾 Farmer — `/api/farmer`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/api/farmer/profile` | Get logged-in farmer's profile | ✅ |
| `PUT` | `/api/farmer/profile` | Update farmer profile details | ✅ |

> ✅ = Requires JWT Bearer Token in `Authorization` header

---

