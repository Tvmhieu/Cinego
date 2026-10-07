import { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";
import { UserIcon, ShieldIcon } from "lucide-react";

const ListUsers = () => {
  const { axios, getToken } = useAppContext();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'admin', 'user'
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage = newRole === "admin" 
      ? "Bạn có chắc muốn cấp quyền Admin cho người dùng này?" 
      : "Bạn có chắc muốn gỡ quyền Admin của người dùng này?";
      
    if (!window.confirm(confirmMessage)) return;

    try {
      const { data } = await axios.post(
        "/api/admin/update-role",
        { userId, role: newRole },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUsers(); // Refresh list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật quyền");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "all" || user.role === activeTab;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user._id?.toLowerCase().includes(searchLower);

    return matchesTab && matchesSearch;
  });

  return isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Title text1="Danh sách" text2="Tài khoản" />
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            className="block w-full px-4 py-2 border border-gray-800 rounded-xl leading-5 bg-[#161616] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
            placeholder="Tìm theo tên, email, mã số..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "all" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Tất cả ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "admin" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Quản trị viên ({users.filter(u => u.role === "admin").length})
        </button>
        <button
          onClick={() => setActiveTab("user")}
          className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "user" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Người dùng ({users.filter(u => u.role === "user").length})
        </button>
      </div>

      <div className="bg-[#161616] rounded-2xl border border-gray-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left min-w-[900px] text-sm">
          <thead className="bg-[#1a1a1a] border-b border-gray-800 text-gray-400 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Mã Số (ID)</th>
              <th className="px-6 py-4 font-medium">Người dùng</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Quyền hạn</th>
              <th className="px-6 py-4 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-white/[0.02] transition">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-medium text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                    {user._id.replace("user_", "")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.image} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium text-white">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    user.role === "admin" 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-gray-800 text-gray-400 border-gray-700"
                  }`}>
                    {user.role === "admin" ? <ShieldIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                    {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleRoleChange(user._id, user.role)}
                    className={`px-4 py-2 text-xs font-medium border rounded-lg transition active:scale-95 ${
                      user.role === "admin" 
                        ? "text-red-500 border-red-500/20 bg-red-500/10 hover:bg-red-500 hover:text-white" 
                        : "text-primary border-primary/20 bg-primary/10 hover:bg-primary hover:text-white"
                    }`}
                  >
                    {user.role === "admin" ? "Gỡ Admin" : "Cấp Admin"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListUsers;
