# MVP A-Level Economics (Next.js + MongoDB)

Built with **Next.js 15 App Router**, **NextAuth.js**, **MongoDB (Mongoose)**, and **Tailwind CSS**.

---

## 🚀 Features

- **Quiz System**
  - Multiple-choice questions
  - End-of-session automated scoring
  - An adaptive engine that serves harder questions as students improve
  - A student dashboard showing level, score trends, and weak areas

- **Authentication**
  - Secure login system using **NextAuth.js**  

- **Database**
  - MongoDB with Mongoose for persistence  

---

## 🛠️ Tech Stack

- [Next.js 15+ (App Router)](https://nextjs.org/)  
- [NextAuth.js](https://next-auth.js.org/)  
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)  
- [Tailwind CSS](https://tailwindcss.com/)  

---

## ⚡ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/vikashmishra1234/MVP_A_Level.git
cd MVP_A_Level
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Run the development server
```bash
npm run dev
```
### 3️⃣ Configure environment variables
```bash
Create a .env.local file in the root directory and add:

MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
