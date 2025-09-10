
#  ReviewSphere — Store Rating Application (Fullstack Assignment)

A fullstack **React + Express + MySQL** application where users can sign up, log in, rate stores, and view insights.
Includes **role-based dashboards** for **Admin**, **Owner**, and **User**.

---

##  Features Implemented

###  Authentication & Security

* JWT-based login/logout
* Password validation: **8–16 chars**, at least **1 uppercase**, **1 special character**
* Change Password option for logged-in users

###  Roles & Dashboards

* **Admin**

  * Add Users (Admin/User/Owner)
  * Add Stores (assign to an Owner via dropdown)
  * View Dashboard stats (Users, Stores, Ratings)
  * Apply filters (Name, Email, Address, Role)
  * View user details with owned stores & ratings
* **Owner**

  * View **Owned Stores**
  * See **average rating per store**
  * View **list of raters & their ratings**
* **User**

  * Browse stores
  * Rate stores (1–5 stars)
  * View **own rating** and **store average rating**

###  Backend

* Built with **Express + Sequelize (MySQL)**
* Joi-based validations:

  * Signup
  * Add User
  * Add Store
  * Rating submission
* Seed script: `npm run seed` creates demo users & stores
* Secure role-based routes (`/admin/*`, `/owner/*`, `/user/*`)

### Frontend

* React + Vite
* Sidebar navigation for easy page switching
* Responsive CSS layout
* Store list with search & rating buttons
* Clean UI for dashboards

---

##  Quickstart

### 1. Prerequisites

* Node.js **18+**
* MySQL server running locally (or remote)
* npm

---

### 2. Backend Setup


cd server
cp .env.example .env
# update DB_USER / DB_PASS if needed
npm install


Create database:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS store_ratings;"

Seed demo data (admin, owner, user, stores):
npm run seed

Run backend:
npm run dev


Look for:
Server running on port 5001

---

### 3. Frontend Setup


cd client
npm install
npm run dev


Open [http://localhost:5173](http://localhost:5173) in browser.

---

##  Demo Accounts

 Role  | Email                                           | Password  | --------------------------------------------------------| --------- |
 Admin | [admin@example.com](mail:admin@example.com)     | Admin@123 |
 Owner | [ownerrah@gmail.com](mail:ownerrah@gmail.com)   | Owner@123 |
 User  | [user@gmail.com](mail:user@gmail.com)           | User@123  |

---

##  Demo Flow

1. **Login as Admin**

   * Create new Users/Stores
   * Assign stores to Owners
   * View stats and user details

2. **Login as User**

   * Rate stores
   * View my rating + avg rating

3. **Login as Owner**

   * See owned stores
   * Check average rating + list of raters

---

## 💡 Notes

* If backend runs on a different port → update `client/vite.config.js` proxy
* Stores created **without assigning an owner** won’t appear in the Owner dashboard
* Extendable: add **pagination, CSV export, charts, advanced filters**

