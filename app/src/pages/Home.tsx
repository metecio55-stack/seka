import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Users, 
  User, 
  Download, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Globe,
  HelpCircle,
  Building2,
  BarChart3,
  Gift,
  Handshake,
  Activity,
  Sparkles,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// VIP Plans Data
const vipPlans = [
  { level: 1, min: 10, max: 74, dailyRate: 27, dailyMin: 2.7, dailyMax: 20.25, gradient: 'vip-gradient-1' },
  { level: 2, min: 75, max: 224, dailyRate: 28, dailyMin: 21, dailyMax: 63, gradient: 'vip-gradient-2' },
  { level: 3, min: 225, max: 749, dailyRate: 29, dailyMin: 65.25, dailyMax: 217.5, gradient: 'vip-gradient-3' },
  { level: 4, min: 750, max: 2249, dailyRate: 32, dailyMin: 240, dailyMax: 720, gradient: 'vip-gradient-4' },
  { level: 5, min: 2250, max: 7499, dailyRate: 36, dailyMin: 810, dailyMax: 2700, gradient: 'vip-gradient-5' },
  { level: 6, min: 7500, max: 22499, dailyRate: 45, dailyMin: 3375, dailyMax: 10125, gradient: 'vip-gradient-6' },
  { level: 7, min: 22500, max: 49999, dailyRate: 55, dailyMin: 12375, dailyMax: 27500, gradient: 'vip-gradient-7' },
  { level: 8, min: 50000, max: null, dailyRate: 65, dailyMin: 32500, dailyMax: null, gradient: 'vip-gradient-8' },
];

// Crypto Prices Data
const cryptoPrices = [
  { symbol: 'BTC', name: 'Bitcoin', price: 66942.30, change: 0.27 },
  { symbol: 'ETH', name: 'Ethereum', price: 2048.84, change: -0.35 },
  { symbol: 'BNB', name: 'BNB', price: 589.60, change: 0.88 },
  { symbol: 'XRP', name: 'Ripple', price: 1.31, change: -0.39 },
  { symbol: 'ADA', name: 'Cardano', price: 0.24, change: -0.41 },
  { symbol: 'SOL', name: 'Solana', price: 80.18, change: 0.41 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.09, change: -0.46 },
  { symbol: 'DOT', name: 'Polkadot', price: 1.24, change: -0.64 },
  { symbol: 'LTC', name: 'Litecoin', price: 53.16, change: 0.61 },
  { symbol: 'TRX', name: 'TRON', price: 0.32, change: 1.35 },
  { symbol: 'SHIB', name: 'Shiba Inu', price: 0.00000588, change: -2.16 },
  { symbol: 'AVAX', name: 'Avalanche', price: 8.86, change: -0.69 },
];

// Recent Transactions Data
const recentTransactions = [
  { email: 'a***h0ojw@live.com', amount: 369.60 },
  { email: 'a***rv0zu@gmail.com', amount: 22.55 },
  { email: '+27****86', amount: 258.79 },
  { email: 'b***cfocd@nate.com', amount: 237.10 },
  { email: '+60****97', amount: 61.29 },
  { email: '+13****26', amount: 273.92 },
  { email: 'm***82xhx@nate.com', amount: 388.80 },
  { email: '+63****14', amount: 445.75 },
  { email: 's***zducx@yahoo.com', amount: 405.66 },
  { email: '+71****24', amount: 193.39 },
];

