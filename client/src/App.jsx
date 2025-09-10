// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import api from './services/api.js';
import "./App.css";


export default function App() {


  const [stats, setStats] = useState(null);
  const [page, setPage] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [ownerStores, setOwnerStores] = useState([]);

  const [form, setForm] = useState({});
  const [login, setLogin] = useState({});
  const [search, setSearch] = useState('');
  const [showChangePW, setShowChangePW] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [owners, setOwners] = useState([]);   //  THIS 



  useEffect(() => {
    fetchStores();
  }, [token]);

  async function fetchStores(q = '') {
    try {
      const url = `/user/stores${q ? '?q=' + encodeURIComponent(q) : ''}`;
      const config = token ? { headers: { Authorization: 'Bearer ' + token } } : {};
      const res = await api.get(url, config);
      setStores(res.data || []);
    } catch (err) {
      console.error('fetchStores', err);
      setStores([]);

    }
  }
  //here
  useEffect(() => {
    if (page === 'admin' && role === 'admin') {
      fetchUsers(); // load all users immediately
      fetchOwners();
    }
  }, [page, role, token]);


  async function fetchUsers(query = '') {
    try {
      const url = `/admin/users${query ? '?' + query : ''}`;
      const res = await api.get(url, { headers: { Authorization: 'Bearer ' + token } });

      // Sort users: owner → admin → user
      const sortedUsers = res.data.sort((a, b) => {
        const roleOrder = { owner: 1, admin: 2, user: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
      });

      setUsers(sortedUsers); // set the sorted list to state
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  }
  async function fetchOwners() {
    try {
      const res = await api.get("/admin/owners", { headers: { Authorization: "Bearer " + token } });
      setOwners(res.data);
    } catch (err) {
      console.error("Error fetching owners", err);
      setOwners([]);
    }
  }

  useEffect(() => {
    if (page === 'admin' && role === 'admin') {
      fetchUsers(); // load all users immediately
    }
  }, [page, role, token]);



  async function handleSignup(e) {
    e.preventDefault();
    try {
      await api.post('/auth/signup', form);
      alert('Signed up - please login');
      setPage('login');
    } catch (err) {
      alert(err?.response?.data?.error || 'Error during signup');
    }
  }

  async function handleLogin(e) {
  e.preventDefault();
  try {
    const res = await api.post('/auth/login', login);

    // Save token and role
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('role', res.data.role);
    setToken(res.data.token);
    setRole(res.data.role);

    alert('Logged in as ' + res.data.role);

    // Fetch stores after login
    fetchStores(search);

    // 🔹 Redirect user based on role
    if (res.data.role === "admin") {
      setPage("admin");
    } else if (res.data.role === "owner") {
      setPage("owner");
    } else {
      setPage("home");
    }

  } catch (err) {
    alert(err?.response?.data?.error || 'Login failed');
  }
}


  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken('');
    setRole('');
    alert('Logged out');
    fetchStores(search);
  }

  async function submitRating(storeId, value) {
    try {
      await api.post(`/user/stores/${storeId}/rate`, { rating: value }, { headers: { Authorization: 'Bearer ' + token } });
      alert('Rating submitted');
      fetchStores(search);
    } catch (err) {
      alert(err?.response?.data?.error || 'Error submitting rating');
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    fetchStores(search);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    try {
      await api.post(
        "/auth/update-password",
        { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword },
        { headers: { Authorization: "Bearer " + token } }
      );
      alert("Password updated successfully!");
      setPwForm({ oldPassword: "", newPassword: "" });
      setPage("home"); // redirect back to Home after success
    } catch (err) {
      alert(err?.response?.data?.error || " Error updating password");
    }
  }


  return (

    <div className="app-container">

      <div className="sidebar">
        <h2> MENU</h2>
        <div className="menu">
          <button
            className={page === 'home' ? 'active' : ''}
            onClick={() => setPage('home')}
          >
            Home
          </button>
          <button
            className={page === 'signup' ? 'active' : ''}
            onClick={() => setPage('signup')}
          >
            Signup
          </button>
          <button
            className={page === 'login' ? 'active' : ''}
            onClick={() => setPage('login')}
          >
            Login
          </button>
          <button
            className={page === 'admin' ? 'active' : ''}
            onClick={() => setPage('admin')}
          >
            Admin
          </button>
          <button
            className={page === 'owner' ? 'active' : ''}
            onClick={() => setPage('owner')}
          >
            Owner
          </button>
        </div>


        {token ? (
          <>
            <button
              className={page === 'changePassword' ? 'active' : ''}
              onClick={() => setPage('changePassword')}
            >
              Change Password
            </button>

            <button
              className={page === 'logout' ? 'active' : ''}
              onClick={() => {
                setPage('logout');   // highlight logout button
                handleLogout();      // popup 
              }}
            >
              Logout
            </button>

          </>
        ) : null}

      </div>



      {/* Main content wrapper */}
      <div className="main-content">

        <h2 className="main-heading">Review SPHERE ⭐ - An store rating application</h2><hr></hr>


        {/* Signup */}
        {page === "signup" && (

          <form onSubmit={handleSignup} style={{ marginTop: 16, maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>Name:</label>
              <input
                type="text"
                placeholder="20-60 chars"
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>Email:</label>
              <input
                type="email"
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>Address:</label>
              <input
                type="text"
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>Password:</label>
              <input
                type="password"
                required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <button type="submit" style={{ marginTop: "10px" }}>Signup</button>
          </form>
        )}


        {/* Login */}
        {page === "login" && (
          <form onSubmit={handleLogin} style={{ marginTop: 16, maxWidth: "400px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>Email:</label>
              <input
                type="email"
                required
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>Password:</label>
              <input
                type="password"
                required
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <button type="submit" style={{ marginTop: "10px" }}>Login</button>
          </form>
        )}



        {/* Change password */}
        {page === "changePassword" && token && (
          <form
            onSubmit={handleChangePassword}
            style={{ marginTop: 16, maxWidth: "400px" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>
                Previous Password:
              </label>
              <input
                type="password"
                placeholder="Enter current password"
                required
                value={pwForm.oldPassword}
                onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
              <label style={{ width: "150px", marginRight: "10px" }}>
                New Password:
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                required
                value={pwForm.newPassword}
                onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                style={{ flex: 1, padding: "6px" }}
              />
            </div>

            <button type="submit" style={{ marginTop: "10px" }}>
              Update Password
            </button>
          </form>
        )}


        {/* Search */}
        {["home", "admin", "owner"].includes(page) && (
          <>
            {/* 🔍 Search Bar */}
            <div className="search-bar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // handle search logic
                }}
              >
                <input
                  type="text"
                  placeholder="Search stores with name or address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    height: "35px",
                    padding: "0 10px",     // adds space inside input
                    fontSize: "16px",      // makes text bigger
                    borderRadius: "5px",
                    
                  
                  }}

                />
                <button type="submit">Search</button>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{ marginLeft: "8px" }}
                >
                  Clear
                </button>
              </form>
            </div>

            {/* Store List */}
            <h3>Stores List :</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {stores
                .filter(
                  (s) =>
                    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.address.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((s) => (
                  <li
                    key={s.id}
                    style={{
                      border: "1px solid #ddd",
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>{s.name}</strong>
                        <br />
                        <small>{s.address}</small>
                      </div>
                      <div>Avg: {s.rating}</div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <div>Your rating: {s.myRating ?? "None"}</div>
                      <div style={{ marginTop: 6 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => {
                              if (!token) {
                                const isNew = window.confirm(
                                  "Are you a new user? Click OK to Signup, Cancel to Login."
                                );
                                if (isNew) {
                                  setPage("signup");
                                } else {
                                  setPage("login");
                                }
                              } else {
                                submitRating(s.id, n);
                              }
                            }}
                            style={{ marginRight: 6 }}
                          >
                            {n} ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </>
        )}



        {/* Admin Dashboard */}

        {page === "admin" && role === "admin" && (
          <div style={{ marginTop: 20 }}>
            <hr></hr> <h2>Admin Dashboard</h2><hr></hr>

            {/* Load dashboard stats */}
            <button className="admin-load-btn" onClick={async () => {
              try {
                const res = await api.get("/admin/dashboard", { headers: { Authorization: "Bearer " + token } });
                setStats(res.data);
              } catch (err) {
                alert("Error loading stats");
              }
            }}>Load Dashboard</button>

            {/* Show stats in cards */}
            {stats && (
              <div className="admin-stats-container">
                <div className="admin-card users">
                  <h3>Total Users</h3>
                  <div className="stat-number">{stats.userCount}</div>
                </div>

                <div className="admin-card stores">
                  <h3>Total Stores</h3>
                  <div className="stat-number">{stats.storeCount}</div>
                </div>

                <div className="admin-card ratings">
                  <h3>Total Ratings</h3>
                  <div className="stat-number">{stats.ratingCount}</div>
                </div>
              </div>
            )}



            <hr></hr> <h2>Add Store</h2><hr></hr>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await api.post(
                    "/admin/stores",
                    { name: form.name, address: form.address, ownerId: form.ownerId },
                    { headers: { Authorization: "Bearer " + token } }
                  );
                  alert("Store added successfully!");
                  setForm({ name: "", address: "", ownerId: "" });
                  fetchStores();
                } catch (err) {
                  alert("Error adding store: " + (err.response?.data?.error || err.message));
                }
              }}
              style={{ maxWidth: "500px", marginTop: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Store Name:</label>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Address:</label>
                <input
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Owner:</label>
                <select
                  value={form.ownerId || ""}
                  onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                  required
                >
                  <option value="">Select Owner</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" style={{ marginTop: "10px" }}>Add Store</button>
            </form>




            <hr></hr> <h2>Add User</h2><hr></hr>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.post(
                  "/admin/users",
                  {
                    name: form.uname,
                    email: form.uemail,
                    password: form.upassword,
                    address: form.uaddress,
                    role: form.urole,
                  },
                  { headers: { Authorization: "Bearer " + token } }
                );
                alert("User added");
              }}
              style={{ maxWidth: "500px", marginTop: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Name:</label>
                <input
                  onChange={(e) => setForm({ ...form, uname: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Email:</label>
                <input
                  type="email"
                  onChange={(e) => setForm({ ...form, uemail: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Password:</label>
                <input
                  type="password"
                  onChange={(e) => setForm({ ...form, upassword: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Address:</label>
                <input
                  onChange={(e) => setForm({ ...form, uaddress: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <label style={{ width: "150px", marginRight: "10px" }}>Role:</label>
                <select
                  onChange={(e) => setForm({ ...form, urole: e.target.value })}
                  style={{ flex: 1, padding: "6px" }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" style={{ marginTop: "10px" }}>Add User</button>
            </form>


            {/* All Users Section */}
            <hr></hr> <h2>All Users</h2><hr></hr>
            <form
              onSubmit={async e => {
                e.preventDefault();
                const query = Object.entries(userFilters)
                  .filter(([k, v]) => v)
                  .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
                  .join("&");
                fetchUsers(query); // fetch filtered users
              }}
            >

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  placeholder="Filter by Name"
                  onChange={e => setUserFilters({ ...userFilters, name: e.target.value })}
                />
                <input
                  placeholder="Filter by Email"
                  onChange={e => setUserFilters({ ...userFilters, email: e.target.value })}
                />
                <input
                  placeholder="Filter by Address"
                  onChange={e => setUserFilters({ ...userFilters, address: e.target.value })}
                />
                <select
                  style={{ marginRight: '10px' }}
                  onChange={e => setUserFilters({ ...userFilters, role: e.target.value })}>
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                <button type="submit">Apply Filters</button>
                <button type="button" onClick={() => {
                  setUserFilters({ name: "", email: "", address: "", role: "" });
                  fetchUsers();
                }}>
                  Clear Filters
                </button>
                </div>


            </form>
            <h4>All Users</h4>
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.address}</td>
                    <td>{u.role}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={async () => {
                        const res = await api.get(`/admin/users/${u.id}`, { headers: { Authorization: "Bearer " + token } });
                        setSelectedUser(res.data);
                        setTimeout(() => {
                          document.getElementById("user-details-section")?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>




            {/* Selected User Details */}
            {selectedUser && (
              <div id="user-details-section" style={{ border: "1px solid #ccc", padding: 10, marginTop: 10 }}>
                <h5>User Details</h5>
                <p><b>Name:</b> {selectedUser.name}</p>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>Address:</b> {selectedUser.address}</p>
                <p><b>Role:</b> {selectedUser.role}</p>

                {selectedUser.role === "owner" && (
                  <div>
                    <h6>Owned Stores</h6>
                    <ul>
                      {selectedUser.stores.map(s => (
                        <li key={s.id}>{s.name} ({s.address}) — Avg Rating: {s.avgRating}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={() => setSelectedUser(null)}>Close</button>
              </div>
            )}







          </div>



        )}



        {/*owner page*/}

        {page === "owner" && role === "owner" && (
          <div style={{ marginTop: 40 }}>
            <hr></hr> <h1>Owner Dashboard</h1><hr></hr>
            <button
              style={{ marginRight: "10px" }}
              onClick={async () => {

                console.log("Token:", token);
                console.log("Role:", role);
                try {
                  const res = await api.get("/owner/dashboard", {
                    headers: { Authorization: "Bearer " + token }
                  });
                  setOwnerStores(res.data || []);
                } catch (err) {
                  console.error("Owner dashboard error:", err.response?.data || err);
                  alert("Error loading owner dashboard: " + (err.response?.data?.error || err.message));
                }
              }}
            >
              Load Dashboard
            </button>


            <button
              style={{
                margin: "10px 0",
                padding: "8px 14px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
              onClick={async () => {
                try {
                  const res = await api.get("/owner/dashboard", {
                    headers: { Authorization: "Bearer " + token }
                  });
                  setOwnerStores(res.data || []);
                } catch (err) {
                  console.error("Owner dashboard error:", err.response?.data || err);
                  alert("Error loading owner dashboard: " + (err.response?.data?.error || err.message));
                }
              }}
            >
              Refresh Dashboard
            </button>

            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: "20px" }}>
              {ownerStores?.length ? (
                ownerStores.map(store => (
                  <div
                    key={store.id}
                    style={{
                      flex: "1 1 300px",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "16px",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      background: "#fff"
                    }}
                  >
                    {/* Store Info */}
                    <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                      {store.name}
                    </h3>
                    <p style={{ margin: "0 0 8px 0", color: "#555" }}>{store.address}</p>
                    <p style={{ fontWeight: "bold", color: "#8b4b06ff" }}>
                      Average Rating: {store.avgRating ?? "No ratings yet"}
                    </p>

                    {/* Raters */}
                    <h4 style={{ margin: "10px 0 6px 0" }}>👥 Raters</h4>
                    <ul style={{ paddingLeft: 18 }}>
                      {store.raters?.length ? (
                        store.raters.map((r, i) => (
                          <li key={i}>
                            {r.userName}:{" "}
                            <span
                              style={{
                                color: r.rating >= 4 ? "green" :
                                  r.rating === 3 ? "orange" : "red",
                                fontWeight: "bold"
                              }}
                            >
                              {r.rating}⭐
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>No ratings yet</li>
                      )}
                    </ul>
                  </div>
                ))
              ) : (
                <p></p>
              )}
            </div>





          </div>
        )}
      </div>
    </div>
  );
}


