import { useState, useEffect } from "react";
import { Check, X, Users, Calendar, Trash2, UploadCloud, Pencil, AlertTriangle, Loader2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

export function RetreatsTab() {
  const [activeSubTab, setActiveSubTab] = useState<"create" | "applications">("applications");
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceInr, setPriceInr] = useState("");
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Data State
  const [applications, setApplications] = useState<any[]>([]);
  const [retreats, setRetreats] = useState<any[]>([]);

  // Modal States
  const [retreatToDelete, setRetreatToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for viewing full application details
  const [viewingApplication, setViewingApplication] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const appRes = await api.getAllApplications();
      setApplications(appRes.applications || []);
      
      const retreatRes = await api.getRetreats();
      setRetreats(retreatRes.retreats || []);
    } catch (error) {
      console.error("Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const resetForm = () => {
    setEditingId(null);
    setTitle(""); setDescription(""); setLocation(""); setStartDate(""); setEndDate(""); setPriceInr(""); setImageFile(null);
  };

  const handleEditClick = (retreat: any) => {
    setEditingId(retreat.id);
    setTitle(retreat.title);
    setDescription(retreat.description);
    setLocation(retreat.location);
    setStartDate(new Date(retreat.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(retreat.endDate).toISOString().split('T')[0]);
    setPriceInr(retreat.priceInr.toString());
    setImageFile(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const uploadRes = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          imageUrl = uploadData.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const payload: any = {
        title, description, location, 
        startDate, endDate, 
        priceInr: Number(priceInr),
      };
      if (imageUrl) payload.imageUrl = imageUrl;

      if (editingId) {
        await api.updateRetreat(editingId, payload); 
        alert("Retreat Updated Successfully!");
      } else {
        await api.createRetreat(payload);
        alert("Retreat Created Successfully!");
      }
      
      resetForm();
      loadData(); 
      setActiveSubTab("applications");
    } catch (error: any) {
      alert(error.message || "Failed to save retreat");
    } finally {
      setIsUploading(false);
    }
  };

  const openDeleteModal = (retreat: any) => {
    setRetreatToDelete(retreat);
  };

  const handleConfirmDelete = async () => {
    if (!retreatToDelete) return;
    setIsDeleting(true);

    try {
      await api.deleteRetreat(retreatToDelete.id);
      alert("Retreat and all related applications deleted successfully.");
      loadData(); 
      setRetreatToDelete(null);
    } catch (error: any) {
      alert("Failed to delete retreat.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    const confirm = window.confirm(`Are you sure you want to ${status} this user? An email will be sent automatically.`);
    if (!confirm) return;

    try {
      await api.updateApplicationStatus(id, status);
      alert(`User ${status} successfully!`);
      loadData();
      
      // Update viewing modal state if it's currently open
      if (viewingApplication && viewingApplication.id === id) {
        setViewingApplication({ ...viewingApplication, status });
      }
    } catch (error: any) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button onClick={() => setActiveSubTab("applications")} className={`font-bold flex items-center gap-2 pb-2 transition-colors ${activeSubTab === "applications" ? "text-[#600694] border-b-2 border-[#600694]" : "text-gray-500 hover:text-gray-700"}`}>
          <Users className="h-5 w-5" /> Manage Applications
        </button>
        <button onClick={() => { setActiveSubTab("create"); resetForm(); }} className={`font-bold flex items-center gap-2 pb-2 transition-colors ${activeSubTab === "create" ? "text-[#600694] border-b-2 border-[#600694]" : "text-gray-500 hover:text-gray-700"}`}>
          <Calendar className="h-5 w-5" /> Retreats & Events
        </button>
      </div>

      {activeSubTab === "create" && (
        <div className="space-y-8 max-w-2xl">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4 relative">
            {editingId && (
              <span className="absolute top-6 right-8 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Editing Mode</span>
            )}
            <h3 className="text-lg font-bold text-[#600694] mb-4">
              {editingId ? "Update Retreat Details" : "Create New Retreat Event"}
            </h3>
            
            <input className="w-full p-3 border rounded-xl focus:border-[#600694] outline-none" placeholder="Retreat Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full p-3 border rounded-xl focus:border-[#600694] outline-none" placeholder="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            <input className="w-full p-3 border rounded-xl focus:border-[#600694] outline-none" placeholder="Location (e.g., Rishikesh, India)" value={location} onChange={e => setLocation(e.target.value)} />
            
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs font-bold text-gray-500">Start Date</label><input type="date" className="w-full p-3 border rounded-xl focus:border-[#600694] outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-gray-500">End Date</label><input type="date" className="w-full p-3 border rounded-xl focus:border-[#600694] outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-gray-500">Price (INR)</label><input type="number" className="w-full p-3 border rounded-xl focus:border-[#600694] outline-none" placeholder="₹" value={priceInr} onChange={e => setPriceInr(e.target.value)} /></div>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud className="h-8 w-8 text-[#600694] mb-2" />
                <span className="text-sm font-bold text-gray-700">
                  {imageFile ? imageFile.name : editingId ? "Upload NEW Image (Optional)" : "Upload Cover Image"}
                </span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="flex gap-4 pt-2">
              {editingId && (
                <button onClick={resetForm} disabled={isUploading} className="w-full text-gray-600 bg-gray-100 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                  Cancel Edit
                </button>
              )}
              <button onClick={handleSubmit} disabled={isUploading} className={`w-full text-white px-6 py-3 rounded-full font-bold transition-colors flex items-center justify-center gap-2 ${isUploading ? 'bg-gray-400' : 'bg-[#600694] hover:bg-[#4a0473]'}`}>
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isUploading ? "Saving..." : editingId ? "Update Retreat" : "Publish Retreat"}
              </button>
            </div>
          </div>

          {retreats.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-gray-500 ml-2">Active Retreats</p>
              {retreats.map(retreat => (
                <div key={retreat.id} className={`flex items-center justify-between bg-white p-4 rounded-2xl border shadow-sm transition-all ${editingId === retreat.id ? 'border-[#600694] bg-[#600694]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-4">
                    {retreat.imageUrl && <img src={retreat.imageUrl} alt="cover" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />}
                    <div>
                      <h4 className="font-bold text-gray-900">{retreat.title}</h4>
                      <p className="text-xs text-gray-500">{new Date(retreat.startDate).toLocaleDateString()} • {retreat.location} • ₹{retreat.priceInr}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(retreat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit Retreat">
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button onClick={() => openDeleteModal(retreat)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete Retreat">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "applications" && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700">All Retreat Applications ({applications.length})</h3>
            <button onClick={loadData} className="text-xs font-bold text-[#600694] hover:underline">Refresh Data</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-bold">Applicant</th>
                  <th className="p-4 font-bold">Retreat</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No applications yet.</td></tr>
                )}
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{app.name}</p>
                      <p className="text-xs text-gray-500">{app.user?.email} • {app.phone}</p>
                    </td>
                    <td className="p-4 font-semibold text-[#600694]">{app.retreat?.title}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        app.status === 'APPROVED' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        app.status === 'PAID' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => setViewingApplication(app)} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" title="View Full Details"><Eye className="h-5 w-5"/></button>
                      
                      {app.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleStatusUpdate(app.id, 'APPROVED')} className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" title="Approve"><Check className="h-5 w-5"/></button>
                          <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title="Reject"><X className="h-5 w-5"/></button>
                        </>
                      )}
                      {app.status === 'PAID' && <span className="text-sm font-bold text-green-600 flex items-center gap-1"><Check className="h-4 w-4"/> Paid</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 🚨 FULL APPLICATION DETAILS MODAL           */}
      {/* ========================================= */}
      <AnimatePresence>
        {viewingApplication && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setViewingApplication(null)} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <h2 className="text-2xl font-bold text-[#600694] mb-1 border-b border-gray-100 pb-4">Application Details</h2>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Retreat</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.retreat?.title}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.status}</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Applicant Name</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Age</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.age || "N/A"}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Email</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.email}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">WhatsApp</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.phone || "N/A"}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Full Address</p>
                  <p className="font-semibold text-gray-900">
                    {viewingApplication.address 
                      ? `${viewingApplication.address}, ${viewingApplication.city}, ${viewingApplication.state} - ${viewingApplication.zip}, ${viewingApplication.country}`
                      : "N/A"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">SiA Member?</p>
                  <p className="font-semibold text-gray-900">{viewingApplication.isMember || "N/A"}</p>
                </div>

                <div className="col-span-2 bg-gray-50 p-4 rounded-xl mt-2 border border-gray-100">
                  <p className="text-xs font-bold text-[#600694] uppercase tracking-wider mb-1">Current Spiritual Practice</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingApplication.spiritualPractice || "None provided"}</p>
                </div>

                <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-[#600694] uppercase tracking-wider mb-1">Familiarity with SiA</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingApplication.familiarity || "None provided"}</p>
                </div>

                <div className="col-span-2 text-right mt-2 border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-400">
                    Submitted on: {new Date(viewingApplication.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {viewingApplication.status === 'PENDING' && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-100">
                  <button onClick={() => handleStatusUpdate(viewingApplication.id, 'APPROVED')} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                    Approve Application
                  </button>
                  <button onClick={() => handleStatusUpdate(viewingApplication.id, 'REJECTED')} className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-colors">
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================= */}
      {/* 🚨 RETREAT DELETE CONFIRMATION MODAL        */}
      {/* ========================================= */}
      <AnimatePresence>
        {retreatToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white p-8 rounded-3xl max-w-sm w-full relative shadow-2xl border-t-8 border-red-500"
            >
              <button onClick={() => setRetreatToDelete(null)} className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Retreat?</h3>
              <p className="text-center text-sm text-gray-500 mb-8">
                Are you sure you want to permanently delete <span className="font-bold text-red-600">{retreatToDelete.title}</span>? 
                <br/><br/>
                <span className="bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 font-semibold block">
                  This will also wipe out ALL user applications linked to this event.
                </span>
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:bg-red-400 flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                >
                  {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                  {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                </button>
                <button 
                  onClick={() => setRetreatToDelete(null)}
                  disabled={isDeleting}
                  className="w-full py-4 bg-white text-gray-700 rounded-xl font-bold hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}