// Navigation Items
const navItems = [
  { icon: Home, label: 'Home', active: true },
  { icon: TrendingUp, label: 'Quantify', active: false },
  { icon: Users, label: 'Invite Friends', active: false },
  { icon: User, label: 'Me', active: false },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toExponential(4);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleProtectedAction = () => {
    setShowLoginDialog(true);
  };

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
              <span>English</span>
            </button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10 text-sm"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 pt-6">
        <Card className="card-gradient border-gold/30 overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-gold">SEKA</span> Investment Platform
              </h1>
              <p className="text-gray-400 mb-6">Earn up to 65% daily returns with our VIP plans</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/register')}
                  className="gradient-gold text-black font-bold px-8"
                >
                  Get Started
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-6 pt-4">
          {/* Launch Announcement */}
          <section className="px-4">
            <Card className="card-gradient border-gold/20 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-gold font-semibold mb-1">Platform Launch Announcement</h2>
                    <p className="text-sm text-gray-300">
                      SEKA official website will officially launch globally on <span className="text-gold font-semibold">March 27, 2026</span>!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Action Buttons */}
          <section className="px-4">
            <div className="grid grid-cols-4 gap-3">
              <Button 
                onClick={handleProtectedAction}
                className="flex flex-col items-center gap-2 h-auto py-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-400 hover:to-green-500"
              >
                <Wallet className="w-6 h-6" />
                <span className="text-xs">Recharge</span>
              </Button>
              <Button 
                onClick={handleProtectedAction}
                className="flex flex-col items-center gap-2 h-auto py-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500"
              >
                <ArrowDownRight className="w-6 h-6" />
                <span className="text-xs">Withdraw</span>
              </Button>
              <Button 
                onClick={handleProtectedAction}
                className="flex flex-col items-center gap-2 h-auto py-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500"
              >
                <Users className="w-6 h-6" />
                <span className="text-xs">Team</span>
              </Button>
              <Button className="flex flex-col items-center gap-2 h-auto py-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500">
                <Download className="w-6 h-6" />
                <span className="text-xs">Download APP</span>
              </Button>
            </div>
          </section>

          {/* Quick Links */}
          <section className="px-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleProtectedAction}
                variant="outline" 
                className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
              >
                <Handshake className="w-4 h-4 mr-2" />
                Agent Cooperation
              </Button>
              <Button 
                onClick={handleProtectedAction}
                variant="outline" 
                className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
              >
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </Button>
            </div>
          </section>

          {/* Collapsible Sections */}
          
          {/* Team Recharge Rebates */}
          <section className="px-4">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-0">
                <button 
                  onClick={() => toggleSection('rebates')}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold" />
                    Team Recharge Rebates
                  </h3>
                  {expandedSection === 'rebates' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'rebates' && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Badge className="gradient-gold text-black font-bold">Lv.1</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Level 1 Referral Commission Rate: <span className="text-gold">14%</span></p>
                        <p className="text-xs text-gray-400 mt-1">For every direct referral who recharges 1000 USDT, receive 140 USDT rebate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Badge className="bg-blue-500 text-white font-bold">Lv.2</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Level 2 Referral Commission Rate: <span className="text-blue-400">3%</span></p>
                        <p className="text-xs text-gray-400 mt-1">For every Level 2 referral who recharges 1000 USDT, receive 30 USDT rebate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Badge className="bg-purple-500 text-white font-bold">Lv.3</Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Level 3 Referral Commission Rate: <span className="text-purple-400">3%</span></p>
                        <p className="text-xs text-gray-400 mt-1">For every Level 3 referral who recharges 1000 USDT, receive 30 USDT rebate</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Agent Salaries */}
          <section className="px-4">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-0">
                <button 
                  onClick={() => toggleSection('salaries')}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Handshake className="w-5 h-5 text-gold" />
                    Agent Salaries
                  </h3>
                  {expandedSection === 'salaries' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'salaries' && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
                        <p className="text-2xl font-bold text-blue-400">22 USDT</p>
                        <p className="text-xs text-gray-400 mt-1">30 Team Members</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
                        <p className="text-2xl font-bold text-green-400">55 USDT</p>
                        <p className="text-xs text-gray-400 mt-1">70 Team Members</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
                        <p className="text-2xl font-bold text-yellow-400">111 USDT</p>
                        <p className="text-xs text-gray-400 mt-1">150 Team Members</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30">
                        <p className="text-2xl font-bold text-red-400">222 USDT</p>
                        <p className="text-xs text-gray-400 mt-1">350 Team Members</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">Salaries are settled daily. Contact customer service for details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Lucky Chest Rules */}
          <section className="px-4">
            <Card className="card-gradient border-gold/20">
              <CardContent className="p-0">
                <button 
                  onClick={() => toggleSection('chest')}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold" />
                    Lucky Chest Rules
                  </h3>
                  {expandedSection === 'chest' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'chest' && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-300 mb-4">Prizes range from <span className="text-gold font-bold">$10 to $200</span>. Minimum recharge of $750 grants one chance!</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                        <span>Accumulated recharge of $750 grants <span className="text-gold font-semibold">1 chance</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                        <span>Accumulated recharge of $2,250 grants <span className="text-gold font-semibold">3 additional chances</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                        <span>Accumulated deposit of $7,500 grants <span className="text-gold font-semibold">10 additional chances</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gold" />
                        <span>Accumulate $22,500 to receive <span className="text-gold font-semibold">30 additional chances</span></span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* VIP Investment Plans */}
          <section className="px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <h3 className="text-lg font-bold">VIP Investment Plans</h3>
              </div>
            </div>
            <div className="space-y-3">
              {vipPlans.map((plan) => (
                <Card 
                  key={plan.level} 
                  className={`${plan.gradient} border-0 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={handleProtectedAction}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-xl font-bold">VIP{plan.level}</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            Invest {plan.min}-{plan.max ? plan.max.toLocaleString() : '+'} USDT
                          </p>
                          <p className="text-sm opacity-90">
                            Daily Income: {plan.dailyRate}% ({plan.dailyMin}-{plan.dailyMax ? plan.dailyMax.toLocaleString() : '+'} USDT)
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 opacity-70" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Referral System */}
          <section className="px-4">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-0">
                <button 
                  onClick={() => toggleSection('referral')}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-gold" />
                    Referral System
                  </h3>
                  {expandedSection === 'referral' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'referral' && (
                  <div className="px-4 pb-4 space-y-4">
                    <p className="text-sm text-gray-300">Users can get different levels of rebates by recommending others to recharge: <span className="text-gold font-bold">14%-3%-3%</span></p>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500">
                        <p className="font-semibold text-yellow-400 mb-1">Level 1 (Direct Invite): Earn 14%</p>
                        <p className="text-xs text-gray-400">If you invite 3 users and each deposits 1,000 USDT: 3 × 1,000 × 14% = <span className="text-yellow-400 font-bold">420 USDT</span></p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-transparent border-l-4 border-blue-500">
                        <p className="font-semibold text-blue-400 mb-1">Level 2 (Their Invite): Earn 3%</p>
                        <p className="text-xs text-gray-400">If each of those 3 users invites 2 others who deposit 500 USDT: 3 × 2 × 500 × 3% = <span className="text-blue-400 font-bold">90 USDT</span></p>
                      </div>
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-transparent border-l-4 border-purple-500">
                        <p className="font-semibold text-purple-400 mb-1">Level 3 (Extended Team): Earn 3%</p>
                        <p className="text-xs text-gray-400">If those 6 invite another 2 each (12 people), each depositing 300 USDT: 12 × 300 × 3% = <span className="text-purple-400 font-bold">108 USDT</span></p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gold/10 border border-gold/30 text-center">
                      <p className="text-gold font-bold">Total Team Reward = 618 USDT — all from your network!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Footer Links */}
          <section className="px-4">
            <div className="grid grid-cols-3 gap-3">
              <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 text-gray-400 hover:text-white hover:bg-white/5">
                <HelpCircle className="w-6 h-6" />
                <span className="text-xs">Help Center</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 text-gray-400 hover:text-white hover:bg-white/5">
                <Building2 className="w-6 h-6" />
                <span className="text-xs">Company Profile</span>
              </Button>
              <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto py-4 text-gray-400 hover:text-white hover:bg-white/5">
                <BarChart3 className="w-6 h-6" />
                <span className="text-xs">Real-Time Quotes</span>
              </Button>
            </div>
          </section>

          {/* Exchange Partners */}
          <section className="px-4">
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-yellow-500 font-bold text-xs">BN</span>
                </div>
                <span className="text-xs text-gray-400">BINANCE</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-xs">OK</span>
                </div>
                <span className="text-xs text-gray-400">OKX</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-500 font-bold text-xs">HB</span>
                </div>
                <span className="text-xs text-gray-400">HUOBI</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-xs">CB</span>
                </div>
                <span className="text-xs text-gray-400">COINBASE</span>
              </div>
            </div>
          </section>

          {/* Crypto Prices Table */}
          <section className="px-4">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-0">
                <button 
                  onClick={() => toggleSection('prices')}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gold" />
                    Real-Time Crypto Prices
                  </h3>
                  {expandedSection === 'prices' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'prices' && (
                  <div className="px-4 pb-4 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b border-white/10">
                          <th className="text-left py-2">Currency</th>
                          <th className="text-right py-2">Latest Price($)</th>
                          <th className="text-right py-2">24h Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cryptoPrices.map((crypto) => (
                          <tr key={crypto.symbol} className="border-b border-white/5 last:border-0">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{crypto.symbol}</span>
                                <span className="text-xs text-gray-400">/USDT</span>
                              </div>
                            </td>
                            <td className="text-right py-3 font-mono">{formatPrice(crypto.price)}</td>
                            <td className="text-right py-3">
                              <span className={`${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'} font-mono`}>
                                {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Safe Operation Stats */}
          <section className="px-4">
            <Card className="card-gradient border-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">Safe Operation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">9 Days</span>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-400 mb-2">Cumulative Income</p>
                  <p className="text-3xl font-bold text-gold">413,281 USDT</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recent Transactions */}
          <section className="px-4 pb-4">
            <Card className="card-gradient border-white/5">
              <CardContent className="p-0">
                <button 
                  onClick={() => toggleSection('transactions')}
                  className="w-full flex items-center justify-between p-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gold" />
                    Recent Transactions
                  </h3>
                  {expandedSection === 'transactions' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSection === 'transactions' && (
                  <div className="px-4 pb-4 space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                    {recentTransactions.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          </div>
                          <span className="text-sm text-gray-300">{tx.email}</span>
                        </div>
                        <span className="text-green-400 font-semibold">+{tx.amount.toFixed(2)} USDT</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <section className="px-4 pb-8">
            <Separator className="mb-4" />
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span>support@SEKA.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              © 2026 SEKA. All rights reserved.
            </p>
          </section>
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/5">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveTab(item.label);
                if (item.label !== 'Home') {
                  handleProtectedAction();
                }
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === item.label 
                  ? 'text-gold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <item.icon className={`w-6 h-6 ${activeTab === item.label ? 'text-gold' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-[#1a1f2e] border-gold/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gold text-center">
              Sign In Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-gray-400">
              Please sign in or create an account to access this feature.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="flex-1 gradient-gold text-black font-bold"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
