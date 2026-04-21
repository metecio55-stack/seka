import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  User, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  BarChart3,
  Activity,
  Sparkles,
  Copy,
  Check,
  LogOut,
  QrCode,
  History,
  Percent,
  Gift,
  TrendingUp,
  RefreshCw,
  DollarSign,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser, VIP_PLANS, ADMIN_WALLETS } from '@/context/UserContext';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useLiveTransactions } from '@/hooks/useLiveTransactions';

// Navigation Items
const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Wallet, label: 'Deposit', path: '/deposit-withdraw' },
  { icon: Zap, label: 'Quantify', path: '/quantify' },
  { icon: Gift, label: 'Wheel', path: '/spin-wheel' },
  { icon: Users, label: 'Invite', path: '/invite' },
  { icon: User, label: 'Me', path: '/profile' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, invest } = useUser();
  const { prices, formatPrice } = useCryptoPrices();
  const { transactions: liveTransactions, getTimeAgo } = useLiveTransactions(15);
  
  const [activeTab, setActiveTab] = useState('Home');
  const [copied, setCopied] = useState<string | null>(null);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedVip, setSelectedVip] = useState<typeof VIP_PLANS[0] | null>(null);
  const [investLoading, setInvestLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInvest = async () => {
    if (!selectedVip) return;
    
    if (user.balance < selectedVip.min) {
      alert(`Insufficient balance. You need ${selectedVip.min} USDT.`);
      return;
    }
    
    setInvestLoading(true);
    const success = await invest(selectedVip.min, selectedVip.level);
    setInvestLoading(false);
    
    if (success) {
      alert(`Successfully invested ${selectedVip.min} USDT in VIP ${selectedVip.level}!`);
      setShowInvestDialog(false);
      setSelectedVip(null);
    } else {
      alert('Investment failed. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get recent transactions
  const recentTransactions = user.transactions?.slice(0, 10) || [];
  
  // Calculate daily profit potential
  const currentVipPlan = VIP_PLANS.find(v => v.level === user.vipLevel);
  const dailyProfit = currentVipPlan && user.investments > 0 
    ? (user.investments * currentVipPlan.dailyRate) / 100 
    : 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-black font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold tracking-wider">SEKA</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 text-sm hover:bg-white/10 transition-colors">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </button>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  logout();
                  navigate('/');
                }
              }}
              className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* User Balance Card */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Welcome back,</p>
                  <p className="font-bold text-lg">{user.username}</p>
                </div>
              </div>
              <Badge className="gradient-gold text-black">
                <Sparkles className="w-3 h-3 mr-1" />
                VIP {user.vipLevel || 'Free'}
              </Badge>
            </div>
            
            <div className="text-center py-4 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <p className="text-4xl font-bold text-gold">{user.balance.toFixed(2)} USDT</p>
              {dailyProfit > 0 && (
                <p className="text-sm text-green-400 mt-1">
                  +{dailyProfit.toFixed(2)} USDT daily profit
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-5 gap-2 mt-4">
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Earnings</p>
                <p className="text-gold font-semibold text-sm">{user.totalEarnings.toFixed(0)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Deposits</p>
                <p className="text-green-400 font-semibold text-sm">{user.deposits.toFixed(0)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400">Invested</p>
                <p className="text-blue-400 font-semibold text-sm">{user.investments.toFixed(0)}</p>
              </div>
              <button 
                onClick={() => navigate('/invite')}
                className="text-center p-2 rounded-lg bg-white/5 hover:bg-purple-500/10 transition-colors"
              >
                <p className="text-xs text-gray-400">Team</p>
                <p className="text-purple-400 font-semibold text-sm">{user.teamMembers || 0}</p>
              </button>
              <button 
                onClick={() => navigate('/invite')}
                className="text-center p-2 rounded-lg bg-white/5 hover:bg-green-500/10 transition-colors"
              >
                <p className="text-xs text-gray-400">Ref.</p>
                <p className="text-green-400 font-semibold text-sm">${(user.referralEarnings || 0).toFixed(0)}</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Action Buttons */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-4 gap-3">
          <Button 
            onClick={() => navigate('/deposit-withdraw')}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500"
          >
            <ArrowDownRight className="w-5 h-5" />
            <span className="text-xs">Deposit</span>
          </Button>
          <Button 
            onClick={() => navigate('/deposit-withdraw')}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
          >
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-xs">Withdraw</span>
          </Button>
          <Button 
            onClick={() => setShowInvestDialog(true)}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
          >
            <Percent className="w-5 h-5" />
            <span className="text-xs">Invest</span>
          </Button>
          <Button 
            onClick={() => navigate('/invite')}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Invite</span>
          </Button>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate('/deposit-withdraw')}
            variant="outline" 
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Deposit / Withdraw
          </Button>
          <Button 
            onClick={() => setShowHistoryDialog(true)}
            variant="outline" 
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <History className="w-4 h-4 mr-2" />
            Transaction History
          </Button>
        </div>
      </section>

      {/* Referral Code */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4 text-gold" />
                Your Referral Code
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-lg font-bold text-gold bg-black/30 px-4 py-2 rounded-lg text-center tracking-widest">
                {user.referralCode}
              </code>
              <button
                onClick={() => handleCopy(user.referralCode, 'code')}
                className="p-2 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
              >
                {copied === 'code' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Deposit Addresses */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gold" />
              Deposit Addresses
            </h3>
            <div className="space-y-3">
              {Object.entries(ADMIN_WALLETS).slice(0, 3).map(([network, address]) => (
                <div key={network} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                    network === 'trc20' ? 'bg-red-500/20 text-red-400' :
                    network === 'bep20' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {network.toUpperCase()}
                  </div>
                  <code className="flex-1 text-xs text-gray-300 truncate">
                    {address.substring(0, 20)}...{address.substring(address.length - 8)}
                  </code>
                  <button
                    onClick={() => handleCopy(address, network)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {copied === network ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              ))}
              <button 
                onClick={() => navigate('/deposit-withdraw')}
                className="w-full py-2 text-sm text-gold hover:underline"
              >
                View all addresses →
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Live Transactions */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                Live Global Transactions
              </h3>
              <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                Real-time
              </Badge>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {liveTransactions.slice(0, 8).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-green-500/20' : 
                      tx.type === 'withdrawal' ? 'bg-red-500/20' : 'bg-gold/20'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-3 h-3 text-green-400" /> :
                       tx.type === 'withdrawal' ? <ArrowUpRight className="w-3 h-3 text-red-400" /> :
                       <DollarSign className="w-3 h-3 text-gold" />}
                    </div>
                    <div>
                      <span className="text-xs text-gray-300">{tx.email}</span>
                      <span className="text-xs text-gray-500 ml-2">{getTimeAgo(tx.time)}</span>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${
                    tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{tx.amount.toFixed(2)} USDT
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Crypto Prices */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gold" />
                Live Crypto Prices
              </h3>
            </div>
            <div className="space-y-2">
              {prices.slice(0, 5).map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{crypto.symbol}</span>
                    <span className="text-xs text-gray-400">/USDT</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono">${formatPrice(crypto.price)}</span>
                    <span className={`text-xs ml-2 ${crypto.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* VIP Plans */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            VIP Investment Plans
          </h3>
          <Button 
            size="sm" 
            onClick={() => setShowInvestDialog(true)}
            className="gradient-gold text-black text-xs"
          >
            Invest Now
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {VIP_PLANS.slice(0, 4).map((plan) => (
            <div 
              key={plan.level}
              onClick={() => {
                setSelectedVip(plan);
                setShowInvestDialog(true);
              }}
              className={`p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                plan.level === 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                plan.level === 2 ? 'bg-gradient-to-br from-cyan-500 to-cyan-600' :
                plan.level === 3 ? 'bg-gradient-to-br from-teal-500 to-teal-600' :
                'bg-gradient-to-br from-green-500 to-green-600'
              }`}
            >
              <p className="font-bold">VIP {plan.level}</p>
              <p className="text-xs opacity-90">{plan.dailyRate}% daily</p>
              <p className="text-xs mt-1">{plan.min} USDT+</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="px-4 pt-4 pb-24">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2026 seka. All rights reserved.
          </p>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveTab(item.label);
                navigate(item.path);
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === item.label 
                  ? 'text-gold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.label ? 'text-gold' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Invest Dialog */}
      <Dialog open={showInvestDialog} onOpenChange={setShowInvestDialog}>
        <DialogContent className="bg-[#1a1f2e] border-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gold flex items-center gap-2">
              <Percent className="w-6 h-6" />
              VIP Investment Plans
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white/5 mb-4">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-2xl font-bold text-gold">{user.balance.toFixed(2)} USDT</p>
            </div>
            
            {VIP_PLANS.map((plan) => (
              <div 
                key={plan.level}
                onClick={() => setSelectedVip(plan)}
                className={`p-4 rounded-lg cursor-pointer hover:opacity-90 transition-all ${
                  plan.level === 1 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  plan.level === 2 ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' :
                  plan.level === 3 ? 'bg-gradient-to-r from-teal-500 to-teal-600' :
                  plan.level === 4 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  plan.level === 5 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  plan.level === 6 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  plan.level === 7 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  'bg-gradient-to-r from-purple-500 to-purple-600'
                } ${selectedVip?.level === plan.level ? 'ring-2 ring-white scale-[1.02]' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">VIP {plan.level}</p>
                    <p className="text-sm opacity-90">{plan.dailyRate}% Daily Return</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{plan.min}-{plan.max === Infinity ? '+' : plan.max.toLocaleString()} USDT</p>
                    <p className="text-xs opacity-75">{plan.dailyMin.toFixed(1)}-{plan.dailyMax === Infinity ? '+' : plan.dailyMax.toLocaleString()} USDT/day</p>
                  </div>
                </div>
              </div>
            ))}
            
            {selectedVip && (
              <div className="p-4 rounded-lg bg-gold/10 border border-gold/30">
                <p className="text-sm text-gray-400 mb-2">Selected: VIP {selectedVip.level}</p>
                <p className="text-lg font-bold text-gold">{selectedVip.min} USDT</p>
                <p className="text-sm text-gray-400">Daily return: ~{selectedVip.dailyMin.toFixed(2)} USDT</p>
                <p className="text-xs text-gray-500 mt-1">Monthly: ~{(selectedVip.dailyMin * 30).toFixed(2)} USDT</p>
              </div>
            )}
            
            <button
              onClick={handleInvest}
              disabled={!selectedVip || investLoading}
              className="w-full py-4 rounded-lg gradient-gold text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {investLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : selectedVip ? (
                `Invest ${selectedVip.min} USDT`
              ) : (
                'Select a Plan'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="bg-[#1a1f2e] border-gold/30 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gold flex items-center gap-2">
              <History className="w-6 h-6" />
              Transaction History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-green-500/20' :
                        tx.type === 'withdrawal' ? 'bg-red-500/20' :
                        tx.type === 'investment' ? 'bg-blue-500/20' : 'bg-gold/20'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5 text-green-400" /> :
                         tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                         tx.type === 'investment' ? <Percent className="w-5 h-5 text-blue-400" /> :
                         <TrendingUp className="w-5 h-5 text-gold" />}
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
                  {tx.description && (
                    <p className="text-xs text-gray-500 mt-2">{tx.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
