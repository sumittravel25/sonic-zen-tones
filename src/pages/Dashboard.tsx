import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, Profile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Volume2, User, Calendar, CreditCard, Edit2, Save, X, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { subscription, isPremium, loading: subLoading } = useSubscription();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    mobile: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        sex: profile.sex || '',
        mobile: profile.mobile || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await updateProfile({
      name: formData.name || null,
      age: formData.age ? parseInt(formData.age) : null,
      sex: formData.sex || null,
      mobile: formData.mobile || null,
    });

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || profileLoading || subLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <Volume2 size={16} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">My Dashboard</h1>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Subscription Status */}
        <div className={`mb-8 p-6 rounded-2xl border ${isPremium ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30' : 'bg-slate-800/40 border-slate-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-slate-700'}`}>
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isPremium ? 'Premium Member' : 'Free Plan'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isPremium && subscription?.end_date
                    ? `Valid until ${new Date(subscription.end_date).toLocaleDateString()}`
                    : 'Upgrade to unlock all frequencies'}
                </p>
              </div>
            </div>
            {isPremium && (
              <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle size={12} /> Active
              </span>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User size={20} />
              Profile Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300">
                {profile?.email || user?.email}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300">
                  {profile?.name || '—'}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Enter your age"
                  min="1"
                  max="150"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300">
                  {profile?.age || '—'}
                </div>
              )}
            </div>

            {/* Sex */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Sex
              </label>
              {isEditing ? (
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300 capitalize">
                  {profile?.sex || '—'}
                </div>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Mobile Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="+91 XXXXX XXXXX"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300">
                  {profile?.mobile || '—'}
                </div>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                Member Since
              </label>
              <div className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-300 flex items-center gap-2">
                <Calendar size={16} />
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
