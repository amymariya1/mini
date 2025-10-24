import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

export default function Patients() {
  const navigate = useNavigate();
  const { isDarkMode, colors } = useTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call to fetch patients
      // For now, we'll use mock data
      const mockPatients = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+1 234 567 8900",
          lastAppointment: "2025-10-15",
          nextAppointment: "2025-10-25",
          status: "Active"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "+1 345 678 9012",
          lastAppointment: "2025-10-10",
          nextAppointment: "2025-10-30",
          status: "Active"
        },
        {
          id: 3,
          name: "Robert Johnson",
          email: "robert.j@example.com",
          phone: "+1 456 789 0123",
          lastAppointment: "2025-09-28",
          nextAppointment: null,
          status: "Inactive"
        }
      ];
      setPatients(mockPatients);
    } catch (err) {
      setError("Failed to fetch patients");
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patientId) => {
    // Navigate to patient details page
    navigate(`/patient/${patientId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Patients List</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage your patients
        </p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Appointment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Next Appointment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {patient.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{patient.email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {patient.lastAppointment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {patient.nextAppointment || "No upcoming appointment"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.status === "Active" 
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePatientClick(patient.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}