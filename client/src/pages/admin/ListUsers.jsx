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

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Title text1="Danh sách" text2="Tài khoản" />

      <div className="mt-8 border border-gray-600 rounded-lg overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="border-b border-gray-600 bg-primary/10">
            <tr>
              <th className="p-4 font-medium">Người dùng</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Quyền hạn</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-primary/5 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.image} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-300">{user.email}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin" 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}>
                    {user.role === "admin" ? <ShieldIcon className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
                    {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleRoleChange(user._id, user.role)}
                    className="px-4 py-1.5 text-xs font-medium border border-gray-500 rounded hover:bg-gray-800 transition"
                  >
                    {user.role === "admin" ? "Gỡ Admin" : "Cấp Admin"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListUsers;
