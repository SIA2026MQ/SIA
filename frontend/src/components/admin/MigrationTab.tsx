import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Clock, ShieldCheck, AlertCircle, BookOpen } from "lucide-react";
import { api } from "@/lib/api";

type PendingCourse = {
  id: string;
  courseName: string;
  orderNumber: string;
  purchasedAt: string;
};

type MigrationUser = {
  userId: string;
  name: string | null;
  email: string;
  alreadyActiveCourses: string[];
  pendingLegacyCourses: PendingCourse[];
};

export function MigrationTab() {
  const [users, setUsers] = useState<MigrationUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grantingId, setGrantingId] = useState<string | null>(null);

  const fetchPendingMigrations = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPendingMigrations();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Failed to load pending migrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingMigrations();
  }, []);

  const handleGrantAccess = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to grant legacy access to ${email}?`)) return;

    setGrantingId(userId);
    try {
      const res = await api.grantMigrationAccess({ userId, email });
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.userId !== userId));
      } else {
        alert("Failed to grant access: " + res.error);
      }
    } catch (error) {
      console.error("Grant access error:", error);
      alert("An unexpected error occurred while verifying the transaction.");
    } finally {
      setGrantingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-[#600694] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Scanning Database for Matches...</p>
      </div>
    );
  }

  return (
    <article className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#600694] mb-2">Legacy Migration CRM</h2>
          <p className="text-sm text-gray-500 max-w-xl">
            Verify and securely grant access to users who purchased on the old WordPress platform.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-100 px-5 py-3 rounded-2xl flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm">
            <Clock className="h-5 w-5 text-[#600694]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Matches</p>
            <p className="text-xl font-black text-[#600694] leading-none">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Empty or Populated States */}
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <CheckCircle className="h-16 w-16 text-emerald-400 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Inbox Zero!</h3>
          <p className="text-gray-500 text-center max-w-md">
            There are currently no registered users waiting for legacy course migrations. When a user creates an account matching an old WordPress email, they will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.userId}
              className="flex flex-col xl:flex-row gap-6 bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-purple-200 transition-colors"
            >
              {/* User Identity Info */}
              <div className="xl:w-1/3 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{user.name || "No Name Provided"}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                {user.alreadyActiveCourses.length > 0 && (
                  <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Already Unlocked</p>
                    <p className="text-xs text-emerald-600 font-medium truncate">
                      {user.alreadyActiveCourses.join(", ")}
                    </p>
                  </div>
                )}
              </div>

              {/* Pending Courses Info */}
              <div className="xl:w-1/2 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Awaiting Verification</p>
                <div className="flex flex-wrap gap-2">
                  {user.pendingLegacyCourses.map((course, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 text-[#600694] px-3 py-1.5 rounded-lg text-xs font-semibold">
                      <BookOpen size={14} />
                      {course.courseName}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded w-fit">
                  <AlertCircle size={12} />
                  Found {user.pendingLegacyCourses.length} historical purchase(s)
                </div>
              </div>

              {/* Action Button */}
              <div className="xl:w-1/6 flex items-center xl:justify-end border-t xl:border-t-0 xl:border-l border-gray-100 pt-4 xl:pt-0 xl:pl-4">
                <button
                  onClick={() => handleGrantAccess(user.userId, user.email)}
                  disabled={grantingId === user.userId}
                  className="w-full flex justify-center items-center gap-2 bg-[#600694] hover:bg-[#4a0473] text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-500/20"
                >
                  {grantingId === user.userId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Granting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Verify & Grant
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}