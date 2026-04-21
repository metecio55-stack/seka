import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone,
  Calendar,
  Shield,
  Lock,
  Edit3,
  Save,
  X,
  LogOut,
  Copy,
  Check,
  TrendingUp,
  Users,
  Wallet,
  Award,
  Star,
  Gift,
  ChevronRight,
  AlertCircle,
  Camera,
  Eye,
  EyeOff,
  History,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, VIP_PLANS } from '@/context/UserContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, getReferralLink, updateProfile, changePassword } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Edit form
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user]);

  if (!user) return null;

  const referralLink = getReferralLink();

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async () => {
    setUpdateLoading(true);
    const success = await updateProfile({
      username: editForm.username,
      email: editForm.email,
      phone: editForm.phone,
    });
    setUpdateLoading(false);
    
    if (success) {
      alert('Profile updated successfully!');
      setIsEditing(false);
    } else {
      alert('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordForm.new.length < 6) {
      alert('Password must be at least 6 characters!');
      return;
    }
    
    const success = await changePassword(passwordForm.current, passwordForm.new);
    
    if (success) {
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } else {
      alert('Current password is incorrect!');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  // Calculate stats
  const totalInvestments = user.investments || 0;
  const totalEarnings = user.totalEarnings || 0;
  const teamCount = user.teamMembers || 0;
  
  // Get next VIP level
  const nextVip = VIP_PLANS.find(v => v.level === (user.vipLevel || 0) + 1);
  const progressToNext = nextVip 
    ? Math.min(100, (totalInvestments / nextVip.min) * 100)
    : 100;

  // Get recent transactions
  const recentTransactions = user.transactions?.slice(0, 5) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-gold transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gold" />
            <span className="text-lg font-bold">My Profile</span>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Profile Header */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center text-4xl font-bold text-black">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              {/* User Info */}
              {isEditing ? (
                <div className="w-full space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Add phone number"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={updateLoading}
                      className="flex-1 py-2 rounded-lg gradient-gold text-black font-semibold disabled:opacity-50"
                    >
                      {updateLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin inline mr-1" />
                      ) : (
                        <Save className="w-4 h-4 inline mr-1" />
                      )}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-gray-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="gradient-gold text-black">
                      <Award className="w-3 h-3 mr-1" />
                      VIP {user.vipLevel || 'Free'}
                    </Badge>
                    <Badge variant="outline" className="border-green-500/30 text-green-400">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Member since {new Date(parseInt(user.id)).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Cards */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-gradient border-gold/20">
            <CardContent className="p-4 text-center">
              <Wallet className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-gold">{user.balance.toFixed(2)}</p>
              <p className="text-xs text-gray-400">USDT Balance</p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-green-500/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Total Earnings</p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-blue-500/20">
            <CardContent className="p-4 text-center">
              <Gift className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">{totalInvestments.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Total Invested</p>
            </CardContent>
          </Card>
          <Card className="card-gradient border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{teamCount}</p>
              <p className="text-xs text-gray-400">Team Members</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* VIP Progress */}
      {nextVip && (
        <section className="px-4 pt-4">
          <Card className="card-gradient border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold" />
                  VIP Progress
                </h3>
                <Badge className="gradient-gold text-black">VIP {user.vipLevel || 0}</Badge>
              </div>
              <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full gradient-gold rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current: {totalInvestments.toFixed(0)} USDT</span>
                <span className="text-gold">Next: VIP {nextVip.level} ({nextVip.min} USDT)</span>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Referral Code */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/30">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" />
              My Referral Code
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-xl font-bold text-gold bg-black/30 px-4 py-3 rounded-lg text-center tracking-widest">
                {user.referralCode}
              </code>
              <button
                onClick={handleCopyReferral}
                className="p-3 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
              >
                {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Share your code and earn 14% commission on direct referrals!
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Tabs */}
      <section className="px-4 pt-4 pb-8">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="transactions">History</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="mt-4 space-y-3">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-gold" />
                  Account Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">Username</span>
                    </div>
                    <span className="font-semibold">{user.username}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">Email</span>
                    </div>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">Phone</span>
                    </div>
                    <span className="font-semibold text-gray-500">
                      {user.phone || 'Not added'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">Member Since</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(parseInt(user.id)).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">VIP Level</span>
                    </div>
                    <Badge className="gradient-gold text-black">VIP {user.vipLevel || 'Free'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="mt-4">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-gold" />
                  Recent Transactions
                </h3>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'deposit' ? 'bg-green-500/20' :
                            tx.type === 'withdrawal' ? 'bg-red-500/20' :
                            tx.type === 'investment' ? 'bg-blue-500/20' : 'bg-gold/20'
                          }`}>
                            {tx.type === 'deposit' ? <TrendingUp className="w-5 h-5 text-green-400" /> :
                             tx.type === 'withdrawal' ? <TrendingUp className="w-5 h-5 text-red-400 rotate-180" /> :
                             tx.type === 'investment' ? <Gift className="w-5 h-5 text-blue-400" /> :
                             <Star className="w-5 h-5 text-gold" />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm capitalize">{tx.type}</p>
                            <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} USDT
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              tx.status === 'completed' ? 'border-green-500/30 text-green-400' :
                              tx.status === 'pending' ? 'border-yellow-500/30 text-yellow-400' :
                              'border-red-500/30 text-red-400'
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No transactions yet</p>
                  </div>
                )}
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-4 py-3 rounded-lg bg-white/5 text-gold hover:bg-white/10 transition-colors"
                >
                  View All Transactions
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-4 space-y-3">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold" />
                  Security Settings
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gold" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Change Password</p>
                        <p className="text-xs text-gray-400">Update your account password</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Account Status</p>
                        <p className="text-xs text-gray-400">Your account is secure</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Email Verification</p>
                        <p className="text-xs text-gray-400">Your email is verified</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </TabsContent>
        </Tabs>
      </section>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#1a1f2e] border border-gold/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lock className="w-6 h-6 text-gold" />
                Change Password
              </h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 pr-12"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 pr-12"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-sm text-yellow-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Password must be at least 6 characters long.
                </p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 py-3 rounded-lg gradient-gold text-black font-bold"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
