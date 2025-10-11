// Utility to format numbers as Indian Rupees consistently across the app
// Example: formatINR(1234.5) -> "₹1,234.50"
export function formatINR(value) {
  const number = Number(value);
  if (!isFinite(number)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}