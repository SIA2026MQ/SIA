import { useState, useEffect } from "react";
import { Check, X, Users, Calendar, Filter } from "lucide-react";
import { api } from "@/lib/api";

export function AdminRetreatsTab() {
  const [activeSubTab, setActiveSubTab] = useState<"create" | "applications">("applications");
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceInr, setPriceInr] = useState("");
  const [priceUsd, setPriceUsd] = useState("");

  // Data State
  const [applications, setApplications] = useState<any[]>([]);

  const loadApplications = async () => {
    try {
      const res = await api.getAllApplications();
      setApplications(res.applications || []);
    } catch (error) {
      console.error("Failed to load applications");
    }
  };

  useEffect(() => {
    if (activeSubTab === "applications") loadApplications();
  }, [activeSubTab]);

  const handleCreate = async () => {
    try {
      await api.createRetreat({
        title, description, location, 
        startDate, endDate, 
        priceInr: Number(priceInr), priceUsd: Number(priceUsd)
      });
      alert("Retreat Created Successfully!");
      // Clear Form
      setTitle(""); setDescription(""); setLocation(""); setStartDate(""); setEndDate(""); setPriceInr(""); setPriceUsd("");
      setActiveSubTab("applications");
    } catch (error: any) {
      alert(error.message || "Failed to create retreat");
    }
  };

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    const confirm = window.confirm(`Are you sure you want to ${status} this user? An email will be sent automatically.`);
    if (!confirm) return;

    try {
      await api.updateApplicationStatus(id, status);
      alert(`User ${status} successfully!`);
      loadApplications();
    } catch (error: any) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveSubTab("applications")} 
          className={`font-bold flex items-center gap-2 pb-2 ${activeSubTab === "applications" ? "text-[#600694] border-b-2 border-[#600694]" : "text-gray-500"}`}
        >
          <Users className="h-5 w-5" /> Manage Applications
        </button>
        <button 
          onClick={() => setActiveSubTab("create")} 
          className={`font-bold flex items-center gap-2 pb-2 ${activeSubTab === "create" ? "text-[#600694] border-b-2 border-[#600694]" : "text-gray-500"}`}
        >
          <Calendar className="h-5 w-5" /> Add New Retreat
        </button>
      </div>

      {activeSubTab === "create" && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4 max-w-2xl">
          <h3 className="text-lg font-bold text-[#600694] mb-4">Create New Retreat Event</h3>
          <input className="w-full p-3 border rounded-xl" placeholder="Retreat Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full p-3 border rounded-xl" placeholder="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          <input className="w-full p-3 border rounded-xl" placeholder="Location (e.g., Rishikesh, India)" value={location} onChange={e => setLocation(e.target.value)} />
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-gray-500">Start Date</label><input type="date" className="w-full p-3 border rounded-xl" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div><label className="text-xs font-bold text-gray-500">End Date</label><input type="date" className="w-full p-3 border rounded-xl" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            <input type="number" className="w-full p-3 border rounded-xl" placeholder="Price (INR)" value={priceInr} onChange={e => setPriceInr(e.target.value)} />
            <input type="number" className="w-full p-3 border rounded-xl" placeholder="Price (USD)" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} />
          </div>
          <button onClick={handleCreate} className="bg-[#600694] text-white px-6 py-3 rounded-full font-bold w-full hover:bg-[#4a0473]">Publish Retreat</button>
        </div>
      )}

      {activeSubTab === "applications" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700">All Retreat Applications ({applications.length})</h3>
            <button onClick={loadApplications} className="text-xs font-bold text-[#600694] hover:underline">Refresh Data</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="p-4">Applicant</th>
                <th className="p-4">Retreat</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{app.name}</p>
                    <p className="text-xs text-gray-500">{app.email} • {app.phone}</p>
                  </td>
                  <td className="p-4 font-semibold text-[#600694]">{app.retreat?.title}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      app.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {app.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleStatusUpdate(app.id, 'APPROVED')} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200" title="Approve"><Check className="h-5 w-5"/></button>
                        <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject"><X className="h-5 w-5"/></button>
                      </>
                    )}
                    {app.status === 'PAID' && <span className="text-sm font-bold text-green-600 flex items-center gap-1"><Check className="h-4 w-4"/> Paid</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}