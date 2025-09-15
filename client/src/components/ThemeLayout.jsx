import { motion } from "framer-motion";

export default function ThemeLayout({ children }) {
	return (
		<div className="theme-shell">
			{/* Background accents */}
			<div className="bg-accent bg-accent-1" />
			<div className="bg-accent bg-accent-2" />
			<div className="bg-grid" />

			<motion.main
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.35 }}
				className="theme-content"
			>
				{children}
			</motion.main>
		</div>
	);
}

