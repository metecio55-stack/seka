import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight,
  Copy, 
  Check,
  QrCode,
  AlertCircle,
  History,
  RefreshCw,
  Shield,
  Clock,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, ADMIN_WALLETS, NETWORKS } from '@/context/UserContext';

export default function DepositWithdraw() {
  const navigate = useNavigate();
  const { user, requestWithdrawal, requestDeposit } = useUser();
  
  const [activeTab, setActiveTab] = useState('deposit');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('trc20');
  const [copied, setCopied] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  
  // Deposit form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxHash, setDepositTxHash] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  
  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState<string>('trc20');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [showWithdrawNetworkDropdown, setShowWithdrawNetworkDropdown] = useState(false);

  if (!user) return null;

  const networkConfig = NETWORKS[selectedNetwork as keyof typeof NETWORKS];
  const withdrawNetworkConfig = NETWORKS[withdrawNetwork as keyof typeof NETWORKS];
  const walletAddress = ADMIN_WALLETS[selectedNetwork as keyof typeof ADMIN_WALLETS];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < networkConfig.minDeposit) {
      alert(`Minimum deposit is ${networkConfig.minDeposit} ${networkConfig.token}`);
      return;
    }
    if (!depositTxHash || depositTxHash.length < 10) {
      alert('Please enter a valid transaction hash (TXID)');
      return;
    }
    
    setDepositLoading(true);
    
    const success = await requestDeposit(amount, selectedNetwork, depositTxHash);
    
    if (success) {
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        setDepositAmount('');
        setDepositTxHash('');
      }, 3000);
    } else {
      alert('Failed to submit deposit request');
    }
    
    setDepositLoading(false);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount < withdrawNetworkConfig.minWithdraw) {
      alert(`Minimum withdrawal is ${withdrawNetworkConfig.minWithdraw} ${withdrawNetworkConfig.token}`);
      return;
    }
    if (!withdrawAddress || withdrawAddress.length < 10) {
      alert('Please enter a valid wallet address');
      return;
    }
    if (amount + withdrawNetworkConfig.fee > user.balance) {
      alert(`Insufficient balance. You need ${amount + withdrawNetworkConfig.fee} USDT (including ${withdrawNetworkConfig.fee} USDT fee)`);
      return;
    }
    
    setWithdrawLoading(true);
    
    const success = await requestWithdrawal(amount, withdrawAddress, withdrawNetwork, withdrawNetworkConfig.fee);
    
    if (success) {
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawAmount('');
        setWithdrawAddress('');
      }, 3000);
    } else {
      alert('Failed to submit withdrawal request');
    }
    
    setWithdrawLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get recent transactions
  const recentTransactions = user.transactions?.slice(0, 5) || [];
  const pendingDeposits = user.depositRequests?.filter(d => d.status === 'pending') || [];
  const pendingWithdrawals = user.withdrawalRequests?.filter(w => w.status === 'pending') || [];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-gold transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gold" />
            <span className="text-lg font-bold">Deposit / Withdraw</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      {/* Balance Card */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-gold">{user.balance.toFixed(2)} USDT</p>
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Total Deposits</p>
                  <p className="text-green-400 font-semibold">{user.deposits.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Total Invested</p>
                  <p className="text-blue-400 font-semibold">{user.investments.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Pending</p>
                  <p className="text-yellow-400 font-semibold">{pendingDeposits.length + pendingWithdrawals.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pending Alerts */}
      {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
        <section className="px-4 pt-4">
          <div className="space-y-2">
            {pendingDeposits.map((deposit) => (
              <div key={deposit.id} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-400">Pending Deposit: {deposit.amount} {NETWORKS[deposit.network as keyof typeof NETWORKS]?.token}</p>
                  <p className="text-xs text-gray-400">TX: {deposit.txHash.substring(0, 20)}...</p>
                </div>
              </div>
            ))}
            {pendingWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm text-blue-400">Pending Withdrawal: {withdrawal.amount} USDT</p>
                  <p className="text-xs text-gray-400">To: {withdrawal.address.substring(0, 15)}...</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Tabs */}
      <section className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>

          {/* DEPOSIT TAB */}
          <TabsContent value="deposit" className="mt-4 space-y-4">
            {/* Success Message */}
            {depositSuccess && (
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                <p className="text-green-400 font-semibold text-center">Deposit request submitted successfully!</p>
                <p className="text-sm text-green-400/70 text-center">Your deposit will be processed within 24 hours.</p>
              </div>
            )}

            {/* Network Selection */}
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4">
                <label className="block text-sm text-gray-400 mb-2">Select Network</label>
                <div className="relative">
                  <button
                    onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-gold/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                        selectedNetwork === 'trc20' ? 'from-red-500 to-red-600' :
                        selectedNetwork === 'bep20' ? 'from-yellow-500 to-yellow-600' :
                        selectedNetwork === 'brise' ? 'from-blue-500 to-purple-600' :
                        selectedNetwork === 'usdc' ? 'from-green-500 to-teal-600' :
                        'from-purple-500 to-indigo-600'
                      } flex items-center justify-center text-white font-bold text-sm`}>
                        {networkConfig.token}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{networkConfig.name}</p>
                        <p className="text-xs text-gray-400">{networkConfig.confirmTime} confirmation</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showNetworkDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showNetworkDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] border border-white/10 rounded-lg overflow-hidden z-50">
                      {Object.entries(NETWORKS).map(([key, network]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedNetwork(key);
                            setShowNetworkDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors ${selectedNetwork === key ? 'bg-gold/10' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                            key === 'trc20' ? 'from-red-500 to-red-600' :
                            key === 'bep20' ? 'from-yellow-500 to-yellow-600' :
                            key === 'brise' ? 'from-blue-500 to-purple-600' :
                            key === 'usdc' ? 'from-green-500 to-teal-600' :
                            'from-purple-500 to-indigo-600'
                          } flex items-center justify-center text-white font-bold text-xs`}>
                            {network.token}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold">{network.name}</p>
                            <p className="text-xs text-gray-400">Min: {network.minDeposit} {network.token}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gold">Fee: {network.fee} USDT</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Deposit Address */}
            <Card className="card-gradient border-gold/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-400">Deposit Address ({networkConfig.token})</label>
                  <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {networkConfig.confirmTime}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <code className="flex-1 text-xs text-gold bg-black/30 px-3 py-3 rounded-lg break-all font-mono">
                    {walletAddress}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-3 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="w-40 h-40 bg-white p-3 rounded-xl">
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                      <QrCode className="w-20 h-20 text-gray-500" />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">Scan QR code to deposit {networkConfig.token}</p>
                </div>
              </CardContent>
            </Card>

            {/* Deposit Form */}
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Deposit Amount ({networkConfig.token})
                  </label>
                  <input
                    type="number"
                    placeholder={`Minimum ${networkConfig.minDeposit} ${networkConfig.token}`}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Transaction Hash (TXID)
                  </label>
                  <input
                    type="text"
                    placeholder="Paste your transaction hash here"
                    value={depositTxHash}
                    onChange={(e) => setDepositTxHash(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm text-yellow-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Only send {networkConfig.token} on {networkConfig.name} network. 
                      Sending other tokens will result in permanent loss.
                    </span>
                  </p>
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={depositLoading || !depositAmount || !depositTxHash}
                  className="w-full py-4 rounded-lg gradient-gold text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {depositLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Submit Deposit'
                  )}
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WITHDRAW TAB */}
          <TabsContent value="withdraw" className="mt-4 space-y-4">
            {/* Success Message */}
            {withdrawSuccess && (
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                <p className="text-green-400 font-semibold text-center">Withdrawal request submitted successfully!</p>
                <p className="text-sm text-green-400/70 text-center">Your withdrawal will be processed within 24 hours.</p>
              </div>
            )}

            {/* Network Selection */}
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4">
                <label className="block text-sm text-gray-400 mb-2">Select Network</label>
                <div className="relative">
                  <button
                    onClick={() => setShowWithdrawNetworkDropdown(!showWithdrawNetworkDropdown)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-gold/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                        withdrawNetwork === 'trc20' ? 'from-red-500 to-red-600' :
                        withdrawNetwork === 'bep20' ? 'from-yellow-500 to-yellow-600' :
                        withdrawNetwork === 'brise' ? 'from-blue-500 to-purple-600' :
                        withdrawNetwork === 'usdc' ? 'from-green-500 to-teal-600' :
                        'from-purple-500 to-indigo-600'
                      } flex items-center justify-center text-white font-bold text-sm`}>
                        {withdrawNetworkConfig.token}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{withdrawNetworkConfig.name}</p>
                        <p className="text-xs text-gray-400">Fee: {withdrawNetworkConfig.fee} USDT</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showWithdrawNetworkDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showWithdrawNetworkDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] border border-white/10 rounded-lg overflow-hidden z-50">
                      {Object.entries(NETWORKS).map(([key, network]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setWithdrawNetwork(key);
                            setShowWithdrawNetworkDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors ${withdrawNetwork === key ? 'bg-gold/10' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                            key === 'trc20' ? 'from-red-500 to-red-600' :
                            key === 'bep20' ? 'from-yellow-500 to-yellow-600' :
                            key === 'brise' ? 'from-blue-500 to-purple-600' :
                            key === 'usdc' ? 'from-green-500 to-teal-600' :
                            'from-purple-500 to-indigo-600'
                          } flex items-center justify-center text-white font-bold text-xs`}>
                            {network.token}
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-semibold">{network.name}</p>
                            <p className="text-xs text-gray-400">Min: {network.minWithdraw} USDT</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-red-400">Fee: {network.fee} USDT</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Withdraw Form */}
            <Card className="card-gradient border-white/5">
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Withdrawal Address ({withdrawNetworkConfig.name})
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter your ${withdrawNetworkConfig.name} address`}
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Amount (USDT)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={`Minimum ${withdrawNetworkConfig.minWithdraw} USDT`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => {
                        const maxAmount = Math.max(0, user.balance - withdrawNetworkConfig.fee);
                        setWithdrawAmount(maxAmount.toString());
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gold hover:underline font-semibold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="p-4 rounded-lg bg-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount</span>
                    <span>{withdrawAmount || '0'} USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Network Fee</span>
                    <span className="text-red-400">{withdrawNetworkConfig.fee} USDT</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-gray-400">You will receive</span>
                    <span className="text-gold font-semibold">
                      {Math.max(0, parseFloat(withdrawAmount || '0') - withdrawNetworkConfig.fee).toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400 flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Minimum: {withdrawNetworkConfig.minWithdraw} USDT | Processing: 24 hours | 
                      Please double-check your address before submitting.
                    </span>
                  </p>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !withdrawAmount || !withdrawAddress}
                  className="w-full py-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Submit Withdrawal'
                  )}
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Recent Transactions */}
      <section className="px-4 pt-4 pb-8">
        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-gold" />
                Recent Transactions
              </h3>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gold hover:underline flex items-center gap-1"
              >
                View All
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-green-500/20' :
                        tx.type === 'withdrawal' ? 'bg-red-500/20' :
                        tx.type === 'investment' ? 'bg-blue-500/20' : 'bg-gold/20'
                      }`}>
                        {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5 text-green-400" /> :
                         tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                         tx.type === 'investment' ? <Wallet className="w-5 h-5 text-blue-400" /> :
                         <RefreshCw className="w-5 h-5 text-gold" />}
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
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
