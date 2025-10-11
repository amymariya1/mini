import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminListUsers } from "../services/api";
import "../styles/AdminDashboard.css";

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ClientsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AppointmentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const MessagesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ResourcesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="16" r="1" />
    <circle cx="16" cy="16" r="1" />
    <circle cx="8" cy="16" r="1" />
  </svg>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "clients", label: "Clients", icon: <ClientsIcon /> },
  { id: "appointments", label: "Appointments", icon: <AppointmentsIcon /> },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon /> },
  { id: "messages", label: "Messages", icon: <MessagesIcon /> },
  { id: "resources", label: "Resources", icon: <ResourcesIcon /> },
  { id: "reports", label: "Reports", icon: <ReportsIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ 
    totalClients: 0, 
    activeClients: 0, 
    upcomingAppointments: 3,
    resources: 12
  });

  // Load clients data
  async function loadClients() {
    setLoading(true);
    try {
      const data = await adminListUsers();
      // Filter to show only regular users (not admins or other therapists)
      const clientsData = (data.users || []).filter(user => user.userType === "user");
      setClients(clientsData);
      setStats(prev => ({
        ...prev,
        totalClients: clientsData.length,
        activeClients: clientsData.filter(u => u.isActive).length
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Initialize data
  useEffect(() => {
    if (tab === "clients" || tab === "dashboard") {
      loadClients();
    }
  }, [tab]);

  function handleLogout() {
    localStorage.removeItem("mm_user");
    navigate("/login");
  }

  const filteredClients = clients.filter(
    client => client.name?.toLowerCase().includes(search.toLowerCase()) || 
              client.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Sample appointments data
  const upcomingAppointments = [
    { id: 1, client: "Sarah Johnson", date: "2023-06-15", time: "10:00 AM", duration: "50 min" },
    { id: 2, client: "Michael Chen", date: "2023-06-15", time: "2:00 PM", duration: "50 min" },
    { id: 3, client: "Emma Williams", date: "2023-06-16", time: "11:00 AM", duration: "50 min" },
  ];

  // Sample calendar events
  const calendarEvents = [
    { id: 1, title: "Sarah Johnson", date: "2023-06-15", time: "10:00 AM", type: "appointment" },
    { id: 2, title: "Team Meeting", date: "2023-06-15", time: "1:00 PM", type: "meeting" },
    { id: 3, title: "Michael Chen", date: "2023-06-15", time: "2:00 PM", type: "appointment" },
    { id: 4, title: "Workshop Prep", date: "2023-06-16", time: "9:00 AM", type: "task" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>MindBridge</h2>
          <p>Therapist Panel</p>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button 
              key={item.id} 
              className={`nav-item ${tab === item.id ? "active" : ""}`} 
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button className="nav-item" onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </button>
        </nav>
      </div>

      <div className="main-content">
        <div className="admin-header">
          <div>
            <h2>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h2>
            <p>Welcome back, Therapist</p>
          </div>
          <div>
            <button className="cta-btn primary">New Appointment</button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div>
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Clients</div>
                <div className="stat-value">{stats.totalClients}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Clients</div>
                <div className="stat-value">{stats.activeClients}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Upcoming</div>
                <div className="stat-value">{stats.upcomingAppointments}</div>
                <div className="stat-label">Appointments</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Resources</div>
                <div className="stat-value">{stats.resources}</div>
                <div className="stat-label">Available</div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Upcoming Appointments</h3>
                <button className="cta-btn" onClick={() => setTab("appointments")}>View All</button>
              </div>
              <div>
                {upcomingAppointments.map(appt => (
                  <div key={appt.id} className="user-card" style={{ marginBottom: "0.5rem" }}>
                    <div>
                      <h4>{appt.client}</h4>
                      <p>{appt.date} at {appt.time} ({appt.duration})</p>
                    </div>
                    <div>
                      <button className="cta-btn secondary">Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Clients */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Recent Clients</h3>
                <button className="cta-btn" onClick={() => setTab("clients")}>View All</button>
              </div>
              <div>
                {loading ? (
                  <p>Loading clients...</p>
                ) : (
                  <div>
                    {clients.slice(0, 3).map(client => (
                      <div key={client._id} className="user-card" style={{ marginBottom: "0.5rem" }}>
                        <div>
                          <h4>{client.name}</h4>
                          <p>{client.email}</p>
                        </div>
                        <div>
                          <button className="cta-btn secondary">Message</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {tab === "clients" && (
          <div>
            <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
              <input 
                className="input" 
                placeholder="Search clients..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: "70%" }}
              />
              <button className="cta-btn primary">Add New Client</button>
            </div>
            
            {loading ? (
              <p>Loading clients...</p>
            ) : (
              <div>
                {filteredClients.map(client => (
                  <div key={client._id} className="user-card">
                    <div>
                      <h4>{client.name}</h4>
                      <p>{client.email}</p>
                      <p>Age: {client.age || "N/A"} | Status: 
                        <span className="user-status" style={{ 
                          backgroundColor: client.isActive ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)',
                          color: client.isActive ? '#48BB78' : '#F56565',
                          marginLeft: '5px'
                        }}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <button className="cta-btn" style={{ marginRight: "8px" }}>
                        View Profile
                      </button>
                      <button className="cta-btn secondary">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {tab === "appointments" && (
          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Upcoming Appointments</h3>
                <button className="cta-btn primary">Schedule New</button>
              </div>
              <div>
                {upcomingAppointments.map(appt => (
                  <div key={appt.id} className="user-card" style={{ marginBottom: "0.5rem" }}>
                    <div>
                      <h4>{appt.client}</h4>
                      <p>{appt.date} at {appt.time} ({appt.duration})</p>
                    </div>
                    <div>
                      <button className="cta-btn secondary" style={{ marginRight: "8px" }}>Reschedule</button>
                      <button className="cta-btn danger">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <h3>Past Appointments</h3>
              <div style={{ marginTop: "1rem" }}>
                <p>No past appointments to display.</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {tab === "calendar" && (
          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>June 2023</h3>
                <div>
                  <button className="cta-btn secondary" style={{ marginRight: "8px" }}>Previous</button>
                  <button className="cta-btn secondary">Next</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} style={{ fontWeight: "bold", padding: "8px 0" }}>{day}</div>
                ))}
                {/* Calendar days - simplified for example */}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <div 
                    key={day} 
                    className="user-card" 
                    style={{ 
                      minHeight: "80px", 
                      padding: "8px", 
                      textAlign: "left",
                      backgroundColor: day === 15 ? "rgba(108, 99, 255, 0.1)" : "white"
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{day}</div>
                    {calendarEvents.filter(event => 
                      event.date === `2023-06-${day < 10 ? '0' + day : day}`
                    ).map(event => (
                      <div 
                        key={event.id} 
                        style={{ 
                          fontSize: "0.8rem", 
                          backgroundColor: event.type === "appointment" ? "rgba(108, 99, 255, 0.2)" : 
                                          event.type === "meeting" ? "rgba(72, 187, 120, 0.2)" : 
                                          "rgba(245, 101, 101, 0.2)",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          marginTop: "4px",
                          cursor: "pointer"
                        }}
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {tab === "messages" && (
          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Messages</h3>
                <button className="cta-btn primary">New Message</button>
              </div>
              <div>
                <div className="user-card">
                  <div>
                    <h4>Sarah Johnson</h4>
                    <p>Hi, I wanted to discuss my progress...</p>
                  </div>
                  <div>
                    <button className="cta-btn">Reply</button>
                  </div>
                </div>
                <div className="user-card">
                  <div>
                    <h4>Michael Chen</h4>
                    <p>Thank you for the session yesterday...</p>
                  </div>
                  <div>
                    <button className="cta-btn">Reply</button>
                  </div>
                </div>
                <div className="user-card">
                  <div>
                    <h4>Emma Williams</h4>
                    <p>Can we reschedule our next appointment?</p>
                  </div>
                  <div>
                    <button className="cta-btn">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {tab === "resources" && (
          <div>
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3>Therapy Resources</h3>
                <button className="cta-btn primary">Upload Resource</button>
              </div>
              <div>
                <div className="user-card">
                  <div>
                    <h4>CBT Worksheets</h4>
                    <p>Cognitive Behavioral Therapy exercises</p>
                  </div>
                  <div>
                    <button className="cta-btn secondary">Download</button>
                  </div>
                </div>
                <div className="user-card">
                  <div>
                    <h4>Mindfulness Exercises</h4>
                    <p>Guided meditation and breathing techniques</p>
                  </div>
                  <div>
                    <button className="cta-btn secondary">Download</button>
                  </div>
                </div>
                <div className="user-card">
                  <div>
                    <h4>Progress Tracking Templates</h4>
                    <p>Templates for monitoring client progress</p>
                  </div>
                  <div>
                    <button className="cta-btn secondary">Download</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3>Client Resources</h3>
              <div style={{ marginTop: "1rem" }}>
                <ul>
                  <li>Self-Help Guides</li>
                  <li>Meditation Audio Files</li>
                  <li>Journaling Prompts</li>
                  <li>Recommended Reading List</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {tab === "reports" && (
          <div>
            <div className="card">
              <h3>Client Progress Reports</h3>
              <div style={{ marginTop: "1rem" }}>
                <p>Generate and view client progress reports.</p>
                <button className="cta-btn primary" style={{ marginTop: "1rem" }}>
                  Generate Report
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3>Session Analytics</h3>
              <div style={{ marginTop: "1rem" }}>
                <p>View analytics on your therapy sessions.</p>
                <button className="cta-btn primary" style={{ marginTop: "1rem" }}>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div>
            <div className="card">
              <h3>Profile Settings</h3>
              <div style={{ marginTop: "1rem" }}>
                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Full Name</div>
                  <input className="input" defaultValue="Dr. Jane Smith" />
                </label>
                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Email</div>
                  <input className="input" type="email" defaultValue="jane.smith@mindbridge.com" />
                </label>
                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>License Number</div>
                  <input className="input" defaultValue="LIC-123456" />
                </label>
                <label>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>Specialization</div>
                  <input className="input" defaultValue="Cognitive Behavioral Therapy" />
                </label>
                <button className="cta-btn primary">Save Changes</button>
              </div>
            </div>
            
            <div className="card">
              <h3>Notification Settings</h3>
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h4>Email Notifications</h4>
                    <p>Receive email notifications for appointments</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h4>SMS Notifications</h4>
                    <p>Receive SMS notifications for urgent messages</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}