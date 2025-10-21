import UserCards from "@/components/UserCards"

const AdminPage = () => {
    return (
        <div className="p-4 flex g-4 flex-col md:flex-row ">
            {/* <div className="md:w-1/4 p-2 border-r">
                <h2 className="text-xl font-bold mb-4">Admin Menu</h2>
                <ul className="space-y-2">
                    <li><a href="#" className="text-blue-500 hover:underline">User Management</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline">Site Settings</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline">Reports</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline">Logs</a></li>
                </ul>
            </div>
            <div className="md:w-3/4 p-2">
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                <p>Welcome to the admin dashboard. Here you can manage users, configure site settings, view reports
                , and monitor logs.</p>
            </div> */}
            <div className="w-full lg:w-2/3">
                {/* Users Cards */}
                <div className="flex gap-4 justify-between flex-wrap">
                    <UserCards type="staff"/>
                    <UserCards type="student"/>
                    <UserCards type="teacher"/>
                    <UserCards type="parent"/>
                </div>
            </div>
            <div className="w-full lg:w-1/3">Right</div>
        </div>
    )
}
export default AdminPage