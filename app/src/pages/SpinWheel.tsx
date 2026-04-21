import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  RotateCcw,
  Lock,
  Users,
  Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

export default function SpinWheel() {
  const navigate = useNavigate();
  const { user, updateBalance, addTransaction } = useUser();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [spinRights, setSpinRights] = useState(0);

  const SEGMENTS = 8;
  const PRIZES = [5, 5, 5, 5, 5, 5, 5, 5];
  const COLORS = [
    '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
    '#10b981', '#f97316', '#ec4899', '#6366f1'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSpinRights(user.spinRights || 0);
  }, [user]);

  const handleSpin = () => {
    if (isSpinning || spinRights <= 0) return;

    setIsSpinning(true);
    setShowWin(false);

    const extraSpins = 5 * 360;
    const randomSegment = Math.floor(Math.random() * SEGMENTS);
    const segmentAngle = (360 / SEGMENTS) * randomSegment;
    const finalRotation = rotation + extraSpins + segmentAngle + (360 / SEGMENTS / 2);

    setRotation(finalRotation);

    setTimeout(() => {
      const wonAmount = PRIZES[randomSegment];
      setWinAmount(wonAmount);
      setShowWin(true);
      setIsSpinning(false);

      // Update balance
      updateBalance(wonAmount);

      // Add transaction
      addTransaction({
        type: 'bonus',
        amount: wonAmount,
        status: 'completed',
        description: `Spin Wheel prize - $${wonAmount} USDT`,
      });

      // Decrease spin rights
      const newSpinRights = spinRights - 1;
      setSpinRights(newSpinRights);

      // Update user in storage
      if (user) {
        const updatedUser = { ...user, spinRights: newSpinRights };
        const users = JSON.parse(localStorage.getItem('seka_users') || '[]');
        const index = users.findIndex((u: any) => u.id === user.id);
        if (index !== -1) {
          users[index].spinRights = newSpinRights;
          localStorage.setItem('seka_users', JSON.stringify(users));
        }
        localStorage.setItem('seka_user', JSON.stringify(updatedUser));
      }

      toast.success(`You won $${wonAmount} USDT!`);

      setTimeout(() => setShowWin(false), 3000);
    }, 4000);
  };

  if (!user) return null;

  // Generate SVG wheel segments
  const generateSegments = () => {
    const segments = [];
    const anglePerSegment = 360 / SEGMENTS;
    for (let i = 0; i < SEGMENTS; i++) {
      const startAngle = (anglePerSegment * i * Math.PI) / 180;
      const endAngle = (anglePerSegment * (i + 1) * Math.PI) / 180;
      const x1 = 50 + 40 * Math.cos(startAngle);
      const y1 = 50 + 40 * Math.sin(startAngle);
      const x2 = 50 + 40 * Math.cos(endAngle);
      const y2 = 50 + 40 * Math.sin(endAngle);
      const largeArcFlag = anglePerSegment > 180 ? 1 : 0;

      segments.push(
        <path
          key={i}
          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
          fill={COLORS[i]}
          stroke="#1a1f2e"
          strokeWidth="0.5"
        />
      );
    }
    return segments;
  };

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
            <Gift className="w-5 h-5 text-pink-400" />
            Lucky Spin
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Balance */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-pink-500/30">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Your Balance</p>
              <p className="text-3xl font-bold text-gold">{user.balance.toFixed(2)} USDT</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30">
                <RotateCcw className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-pink-400">{spinRights} spin rights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Spin Wheel */}
      <section className="px-4 pt-6 flex flex-col items-center">
        <div className="relative w-72 h-72">
          {/* Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {generateSegments()}
              <circle cx="50" cy="50" r="8" fill="#1a1f2e" stroke="#d4af37" strokeWidth="1" />
              <text x="50" y="52" textAnchor="middle" fill="#d4af37" fontSize="4" fontWeight="bold">
                SPIN
              </text>
            </svg>
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-lg" />
          </div>
        </div>

        {/* SPIN Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || spinRights <= 0}
          className={`mt-6 px-12 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all ${
            spinRights <= 0
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : isSpinning
              ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 cursor-pointer'
          }`}
        >
          {isSpinning ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              Spinning...
            </>
          ) : spinRights <= 0 ? (
            <>
              <Lock className="w-5 h-5" />
              No Rights
            </>
          ) : (
            <>
              <Gift className="w-5 h-5" />
              SPIN
            </>
          )}
        </button>

        {/* Win Animation */}
        {showWin && (
          <div className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-4 animate-bounce">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-bold text-lg">You Won!</p>
              <p className="text-gold font-bold text-2xl">+${winAmount} USDT</p>
            </div>
          </div>
        )}

        {/* No rights warning */}
        {spinRights <= 0 && !isSpinning && (
          <div className="mt-6 w-full max-w-sm space-y-3">
            <Card className="card-gradient border-red-500/30">
              <CardContent className="p-4 flex flex-col items-center">
                <Lock className="w-8 h-8 text-red-400 mb-2" />
                <p className="text-red-400 font-semibold">No Spin Rights</p>
                <p className="text-gray-400 text-sm mt-1 text-center">
                  Earn spin rights by inviting friends or when your referrals make deposits.
                </p>
              </CardContent>
            </Card>

            <button
              onClick={() => navigate('/invite')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-5 h-5" />
              Invite Friends
            </button>
          </div>
        )}
      </section>

      {/* Info */}
      <section className="px-4 pt-6 space-y-3">
        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold">$5 Per Spin</h3>
                <p className="text-sm text-gray-400">
                  Every spin wins you $5 USDT instantly. Guaranteed prize!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Earn Spin Rights</h3>
                <p className="text-sm text-gray-400">
                  Invite friends with your referral code. Each referral = 1 spin right.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Referral Deposits</h3>
                <p className="text-sm text-gray-400">
                  When your referred friend makes a deposit, you earn 1 additional spin right!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient border-white/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Payout</h3>
                <p className="text-sm text-gray-400">
                  Winnings are added to your balance immediately. No waiting!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="h-8" />
    </div>
  );
}
