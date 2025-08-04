# 🏢 Multifamily Property Management App

A comprehensive property management application designed for multifamily property developers and managers. This app helps determine ideal tenant profiles and provides intelligent amenity suggestions based on property location, demographics, and market analysis.

## 🎯 What This App Does

**For Property Developers & Managers:**
- **Smart Property Analysis**: Add your properties with location-based satellite imagery
- **Intelligent Tenant Profiling**: Generate ideal tenant profiles based on demographics and preferences  
- **Amenity Recommendations**: Get data-driven amenity suggestions with cost estimates
- **Investment Intelligence**: Make informed decisions about property improvements and target markets

**Real-World Example:**
Enter a 20-unit building near a university → Get recommendations for student/young professional tenants → Receive amenity suggestions like study rooms ($15K), fast WiFi ($5K), and bike storage ($3K).

## ✨ Key Features

### 🗺️ Interactive Property Mapping
- **Real-time Address Search**: Live autocomplete with global coverage
- **HD Satellite Imagery**: High-resolution property views using ArcGIS
- **Precise GPS Coordinates**: 6-decimal accuracy for exact location tracking
- **No API Keys Required**: Free mapping solution using OpenStreetMap

### 👥 Intelligent Tenant Profiling
- **Demographic Analysis**: Age ranges, income brackets, lifestyle categories
- **Custom Preferences**: Tag-based system for flexible tenant requirements
- **Automated Summaries**: Generated ideal tenant profile descriptions

### 🏗️ Smart Amenity Recommendations
- **Category-Based Suggestions**: Fitness, Social, Work, Family, Pet amenities
- **Cost Estimation**: Real-world installation and maintenance costs
- **ROI Analysis**: Investment decision support framework

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **tRPC Client** for type-safe API communication
- **Tailwind CSS** for modern utility-first styling
- **React Query** for smart data caching

### Backend
- **Node.js** with Express
- **tRPC** for end-to-end type safety
- **TypeORM** for database management
- **Zod** for runtime validation
- **PostgreSQL** database

### Mapping & Location
- **OpenStreetMap Nominatim** for geocoding
- **ArcGIS World Imagery** for satellite tiles
- **Canvas Rendering** for custom map interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd multifamily-property-app
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. **PostgreSQL Database Setup**

**Install PostgreSQL** (if not already installed)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Windows: Download from https://www.postgresql.org/download/windows/
```

**Create Database and User**
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Or on macOS/Windows
psql -U postgres
```

**Execute Database Setup Commands**
```sql
-- Create a new database
CREATE DATABASE property_management_db;

-- Create a new user with password
CREATE USER property_app_user WITH PASSWORD 'secure_password_123';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE property_management_db TO property_app_user;

-- Exit PostgreSQL
\q
```

**Test Database Connection**
```bash
# Test connection with new user
psql -h localhost -U property_app_user -d property_management_db
```

4. **Environment Setup**
```bash
# Backend environment (.env)
DATABASE_URL="postgresql://property_app_user:secure_password_123@localhost:5432/property_management_db"
PORT=3001
NODE_ENV=development
```

5. **Start Development Servers**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend  
npm run dev
```

6. **Open Application**
Navigate to `http://localhost:3000` in your browser.

## 📱 User Flow

### Phase 1: Property Creation
1. **Enter Property Location**: Use the search bar with live autocomplete
2. **View Satellite Imagery**: Automatic HD satellite view loads
3. **Add Property Details**: Number of units (1-1000 range)
4. **Tag Features**: Add property features using the tag system
5. **Create Property**: Confirm and save with validation

### Phase 2: Tenant Profile Generation
1. **Select Demographics**: Choose age ranges and income brackets
2. **Choose Lifestyle**: Professional, Student, Family, Retiree categories
3. **Add Preferences**: Custom tenant preferences with tags
4. **Generate Profile**: Ideal tenant description
5. **Link to Property**: Profile automatically connected

### Phase 3: Amenity Intelligence
1. **Algorithm Analysis**: System analyzes demographics + location
2. **Category Suggestions**: Fitness, Social, Work, Family, Pet amenities
3. **Cost Analysis**: Installation and maintenance estimates
4. **Investment Insights**: ROI-ready recommendations



## 🔧 Development

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build

# Backend
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
```

### Project Structure
```
multifamily-property-app/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── server.ts
│       ├── trpc.ts
│       └── utils/
│           ├── db.ts
│           └── errors.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── test-output.css
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        ├── components/
        │   ├── Layout.tsx
        │   ├── PropertyForm.tsx
        │   ├── TenantProfileForm.tsx
        │   ├── AmenitySuggestions.tsx
        │   └── InteractiveMap.tsx
        └── utils/
            └── trpc.ts
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
```

### Environment Variables (Production)
```bash
DATABASE_URL=postgresql://property_app_user:your_secure_password@your-db-host:5432/property_management_db
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Review existing issues and discussions

---

**Built with ❤️ for the real estate and property management industry**