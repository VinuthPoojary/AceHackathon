import { useState } from "react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [userType, setUserType] = useState("patient");
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold text-blue-600 mb-2"
      >
        {userType === "patient" ? "Patient Portal" : "Staff Dashboard"}
      </motion.h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        {userType === "patient"
          ? "Access your appointments, queue status, and medical records securely."
          : "Login to manage patient queues, monitor performance, and update schedules."}
      </p>

      {/* Tabs */}
      <div className="w-full max-w-md">
        <div className="grid grid-cols-2 mb-4 border rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("login")}
            className={`p-2 w-full ${activeTab === "login" ? "bg-blue-100" : "bg-white"}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`p-2 w-full ${activeTab === "register" ? "bg-blue-100" : "bg-white"}`}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === "login" && (
          <div className="bg-white shadow-md border rounded-lg p-6 space-y-4">
            <input placeholder="Email" type="email" className="w-full p-2 border rounded-md border-blue-200" />
            <input placeholder="Password" type="password" className="w-full p-2 border rounded-md border-blue-200" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Login</button>
          </div>
        )}

        {/* REGISTER FORM */}
        {activeTab === "register" && (
          <div className="bg-white shadow-md border rounded-lg p-6 space-y-4">
            <input placeholder="Full Name" className="w-full p-2 border rounded-md border-blue-200" />
            <input placeholder="Email" type="email" className="w-full p-2 border rounded-md border-blue-200" />
            <input placeholder="Password" type="password" className="w-full p-2 border rounded-md border-blue-200" />
            {userType === "staff" && (
              <input placeholder="Staff ID" className="w-full p-2 border rounded-md border-blue-200" />
            )}
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
              Register
            </button>
          </div>
        )}
      </div>

      {/* Switch user type */}
      <div className="flex mt-6 space-x-4">
        <button
          className={`px-4 py-2 rounded-lg ${userType === "patient" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setUserType("patient")}
        >
          Patient Login
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${userType === "staff" ? "bg-cyan-500 text-white" : "bg-gray-200"}`}
          onClick={() => setUserType("staff")}
        >
          Staff Login
        </button>
      </div>
    </div>
  );
}
