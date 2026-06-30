import * as XLSX from 'xlsx';
import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Award, Edit2, Search, ShieldBan, ShieldCheck, Download } from "lucide-react";
import { api } from "@/lib/api";

export function UserLevelTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Editing & Blocking State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<number>(1);
  const [savingLevel, setSavingLevel] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  const fetchUsers = async (pageNumber: number, search: string) => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers(pageNumber, search);
      if (res.users) {
        setUsers(res.users);
        setTotalPages(res.pagination.totalPages);
        setTotalUsers(res.pagination.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); 
      fetchUsers(1, searchTerm);
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Regular Pagination Effect
  useEffect(() => {
    fetchUsers(page, searchTerm);
  }, [page]);

  const handleSaveLevel = async (userId: string) => {
    setSavingLevel(userId);
    try {
      await api.updateUserLevel(userId, editLevel);
      setUsers(users.map(u => u.id === userId ? { ...u, level: editLevel } : u));
      setEditingId(null);
    } catch (error) {
      alert("Failed to update level.");
    } finally {
      setSavingLevel(null);
    }
  };

  const handleToggleBlock = async (userId: string, currentBlockedStatus: boolean) => {
    const action = currentBlockedStatus ? "UNBLOCK" : "BLOCK";
    if (!window.confirm(`Are you sure you want to ${action} this user? ${!currentBlockedStatus ? 'They will lose access to all content.' : 'They will regain access.'}`)) return;
    
    setBlockingId(userId);
    try {
      await api.toggleUserBlock(userId, !currentBlockedStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !currentBlockedStatus } : u));
    } catch (error) {
      alert("Failed to update block status.");
    } finally {
      setBlockingId(null);
    }
  };

  // 🚨 NEW: CSV Generator Function
  const handleDownloadReport = (user: any) => {
  // 1. Build the data array row by row
  const reportData: any[][] = [];

  // --- USER PROFILE ---
  reportData.push(["USER PROFILE", ""]);
  reportData.push(["Name", user.name]);
  reportData.push(["Email", user.email]);
  reportData.push(["Level", user.level]);
  reportData.push(["Status", user.isBlocked ? 'Blocked' : 'Active']);
  reportData.push(["Joined Date", new Date(user.createdAt).toLocaleDateString()]);
  reportData.push([]); // Empty row for spacing

  // --- SUBSCRIPTION ---
  reportData.push(["SUBSCRIPTION", ""]);
  if (user.subscription?.isActive) {
    reportData.push(["Plan", user.subscription.plan.name]);
    reportData.push(["Remaining Webinar Credits", user.subscription.remainingCredits]);
    reportData.push(["Expiry Date", new Date(user.subscription.expiryDate).toLocaleDateString()]);
  } else {
    reportData.push(["Status", "No Active Subscription"]);
  }
  reportData.push([]);

  // --- DAILY SESSIONS ---
  reportData.push(["DAILY SESSION ATTENDANCE HISTORY", ""]);
  reportData.push(["Date", "Time Joined"]);
  if (user.attendances && user.attendances.length > 0) {
    user.attendances.forEach((a: any) => {
      reportData.push([
        new Date(a.joinedAt).toLocaleDateString(), 
        new Date(a.joinedAt).toLocaleTimeString()
      ]);
    });
  } else {
    reportData.push(["No attendance records found.", ""]);
  }
  reportData.push([]);

  // --- WEBINAR REGISTRATIONS ---
  reportData.push(["WEBINAR REGISTRATIONS", ""]);
  reportData.push(["Webinar Title", "Registration Date"]);
  if (user.webinarAccess && user.webinarAccess.length > 0) {
    user.webinarAccess.forEach((wa: any) => {
      const title = wa.webinar?.title || "Unknown Webinar";
      reportData.push([title, new Date(wa.purchasedAt).toLocaleDateString()]);
    });
  } else {
    reportData.push(["No webinar registrations found.", ""]);
  }
  reportData.push([]);

  // --- WEBINAR ATTENDANCE ---
  reportData.push(["WEBINAR ATTENDANCE HISTORY", ""]);
  reportData.push(["Webinar Title", "Time Joined"]);
  if (user.webinarAttendances && user.webinarAttendances.length > 0) {
    user.webinarAttendances.forEach((wa: any) => {
      const title = wa.webinar?.title || "Unknown Webinar";
      reportData.push([title, new Date(wa.joinedAt).toLocaleString()]);
    });
  } else {
    reportData.push(["No webinar attendance records found.", ""]);
  }

  // 2. Convert data to a worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(reportData);

  // 🚨 3. THE MAGIC FIX: Set column widths so data is never squished!
  // wch = "width characters"
  worksheet['!cols'] = [
    { wch: 35 }, // Column A width
    { wch: 25 }  // Column B width
  ];

  // 4. Create a new workbook and attach the sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Report");

  // 5. Trigger the download as a clean .xlsx file
  XLSX.writeFile(workbook, `${user.name.replace(/\s+/g, '_')}_Report.xlsx`);
};

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display text-[#600694]">Student Management</h2>
          <p className="text-gray-500 text-sm">Track progress, assign levels, and manage access. ({totalUsers} total students)</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[#600694] focus:ring-1 focus:ring-[#600694] transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px] relative">
        {loading && users.length === 0 ? (
          <div className="absolute inset-0 flex justify-center items-center bg-white/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#600694]" />
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-t-xl border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-bold">User</th>
                <th className="px-4 py-4 font-bold">Subscription & Credits</th>
                <th className="px-4 py-4 font-bold">Courses & Retreats</th>
                <th className="px-4 py-4 font-bold text-center">Live Attendance</th>
                <th className="px-4 py-4 font-bold">Level</th>
                <th className="px-4 py-4 font-bold text-center">Report</th>
                <th className="px-4 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className={`transition-colors ${user.isBlocked ? 'bg-red-50/30 opacity-75' : 'hover:bg-gray-50/50'}`}>
                  
                  {/* 1. USER INFO */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold ${user.isBlocked ? 'text-red-700 line-through' : 'text-gray-900'}`}>{user.name}</p>
                      {user.isBlocked && <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Blocked</span>}
                    </div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>

                  {/* 2. SUBSCRIPTION INFO */}
                  <td className="px-4 py-4 align-top">
                    {user.subscription?.isActive ? (
                      <div>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-md mb-1">
                          {user.subscription.plan.name}
                        </span>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(user.subscription.expiryDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs font-semibold text-[#600694] mt-1">
                          {user.subscription.remainingCredits} Webinar Credits
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No active sub</span>
                    )}
                  </td>

                  {/* 3. COURSES & RETREATS */}
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-bold text-gray-700">Courses: {user.courseAccess?.length || 0}</p>
                        {user.courseAccess?.slice(0, 2).map((c: any) => (
                          <p key={c.id} className="text-[10px] text-gray-500 truncate max-w-[150px]">• {c.course.title}</p>
                        ))}
                      </div>
                      {user.retreatApplications?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-700 border-t border-gray-100 pt-1 mt-1">Retreats: {user.retreatApplications.length}</p>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 4. TODAY'S SESSION ATTENDANCE */}
                  <td className="px-4 py-4 align-top text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      
                      {/* Daily Satsung Attendance Badge */}
                      {user.attendances && user.attendances.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-md text-[10px] font-bold" title={`${user.attendances.length} Satsungs Attended`}>
                          <CheckCircle2 className="h-3 w-3" /> Satsungs: {user.attendances.length}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] italic">- No Satsungs -</span>
                      )}

                      {/* Webinar Attendance Badge */}
                      {user.webinarAttendances && user.webinarAttendances.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-md text-[10px] font-bold" title={`${user.webinarAttendances.length} Webinars Attended`}>
                          <CheckCircle2 className="h-3 w-3" /> Webinars: {user.webinarAttendances.length}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] italic">- No Webinars -</span>
                      )}
                      
                    </div>
                  </td>

                  {/* 5. EDITABLE LEVEL */}
                  <td className="px-4 py-4 align-top">
                    {editingId === user.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="0"
                          className="w-16 p-1 text-sm border border-[#600694] rounded outline-none"
                          value={editLevel}
                          onChange={(e) => setEditLevel(parseInt(e.target.value) || 0)}
                        />
                        <button 
                          onClick={() => handleSaveLevel(user.id)}
                          disabled={savingLevel === user.id}
                          className="bg-[#600694] text-white p-1.5 rounded hover:bg-[#4a0473] transition-colors"
                        >
                          {savingLevel === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-display font-bold text-lg text-gray-800">
                          <Award className="h-4 w-4 text-[#600694]" /> {user.level}
                        </span>
                        <button 
                          onClick={() => { setEditingId(user.id); setEditLevel(user.level); }}
                          className="text-gray-400 hover:text-[#600694] transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* 🚨 NEW 6. EXPORT/REPORT COLUMN */}
                  <td className="px-4 py-4 align-top text-center">
                    <button
                      onClick={() => handleDownloadReport(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                      title="Download Full Report (CSV)"
                    >
                      <Download className="h-5 w-5 mx-auto" />
                    </button>
                  </td>

                  {/* 7. BLOCK / UNBLOCK ACTION */}
                  <td className="px-4 py-4 align-top text-right">
                    <button
                      onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                      disabled={blockingId === user.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        user.isBlocked 
                          ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {blockingId === user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : user.isBlocked ? (
                        <><ShieldCheck className="h-3.5 w-3.5" /> Unblock</>
                      ) : (
                        <><ShieldBan className="h-3.5 w-3.5" /> Block</>
                      )}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Showing <span className="font-bold">{(page - 1) * 10 + Math.min(1, users.length)}</span> to <span className="font-bold">{Math.min(page * 10, totalUsers)}</span> of <span className="font-bold">{totalUsers}</span> users
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}