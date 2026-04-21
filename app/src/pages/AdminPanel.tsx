import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ArrowDownRight, 
  ArrowUpRight,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Menu,
  X,
  Wallet,
  Percent,
  Activity,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { NETWORKS } from '@/context/UserContext';
import { toast } from 'sonner';

interface UserData {
  id: string;
  username: string;
  email: string;
  balance: number;
  vipLevel: number;
  referralCode: string;
  teamMembers: number;
  totalEarnings: number;
  deposits: number;
  investments: number;
  createdAt: string;
  transactions: any[];
  withdrawalRequests: any[];
  depositRequests: any[];
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requestType, setRequestType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check admin login
  useEffect(() => {
    const isAdmin = localStorage.getItem('seka_admin');
    if (!isAdmin) {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Load users
  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('seka_users') || '[]');
    setUsers(allUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('seka_admin');
    navigate('/admin-login');
    toast.success('Logged out successfully');
  };

  const refreshData = () => {
    loadUsers();
    toast.success('Data refreshed');
  };

  // Statistics
  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
    totalDeposits: users.reduce((sum, u) => sum + (u.deposits || 0), 0),
    totalInvestments: users.reduce((sum, u) => sum + (u.investments || 0), 0),
    totalEarnings: users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0),
    pendingDeposits: users.reduce((sum, u) => sum + (u.depositRequests?.filter((d: any) => d.status === 'pending').length || 0), 0),
    pendingWithdrawals: users.reduce((sum, u) => sum + (u.withdrawalRequests?.filter((w: any) => w.status === 'pending').length || 0), 0),
  };

  // Get all pending requests
  const allPendingDeposits = users.flatMap(u => 
    (u.depositRequests || [])
      .filter((d: any) => d.status === 'pending')
      .map((d: any) => ({ ...d, user: u }))
  );

  const allPendingWithdrawals = users.flatMap(u => 
    (u.withdrawalRequests || [])
      .filter((w: any) => w.status === 'pending')
      .map((w: any) => ({ ...w, user: u }))
  );

