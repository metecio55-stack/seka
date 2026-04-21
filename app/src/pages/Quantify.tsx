import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  TrendingUp,
  ArrowLeft,
  Activity,
  Sparkles,
  Timer,
  CheckCircle,
  AlertCircle,
  Lock,
  Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

export default function Quantify() {
  const navigate = useNavigate();
  const { user, quantify } = useUser();
  
  const [isQuantifying, setIsQuantifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownText, setCooldownText] = useState('');
  const [lastProfit, setLastProfit] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check cooldown on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    checkCooldown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [user]);

  const checkCooldown = () => {
    if (!user?.lastQuantifyTime) {
      setCooldownActive(false);
      return;
    }

    const now = Date.now();
    const lastQuantify = new Date(user.lastQuantifyTime).getTime();
    const cooldownMs = 24 * 60 * 60 * 1000;
    const remainingMs = cooldownMs - (now - lastQuantify);

    if (remainingMs > 0) {
      setCooldownActive(true);
      updateCooldownText(remainingMs);
      
      // Start countdown timer
      if (cooldownRef.current) clearInterval(cooldownRef.current);
      cooldownRef.current = setInterval(() => {
        const currentRemaining = cooldownMs - (Date.now() - lastQuantify);
        if (currentRemaining <= 0) {
          setCooldownActive(false);
          if (cooldownRef.current) clearInterval(cooldownRef.current);
        } else {
          updateCooldownText(currentRemaining);
        }
      }, 1000);
    } else {
      setCooldownActive(false);
    }
  };

  const updateCooldownText = (remainingMs: number) => {
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    setCooldownText(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleQuantify = async () => {
    if (cooldownActive || isQuantifying) return;
    
    // First check if quantify is allowed
    const result = await quantify();
    if (!result.success) {
      toast.error(result.message);
      setCooldownActive(true);
      checkCooldown();
      return;
    }

    setIsQuantifying(true);
    setProgress(0);
    setShowSuccess(false);
    
    // Animate progress for 10 seconds
    const duration = 10000; // 10 seconds
    const steps = 100;
    const stepDuration = duration / steps;
    let currentStep = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);
      
      if (currentStep >= steps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsQuantifying(false);
        setShowSuccess(true);
        if (result.profit) {
          setLastProfit(result.profit);
          toast.success(`Quantify completed! +$${result.profit.toFixed(2)} USDT added to your balance.`);
        }
        setCooldownActive(true);
        checkCooldown();
        
        // Hide success after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, stepDuration);
  };

  if (!user) return null;

  // Check if user has made a real deposit (deposits > 10 means they deposited beyond the welcome bonus)
  const hasDeposited = user.deposits > 10 || user.transactions?.some((t: any) => t.type === 'deposit' && t.status === 'completed');
  const potentialProfit = user.balance * 0.27;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quantify
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Balance Card */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-yellow-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-gold">{user.balance.toFixed(2)} USDT</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">+27% Daily Boost</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 27% Badge */}
      <section className="px-4 pt-3">
        <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-500/30">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-bold text-lg">+27%</span>
          <span className="text-gray-300 text-sm">Daily Profit Boost</span>
        </div>
      </section>

      {/* Quantify Button Area */}
      <section className="px-4 pt-6">
        <div className="relative flex flex-col items-center">
          {/* Main Quantify Button */}
          <button
            onClick={handleQuantify}
            disabled={cooldownActive || isQuantifying || !hasDeposited}
            className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
              !hasDeposited
                ? 'bg-gray-800 cursor-not-allowed opacity-40 border-2 border-dashed border-gray-600'
                : cooldownActive || isQuantifying
                ? 'bg-gray-800 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-yellow-500/30'
            }`}
          >
            {isQuantifying ? (
              <div className="flex flex-col items-center">
                <Activity className="w-10 h-10 text-white animate-pulse mb-2" />
                <span className="text-white font-bold text-lg">Quantifying...</span>
                <span className="text-white/80 text-sm mt-1">{Math.round(progress)}%</span>
              </div>
            ) : showSuccess ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-400 mb-2" />
                <span className="text-green-400 font-bold text-lg">Completed!</span>
                <span className="text-green-300 text-sm">+${lastProfit.toFixed(2)}</span>
              </div>
            ) : cooldownActive ? (
              <div className="flex flex-col items-center">
                <Clock className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-gray-400 font-bold text-sm">Cooldown</span>
                <span className="text-gray-500 text-xs mt-1">24h limit</span>
              </div>
            ) : !hasDeposited ? (
              <div className="flex flex-col items-center">
                <Lock className="w-10 h-10 text-gray-500 mb-2" />
                <span className="text-gray-500 font-bold text-sm">LOCKED</span>
                <span className="text-gray-600 text-xs mt-1">Deposit first</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Zap className="w-12 h-12 text-white mb-2" />
                <span className="text-white font-bold text-xl">QUANTIFY</span>
                <span className="text-white/80 text-xs mt-1">Tap to earn 27%</span>
              </div>
            )}

            {/* Progress Ring */}
            {isQuantifying && (
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 192 192">
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="90"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </button>

          {/* Progress Bar */}
          {isQuantifying && (
            <div className="w-full max-w-xs mt-6">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                Quantifying your assets... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Deposit Required Warning */}
          {!hasDeposited && !isQuantifying && (
            <div className="mt-6 text-center w-full max-w-sm">
              <Card className="card-gradient border-red-500/30">
                <CardContent className="p-4 flex flex-col items-center">
                  <Lock className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-red-400 font-semibold">Quantify Locked</p>
                  <p className="text-gray-400 text-sm mt-1">
                    You need to make a deposit first to unlock the quantify feature.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Welcome bonus ($5) does not count. Make a real deposit to activate.
                  </p>
                  <button
                    onClick={() => navigate('/deposit-withdraw')}
                    className="mt-3 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center gap-2 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    Go to Deposit
                  </button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cooldown Timer */}
          {cooldownActive && !isQuantifying && hasDeposited && (
            <div className="mt-6 text-center">
              <Card className="card-gradient border-gray-500/30">
                <CardContent className="p-4 flex flex-col items-center">
                  <Timer className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm">Next quantify available in</p>
                  <p className="text-3xl font-bold text-gold font-mono mt-1">{cooldownText}</p>
                  <p className="text-xs text-gray-500 mt-2">You can quantify once every 24 hours</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-4 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Quantify Successful!</p>
                <p className="text-green-300 text-sm">+${lastProfit.toFixed(2)} USDT added</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Info Cards */}
      <section className="px-4 pt-6 space-y-3">
        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold">27% Daily Boost</h3>
                <p className="text-sm text-gray-400">
                  Quantify once every 24 hours to earn a 27% profit on your current balance.
                </p>
                <p className="text-sm text-yellow-400 mt-1">
                  Potential profit: <span className="font-bold">+${potentialProfit.toFixed(2)} USDT</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">24 Hour Cooldown</h3>
                <p className="text-sm text-gray-400">
                  After each quantify, you must wait 24 hours before you can quantify again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">How It Works</h3>
                <p className="text-sm text-gray-400">
                  Tap the QUANTIFY button and wait 10 seconds while we process your daily boost. 
                  Your profit is instantly added to your balance!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {user.lastQuantifyTime && (
          <Card className="card-gradient border-white/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Last Quantify</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(user.lastQuantifyTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Bottom padding */}
      <div className="h-8" />
    </div>
  );
}
