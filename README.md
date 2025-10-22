# 🎥 Classync Platform

Hey there! 👋 This is my final project for my web development course - a video review platform that I built from scratch. It's designed to help teachers and students collaborate better through video content with interactive feedback and commenting.

## 🚀 Live Demo

**Frontend**: [https://class-review.netlify.app]
**Backend API**: [https://project-final-simon.onrender.com/]

## 🎯 What I was trying to solve

I noticed that when learning from videos, it's really hard to give specific feedback or ask questions about particular moments. Traditional video platforms just don't cut it for educational content. I wanted to build something that would let students and teachers have meaningful discussions about specific parts of videos, with time-coded comments and organized feedback.

## 💡 How I solved it

I built this platform that lets you:

- **Comment on specific video moments** - no more "around the 3-minute mark" confusion!
- **Organize everything by classes and projects** - keeps things tidy and easy to find
- **Have real conversations** - nested comments, replies, and likes make discussions feel natural
- **Switch between teacher and student views** - different interfaces for different needs
- **Use it on any device** - responsive design that works everywhere

## 🛠️ Technologies Used

### Frontend

- **React 19** with TypeScript for type-safe development
- **Styled Components** for component-based styling and theming
- **Framer Motion** for smooth animations and transitions
- **Zustand** for lightweight state management (It is were all my fetches are)
- **React Router** for client-side routing and navigation
- **Vite** for fast development and building

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM for data persistence
- **TypeScript** for type safety and better development experience
- **JWT Authentication** with bcrypt for secure user management
- **Multer & Cloudinary** for file uploads and media management
- **Swagger** for API documentation

### Development Tools

- **ESLint** for code quality and consistency
- **TypeScript** for static type checking
- **Git** for version control

## 🚀 Features

### 🎬 Video Management

- Upload videos and organize them by classes and projects
- Add time-coded comments at specific moments
- Video player with progress tracking and volume controls
- Generate thumbnails automatically

### 💬 Interactive Feedback System

- Comment threads that can have replies (and replies to replies!)
- Like/unlike comments and replies
- Comments are linked to specific video timestamps

### 👥 User Management

- Secure login/signup with JWT tokens
- Different views for teachers vs. students
- User profiles and activity tracking
- Session management that actually works

### 🎨 Modern UI/UX

- Dark/light theme switching
- Responsive design that works on phones, tablets, and desktops
- Smooth animations and transitions
- Intuitive navigation that doesn't confuse users

## 🏃‍♂️ How to get it running locally

### What you need:

- Node.js (v18 or higher)
- MongoDB instance (I used MongoDB Atlas for free)
- npm or yarn

### Step by step:

1. **Clone my repo**

   ```bash
   git clone https://github.com/simonfrisk/classync-platform.git
   cd classync-platform
   ```

2. **Install backend stuff**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend stuff**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   Create `.env` files in both backend and frontend directories:

   **Backend (.env)**

   ```env
   MONGO_URL=mongodb://localhost/classync
   PORT=8080
   JWT_SECRET=your-secret-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   **Frontend (.env)**

   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```

5. **Start the servers**

   **Backend**

   ```bash
   cd backend
   npm run dev
   ```

   **Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8080](http://localhost:8080)
   - API Docs: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

## 📁 How I organized my code

```
project-final-simon/
├── backend/                 # My Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # API endpoint handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── middleware/     # Auth & file upload middleware
│   │   ├── routes/         # API route definitions
│   │   └── server.ts       # Main server file
│   └── package.json
├── frontend/               # My React frontend
│   ├── src/
│   │   ├── sections/       # Different pages
│   │   ├── global-components/ # Reusable components
│   │   ├── store/          # Zustand state management
│   │   ├── themes/         # Styling and theming
│   │   └── utils/          # Helper functions
│   └── package.json
└── README.md
```

## 🔧 Commands I use

### Backend

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Frontend

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 features I'm proud of

### Video Player with Time-Coded Comments

- Interactive timeline you can click on
- Comments sync with video playback
- Volume controls and fullscreen
- Progress tracking and time formatting

### Comment System

- Nested comment threads (comments can have replies)
- Real-time updates
- Rich text formatting
- Like/unlike functionality

### Class and Project Management

- Create and organize educational content
- User role-based access control
- Bulk operations

## 🚧 What I'd do if I had more time

Honestly, this project could go in so many directions! If I had more time, I'd love to add:

- **Real-time collaboration** - WebSocket integration for live commenting
- **More user settings** - Make the create user more controlled so that not anyone can be a user.
- **Mobile app** - React Native

## 🤝 Want to contribute?

I'd love to see what other developers can add to this! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