  // Filter users
  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.referralCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = (type: 'deposit' | 'withdrawal', request: any) => {
    setRequestType(type);
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (type: 'deposit' | 'withdrawal', request: any) => {
    setRequestType(type);
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  // Sync current user session if the affected user is logged in
  const syncCurrentUser = (userId: string, updatedUserData: UserData) => {
    const currentUserStr = localStorage.getItem('seka_user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        // Update the current session user
        localStorage.setItem('seka_user', JSON.stringify(updatedUserData));
      }
    }
  };

  const confirmApprove = async () => {
    if (!selectedRequest || isProcessing) return;
    
    setIsProcessing(true);

    try {
      const allUsers = JSON.parse(localStorage.getItem('seka_users') || '[]');
      const userIndex = allUsers.findIndex((u: UserData) => u.id === selectedRequest.user.id);
      
      if (userIndex === -1) {
        toast.error('User not found');
        return;
      }

      if (requestType === 'deposit') {
        // Approve deposit
        const depositIndex = allUsers[userIndex].depositRequests?.findIndex((d: any) => d.id === selectedRequest.id);
        if (depositIndex !== -1 && depositIndex !== undefined) {
          allUsers[userIndex].depositRequests[depositIndex].status = 'completed';
          allUsers[userIndex].balance = (allUsers[userIndex].balance || 0) + selectedRequest.amount;
          allUsers[userIndex].deposits = (allUsers[userIndex].deposits || 0) + selectedRequest.amount;
          
          // Add transaction
          allUsers[userIndex].transactions = allUsers[userIndex].transactions || [];
          allUsers[userIndex].transactions.unshift({
            id: 'TX' + Date.now(),
            type: 'deposit',
            amount: selectedRequest.amount,
            status: 'completed',
            date: new Date().toISOString(),
            description: `Deposit approved - ${selectedRequest.network.toUpperCase()}`,
            txHash: selectedRequest.txHash,
            network: selectedRequest.network,
          });

          // Sync current user if they're logged in
          syncCurrentUser(selectedRequest.user.id, allUsers[userIndex]);

          toast.success(`Deposit of $${selectedRequest.amount} approved successfully!`);
        }
      } else {
        // Approve withdrawal
        const withdrawalIndex = allUsers[userIndex].withdrawalRequests?.findIndex((w: any) => w.id === selectedRequest.id);
        if (withdrawalIndex !== -1 && withdrawalIndex !== undefined) {
          allUsers[userIndex].withdrawalRequests[withdrawalIndex].status = 'completed';
          
          // Add transaction
          allUsers[userIndex].transactions = allUsers[userIndex].transactions || [];
          allUsers[userIndex].transactions.unshift({
            id: 'TX' + Date.now(),
            type: 'withdrawal',
            amount: -(selectedRequest.amount + selectedRequest.fee),
            status: 'completed',
            date: new Date().toISOString(),
            description: `Withdrawal approved - ${selectedRequest.network.toUpperCase()}`,
            network: selectedRequest.network,
          });

          // Sync current user if they're logged in
          syncCurrentUser(selectedRequest.user.id, allUsers[userIndex]);

          toast.success(`Withdrawal of $${selectedRequest.amount} approved successfully!`);
        }
      }

      localStorage.setItem('seka_users', JSON.stringify(allUsers));
      loadUsers();
      setShowApproveDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('An error occurred while processing the request');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || isProcessing) return;
    
    setIsProcessing(true);

    try {
      const allUsers = JSON.parse(localStorage.getItem('seka_users') || '[]');
      const userIndex = allUsers.findIndex((u: UserData) => u.id === selectedRequest.user.id);
      
      if (userIndex === -1) {
        toast.error('User not found');
        return;
      }

      if (requestType === 'deposit') {
        const depositIndex = allUsers[userIndex].depositRequests?.findIndex((d: any) => d.id === selectedRequest.id);
        if (depositIndex !== -1 && depositIndex !== undefined) {
          allUsers[userIndex].depositRequests[depositIndex].status = 'rejected';
          
          // Update pending transaction
          const txIndex = allUsers[userIndex].transactions?.findIndex((t: any) => 
            t.type === 'deposit' && t.txHash === selectedRequest.txHash
          );
          if (txIndex !== -1 && txIndex !== undefined) {
            allUsers[userIndex].transactions[txIndex].status = 'rejected';
          }

          // Sync current user if they're logged in
          syncCurrentUser(selectedRequest.user.id, allUsers[userIndex]);

          toast.info(`Deposit of $${selectedRequest.amount} has been rejected`);
        }
      } else {
        const withdrawalIndex = allUsers[userIndex].withdrawalRequests?.findIndex((w: any) => w.id === selectedRequest.id);
        if (withdrawalIndex !== -1 && withdrawalIndex !== undefined) {
          allUsers[userIndex].withdrawalRequests[withdrawalIndex].status = 'rejected';
          
          // Refund the amount
          const refundAmount = selectedRequest.amount + selectedRequest.fee;
          allUsers[userIndex].balance = (allUsers[userIndex].balance || 0) + refundAmount;
          
          // Add refund transaction
          allUsers[userIndex].transactions = allUsers[userIndex].transactions || [];
          allUsers[userIndex].transactions.unshift({
            id: 'TX' + Date.now(),
            type: 'withdrawal',
            amount: refundAmount,
            status: 'rejected',
            date: new Date().toISOString(),
            description: `Withdrawal rejected - Refund: $${refundAmount}`,
            network: selectedRequest.network,
          });

          // Sync current user if they're logged in
          syncCurrentUser(selectedRequest.user.id, allUsers[userIndex]);

          toast.info(`Withdrawal rejected. $${refundAmount} has been refunded to user's balance.`);
        }
      }

      localStorage.setItem('seka_users', JSON.stringify(allUsers));
      loadUsers();
      setShowRejectDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('An error occurred while rejecting the request');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone!')) return;
    
    const allUsers = JSON.parse(localStorage.getItem('seka_users') || '[]');
    const filteredUsers = allUsers.filter((u: UserData) => u.id !== userId);
    localStorage.setItem('seka_users', JSON.stringify(filteredUsers));
    
    // Also clear current user session if it's the deleted user
    const currentUserStr = localStorage.getItem('seka_user');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      if (currentUser.id === userId) {
        localStorage.removeItem('seka_user');
      }
    }
    
    loadUsers();
    toast.success('User deleted successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'deposits', label: 'Deposits', icon: ArrowDownRight },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#161b22] border-r border-white/5 transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                <span className="text-black font-bold text-sm">A</span>
              </div>
              <span className="font-bold">Admin</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/5">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-gold/20 text-gold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="card-gradient border-gold/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Balance</p>
                        <p className="text-2xl font-bold text-green-400">${stats.totalBalance.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <ArrowDownRight className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Deposits</p>
                        <p className="text-2xl font-bold text-blue-400">${stats.totalDeposits.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-gradient border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Percent className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Invested</p>
                        <p className="text-2xl font-bold text-purple-400">${stats.totalInvestments.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Requests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="card-gradient border-yellow-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        Pending Deposits
                      </h3>
                      <Badge className="bg-yellow-500/20 text-yellow-400">{stats.pendingDeposits}</Badge>
                    </div>
                    {allPendingDeposits.slice(0, 5).map((deposit) => (
                      <div key={deposit.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 mb-2">
                        <div>
                          <p className="font-semibold">{deposit.user.username}</p>
                          <p className="text-sm text-gray-400">{deposit.amount} {NETWORKS[deposit.network as keyof typeof NETWORKS]?.token}</p>
                        </div>
                        <button
                          onClick={() => handleApprove('deposit', deposit)}
                          className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                    {allPendingDeposits.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending deposits</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-gradient border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-400" />
                        Pending Withdrawals
                      </h3>
                      <Badge className="bg-red-500/20 text-red-400">{stats.pendingWithdrawals}</Badge>
                    </div>
                    {allPendingWithdrawals.slice(0, 5).map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 mb-2">
                        <div>
                          <p className="font-semibold">{withdrawal.user.username}</p>
                          <p className="text-sm text-gray-400">{withdrawal.amount} USDT</p>
                        </div>
                        <button
                          onClick={() => handleApprove('withdrawal', withdrawal)}
                          className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                    {allPendingWithdrawals.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending withdrawals</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="card-gradient border-white/5">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gold" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {users
                      .flatMap(u => (u.transactions || []).map(t => ({ ...t, user: u })))
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((tx, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'deposit' ? 'bg-green-500/20' :
                              tx.type === 'withdrawal' ? 'bg-red-500/20' :
                              'bg-gold/20'
                            }`}>
                              {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4 text-green-400" /> :
                               tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-red-400" /> :
                               <TrendingUp className="w-4 h-4 text-gold" />}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{tx.user.username}</p>
                              <p className="text-xs text-gray-400 capitalize">{tx.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} USDT
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <Card className="card-gradient border-white/5">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left p-4 text-gray-400 font-medium">User</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Balance</th>
                          <th className="text-left p-4 text-gray-400 font-medium">VIP</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Invested</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Team</th>
                          <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4">
                              <div>
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-gold font-semibold">${user.balance?.toFixed(2) || '0.00'}</span>
                            </td>
                            <td className="p-4">
                              <Badge className="gradient-gold text-black">VIP {user.vipLevel || 'Free'}</Badge>
                            </td>
                            <td className="p-4">${user.investments?.toFixed(2) || '0.00'}</td>
                            <td className="p-4">{user.teamMembers || 0}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDetail(true);
                                  }}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteUser(user.id)}
                                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Deposits */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              <Tabs defaultValue="pending">
                <TabsList className="bg-white/5">
                  <TabsTrigger value="pending">Pending ({allPendingDeposits.length})</TabsTrigger>
                  <TabsTrigger value="all">All Deposits</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                  <div className="space-y-2">
                    {allPendingDeposits.map((deposit) => (
                      <Card key={deposit.id} className="card-gradient border-yellow-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <ArrowDownRight className="w-6 h-6 text-yellow-400" />
                              </div>
                              <div>
                                <p className="font-bold">{deposit.user.username}</p>
                                <p className="text-sm text-gray-400">{deposit.amount} {NETWORKS[deposit.network as keyof typeof NETWORKS]?.token}</p>
                                <p className="text-xs text-gray-500">Network: {deposit.network.toUpperCase()}</p>
                                <p className="text-xs text-gray-500">TX: {deposit.txHash?.substring(0, 20)}...</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove('deposit', deposit)}
                                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick('deposit', deposit)}
                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {allPendingDeposits.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
                        <p className="text-gray-400">No pending deposits</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-2">
                    {users.flatMap(u => 
                      (u.depositRequests || []).map((d: any) => ({ ...d, user: u }))
                    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((deposit) => (
                      <Card key={deposit.id} className={`card-gradient ${deposit.status === 'pending' ? 'border-yellow-500/30' : deposit.status === 'completed' ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{deposit.user.username}</p>
                              <p className="text-sm text-gray-400">{deposit.amount} {NETWORKS[deposit.network as keyof typeof NETWORKS]?.token}</p>
                              <p className="text-xs text-gray-500">{formatDate(deposit.date)}</p>
                            </div>
                            <Badge className={
                              deposit.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              deposit.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }>
                              {deposit.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Withdrawals */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <Tabs defaultValue="pending">
                <TabsList className="bg-white/5">
                  <TabsTrigger value="pending">Pending ({allPendingWithdrawals.length})</TabsTrigger>
                  <TabsTrigger value="all">All Withdrawals</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-4">
                  <div className="space-y-2">
                    {allPendingWithdrawals.map((withdrawal) => (
                      <Card key={withdrawal.id} className="card-gradient border-red-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-red-400" />
                              </div>
                              <div>
                                <p className="font-bold">{withdrawal.user.username}</p>
                                <p className="text-sm text-gray-400">{withdrawal.amount} USDT (Fee: {withdrawal.fee})</p>
                                <p className="text-xs text-gray-500">Network: {withdrawal.network.toUpperCase()}</p>
                                <p className="text-xs text-gray-500">To: {withdrawal.address?.substring(0, 20)}...</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove('withdrawal', withdrawal)}
                                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick('withdrawal', withdrawal)}
                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {allPendingWithdrawals.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
                        <p className="text-gray-400">No pending withdrawals</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-2">
                    {users.flatMap(u => 
                      (u.withdrawalRequests || []).map((w: any) => ({ ...w, user: u }))
                    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((withdrawal) => (
                      <Card key={withdrawal.id} className={`card-gradient ${withdrawal.status === 'pending' ? 'border-yellow-500/30' : withdrawal.status === 'completed' ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{withdrawal.user.username}</p>
                              <p className="text-sm text-gray-400">{withdrawal.amount} USDT</p>
                              <p className="text-xs text-gray-500">{formatDate(withdrawal.date)}</p>
                            </div>
                            <Badge className={
                              withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }>
                              {withdrawal.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <Card className="card-gradient border-white/5">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Admin Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div>
                        <p className="font-semibold">Admin Username</p>
                        <p className="text-sm text-gray-400">admin</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div>
                        <p className="font-semibold">System Version</p>
                        <p className="text-sm text-gray-400">v1.0.0</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div>
                        <p className="font-semibold">Database</p>
                        <p className="text-sm text-gray-400">LocalStorage ({users.length} users)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient border-red-500/30">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Danger Zone
                  </h3>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
                        localStorage.removeItem('seka_users');
                        localStorage.removeItem('seka_user');
                        toast.success('All data cleared!');
                        loadUsers();
                      }
                    }}
                    className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All Data
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
        <DialogContent className="bg-[#1a1f2e] border-gold/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gold">User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-2xl font-bold text-black">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold">{selectedUser.username}</p>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <Badge className="gradient-gold text-black mt-1">VIP {selectedUser.vipLevel || 'Free'}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm">Balance</p>
                  <p className="text-xl font-bold text-gold">${selectedUser.balance?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm">Total Deposits</p>
                  <p className="text-xl font-bold text-green-400">${selectedUser.deposits?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm">Total Invested</p>
                  <p className="text-xl font-bold text-blue-400">${selectedUser.investments?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm">Total Earnings</p>
                  <p className="text-xl font-bold text-purple-400">${selectedUser.totalEarnings?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Referral Code</p>
                <code className="px-4 py-2 rounded-lg bg-black/30 text-gold">{selectedUser.referralCode}</code>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Recent Transactions</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(selectedUser.transactions || []).slice(0, 10).map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{tx.type}</span>
                        <Badge className={
                          tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {tx.status}
                        </Badge>
                      </div>
                      <span className={tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} USDT
                      </span>
                    </div>
                  ))}
                  {(selectedUser.transactions || []).length === 0 && (
                    <p className="text-gray-500 text-center py-4">No transactions</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="bg-[#1a1f2e] border-gold/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gold">
              {requestType === 'deposit' ? 'Approve Deposit' : 'Approve Withdrawal'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to approve this {requestType}?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-gray-400 text-sm">User</p>
                <p className="font-bold">{selectedRequest.user.username}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="font-bold text-gold">
                  {selectedRequest.amount} {requestType === 'deposit' ? NETWORKS[selectedRequest.network as keyof typeof NETWORKS]?.token : 'USDT'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-gray-400 text-sm">Network</p>
                <p className="font-bold">{selectedRequest.network.toUpperCase()}</p>
              </div>
              {requestType === 'withdrawal' && (
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm">To Address</p>
                  <p className="font-mono text-xs break-all">{selectedRequest.address}</p>
                </div>
              )}
              {requestType === 'deposit' && (
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm">Transaction Hash</p>
                  <p className="font-mono text-xs break-all">{selectedRequest.txHash}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveDialog(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-lg gradient-gold text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-[#1a1f2e] border-red-500/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Reject {requestType === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {requestType === 'withdrawal' 
                ? 'The amount will be refunded to the user\'s balance.' 
                : 'This deposit request will be rejected.'}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-gray-400 text-sm">User</p>
                <p className="font-bold">{selectedRequest.user.username}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="font-bold text-red-400">
                  {selectedRequest.amount} {requestType === 'deposit' ? NETWORKS[selectedRequest.network as keyof typeof NETWORKS]?.token : 'USDT'}
                </p>
              </div>
              {requestType === 'withdrawal' && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Refund Amount: ${selectedRequest.amount + selectedRequest.fee} USDT
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Confirm Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
