import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Link2,
  Mail,
  MessageCircle,
  TrendingUp,
  Award,
  Network,
  DollarSign,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

export default function InviteFriends() {
  const navigate = useNavigate();
  const { user, getReferralLink, getTier1Members, getTier2Members, getTier3Members } = useUser();

  const [copied, setCopied] = useState(false);
  const [tier1List, setTier1List] = useState<any[]>([]);
  const [tier2List, setTier2List] = useState<any[]>([]);
  const [tier3List, setTier3List] = useState<any[]>([]);
  const [commissionHistory, setCommissionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTeamData();
  }, [user]);

  const loadTeamData = () => {
    const t1 = getTier1Members();
    const t2 = getTier2Members();
    const t3 = getTier3Members();
    setTier1List(t1);
    setTier2List(t2);
    setTier3List(t3);

    // Get commission history
    if (user?.transactions) {
      const commissions = user.transactions.filter((t: any) => t.type === 'commission');
      setCommissionHistory(commissions);
    }
  };

  const handleCopy = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const link = getReferralLink();
    const text = `Join SEKA and earn up to 65% daily returns! Use my referral code: ${user?.referralCode}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + link)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Join SEKA&body=${encodeURIComponent(text + '\n\n' + link)}`, '_blank');
        break;
      default:
        navigator.clipboard.writeText(link);
        toast.success('Link copied to clipboard!');
    }
  };

  if (!user) return null;

  const referralLink = getReferralLink();
  const totalTeam = (user.tier1Count || 0) + (user.tier2Count || 0) + (user.tier3Count || 0);
  const referralEarnings = user.referralEarnings || 0;

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
            <Users className="w-5 h-5 text-blue-400" />
            My Team
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Stats Overview */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-gradient border-gold/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Ref. Earnings</p>
                  <p className="text-lg font-bold text-gold">${referralEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-gradient border-blue-500/30">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Team</p>
                  <p className="text-lg font-bold text-blue-400">{totalTeam}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3-Tier Commission Info */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-purple-500/30">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              3-Level Commission System
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Crown className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Tier 1</p>
                <p className="text-lg font-bold text-purple-400">14%</p>
                <p className="text-xs text-gray-500">{user.tier1Count || 0} members</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Tier 2</p>
                <p className="text-lg font-bold text-blue-400">3%</p>
                <p className="text-xs text-gray-500">{user.tier2Count || 0} members</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Tier 3</p>
                <p className="text-lg font-bold text-cyan-400">3%</p>
                <p className="text-xs text-gray-500">{user.tier3Count || 0} members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Referral Code & Link */}
      <section className="px-4 pt-4">
        <Card className="card-gradient border-gold/30">
          <CardContent className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-gold" />
              Your Referral Link
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-sm font-bold text-gold bg-black/30 px-3 py-2 rounded-lg truncate">
                {referralLink}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 mb-3">
              <span className="text-sm text-gray-400">Code:</span>
              <code className="flex-1 text-center font-bold text-gold tracking-widest">{user.referralCode}</code>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-xs">Telegram</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-xs">Email</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabs: Team / Commissions */}
      <section className="px-4 pt-4">
        <Tabs defaultValue="team">
          <TabsList className="bg-white/5 w-full">
            <TabsTrigger value="team" className="flex-1">Team Members</TabsTrigger>
            <TabsTrigger value="commissions" className="flex-1">Commissions</TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team" className="mt-4 space-y-3">
            {/* Tier 1 */}
            <Card className="card-gradient border-purple-500/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4 text-purple-400" />
                    Tier 1 - Direct ({tier1List.length})
                  </h4>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">14% commission</Badge>
                </div>
                {tier1List.length > 0 ? (
                  <div className="space-y-2">
                    {tier1List.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-400">{member.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{member.username}</p>
                            <p className="text-xs text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Deposits</p>
                          <p className="text-sm font-semibold text-gold">${(member.deposits || 0).toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">No Tier 1 members yet</p>
                )}
              </CardContent>
            </Card>

            {/* Tier 2 */}
            <Card className="card-gradient border-blue-500/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-blue-400" />
                    Tier 2 - Indirect ({tier2List.length})
                  </h4>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">3% commission</Badge>
                </div>
                {tier2List.length > 0 ? (
                  <div className="space-y-2">
                    {tier2List.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-400">{member.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{member.username}</p>
                            <p className="text-xs text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">No Tier 2 members yet</p>
                )}
              </CardContent>
            </Card>

            {/* Tier 3 */}
            <Card className="card-gradient border-cyan-500/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Tier 3 - Extended ({tier3List.length})
                  </h4>
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">3% commission</Badge>
                </div>
                {tier3List.length > 0 ? (
                  <div className="space-y-2">
                    {tier3List.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-400">{member.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{member.username}</p>
                            <p className="text-xs text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">No Tier 3 members yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="mt-4">
            <Card className="card-gradient border-gold/20">
              <CardContent className="p-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  Commission History
                </h4>
                {commissionHistory.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {commissionHistory.map((tx: any) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gold">+${tx.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">{tx.description}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">{tx.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No commissions yet</p>
                    <p className="text-gray-500 text-sm mt-1">Invite friends to start earning!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="card-gradient border-white/5 mt-3">
              <CardContent className="p-4">
                <h4 className="font-bold mb-3">How Referral Works</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-purple-400">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Share your referral link</p>
                      <p className="text-xs text-gray-400">When someone registers with your code, they become your Tier 1 member.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-400">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Earn on deposits</p>
                      <p className="text-xs text-gray-400">When your Tier 1 member deposits, you earn 14%. Their referrals earn you 3% at Tier 2 and 3% at Tier 3.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-400">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Instant commission</p>
                      <p className="text-xs text-gray-400">All commissions are instantly added to your balance. No waiting!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <div className="h-8" />
    </div>
  );
}
