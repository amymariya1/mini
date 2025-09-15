import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { login as apiLogin } from "../services/api";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup, onAuthStateChanged, getIdTokenResult } from "firebase/auth";

export default function Login() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);

	function handleChange(e) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		if (!form.email || !form.password) {
			setError("Please fill in all fields.");
			return;
		}
		try {
			setLoading(true);
			const { user } = await apiLogin(form); // API returns { user: { ... } }
			const sessionUser = { ...user, authSource: "api" };
			localStorage.setItem("mm_user", JSON.stringify(sessionUser));
			// Navigate based on age
			if (typeof user?.age === "number" && user.age < 18) {
				navigate("/home-teen");
			} else {
				navigate("/home");
			}
		} catch (err) {
			setError(err.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	async function handleGoogleSignIn() {
		setError("");
		setGoogleLoading(true);
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const fbUser = result.user; // Firebase user

			// Try to read custom claims if you configured them in Firebase (optional)
			let age = undefined;
			try {
				const tokenResult = await getIdTokenResult(fbUser, true);
				// Example: if you add a custom claim "age" to the user
				if (tokenResult?.claims && typeof tokenResult.claims.age === "number") {
					age = tokenResult.claims.age;
				}
			} catch (_) {}

			const user = {
				id: fbUser.uid,
				name: fbUser.displayName || "",
				email: fbUser.email || "",
				age: age,
				photoURL: fbUser.photoURL || undefined,
				authSource: "firebase",
			};

			localStorage.setItem("mm_user", JSON.stringify(user));

			// Route by age if available; default to adult home
			if (typeof user.age === "number" && user.age < 18) {
				navigate("/home-teen");
			} else {
				navigate("/home");
			}
		} catch (err) {
			// Firebase auth error codes are in err.code; show readable message
			setError(err.message || "Google sign-in failed");
		} finally {
			setGoogleLoading(false);
		}
	}

	// Removed auto-redirect to avoid bypassing the login page
	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			if (u) {
				// Optionally cache user for navbar display only, do not navigate here
				const cached = localStorage.getItem("mm_user");
				if (!cached) {
					const user = {
						id: u.uid,
						name: u.displayName || "",
						email: u.email || "",
						age: undefined,
						photoURL: u.photoURL || undefined,
					};
					localStorage.setItem("mm_user", JSON.stringify(user));
				}
			}
		});
		return () => unsub();
	}, []);

	return (
		<div className="landing-container">
			<Navbar />
			<section className="auth-wrap">
				{/* Visual side */}
				<motion.div
					className="auth-visual"
					initial={{ opacity: 0, x: -12 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.45 }}
				>
					<div className="auth-visual-frame">
						<div className="stack">
							<div className="card-base card-main">
								<div>
									<div className="logo-mark">
										<div className="logo-dot" />
										<div className="logo-heart" />
									</div>
									<h3>HEALTHCARE</h3>
									<p>All your healthcare need on your finger tips</p>
								</div>
							</div>
							<div className="card-base card-bg" />
							<div className="card-base card-sheet">
								<div className="sheet-header">
									<div className="sheet-logo" />
									<div>
										<div className="sheet-title">Welcome User</div>
										<div className="sheet-sub">Sign in to continue</div>
									</div>
								</div>
								<div className="sheet-field" />
								<div className="sheet-field" />
								<div className="sheet-cta" />
							</div>
						</div>
					</div>
					<div className="auth-visual-glow" />
				</motion.div>

				{/* Auth card */}
				<motion.div
					className="auth-card"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.05 }}
				>
					<h2 className="auth-title">Welcome back</h2>
					<p className="auth-sub">Sign in to continue your journey</p>

					{error && (
						<div style={{
							background: "#fee2e2",
							color: "#991b1b",
							padding: "10px 12px",
							borderRadius: 10,
							marginBottom: 12,
							border: "1px solid #fecaca"
						}}>{error}</div>
					)}

					<form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
						<label>
							<div style={{ fontSize: 14, marginBottom: 6 }}>Email</div>
							<input
								type="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="you@example.com"
								className="input"
							/>
						</label>

						<label>
							<div style={{ fontSize: 14, marginBottom: 6 }}>Password</div>
							<input
								type="password"
								name="password"
								value={form.password}
								onChange={handleChange}
								placeholder="••••••••"
								className="input"
							/>
						</label>

						<button disabled={loading} type="submit" className="cta-btn" style={{ width: "100%", marginTop: 6 }}>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</form>

					<div className="divider" />

					<button
						type="button"
						disabled={googleLoading}
						onClick={handleGoogleSignIn}
						className="oauth-btn"
						style={{ width: "100%" }}
					>
						{googleLoading ? (
							"Connecting to Google..."
						) : (
							<>
								<svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
									<path fill="#FFC107" d="M43.611 20.083h-1.611V20H24v8h11.303c-1.648 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.643 6.053 29.047 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
									<path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C33.643 6.053 29.047 4 24 4c-7.798 0-14.426 4.417-17.694 10.691z"/>
									<path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.977 13.409-5.197l-6.2-5.238C29.136 35.091 26.715 36 24 36c-5.202 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.424 39.556 16.162 44 24 44z"/>
									<path fill="#1976D2" d="M43.611 20.083h-1.611V20H24v8h11.303a12.01 12.01 0 01-4.094 5.565l6.2 5.238C39.202 40.2 44 32 44 24c0-1.341-.138-2.651-.389-3.917z"/>
								</svg>
								<span>Continue with Google</span>
							</>
						)}
					</button>

					<div style={{ marginTop: 14, fontSize: 14, textAlign: "center" }}>
						Don’t have an account? <Link to="/signup">Create one</Link>
					</div>
				</motion.div>
			</section>
		</div>
	);
}