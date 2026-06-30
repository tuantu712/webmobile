import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { Address } from '../store/useAuthStore';
import { Edit2, Trash2, MapPin, Plus, User, Mail, Calendar, Phone, Check } from 'lucide-react';

const avatarPresets = [
  'https://html-demo-orcin.vercel.app/mobile/fuzzy/assets/images/icons/profile.png',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
];

export default function Profile() {
  const { user, updateProfile, addAddress, updateAddress, deleteAddress, isLoading } = useAuthStore();

  // Profile Edit fields state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [avatar, setAvatar] = useState(user?.avatar || avatarPresets[0]);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Address dialog state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address form fields state
  const [addrTitle, setAddrTitle] = useState('Home');
  const [addrReceiver, setAddrReceiver] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Name cannot be empty');
      return;
    }
    const success = await updateProfile({ name, phone, birthday, avatar });
    if (success) {
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddrTitle('Home');
    setAddrReceiver(user?.name || '');
    setPhone(user?.phone || '');
    setAddrPhone(user?.phone || '');
    setAddrDetail('');
    setAddrCity('');
    setAddrIsDefault(user?.addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddrTitle(address.title);
    setAddrReceiver(address.receiver);
    setAddrPhone(address.phone);
    setAddrDetail(address.detail);
    setAddrCity(address.city);
    setAddrIsDefault(address.isDefault);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrTitle || !addrReceiver || !addrPhone || !addrDetail || !addrCity) {
      alert('All address fields are required');
      return;
    }

    let success = false;
    if (editingAddress) {
      // Edit mode
      success = await updateAddress({
        id: editingAddress.id,
        title: addrTitle,
        receiver: addrReceiver,
        phone: addrPhone,
        detail: addrDetail,
        city: addrCity,
        isDefault: addrIsDefault
      });
    } else {
      // Create mode
      success = await addAddress({
        title: addrTitle,
        receiver: addrReceiver,
        phone: addrPhone,
        detail: addrDetail,
        city: addrCity,
        isDefault: addrIsDefault
      });
    }

    if (success) {
      setIsAddressModalOpen(false);
    } else {
      alert('Failed to save address details');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(id);
    }
  };

  return (
    <div className="px-6 pt-4 pb-20 select-none animate-fade-in min-h-screen">
      
      {/* Title */}
      <h2 className="text-base font-bold text-white mb-6">Profile Settings</h2>

      {profileSuccessMsg && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-200 text-xs py-3 px-4 rounded-xl">
          {profileSuccessMsg}
        </div>
      )}

      {/* User Information Profile Edit */}
      <form onSubmit={handleUpdateProfile} className="bg-card-dark border border-primary-light/40 rounded-3xl p-5 mb-8 space-y-4">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Personal Information</span>
        
        {/* Avatar Select Presets */}
        <div className="flex flex-col items-center justify-center py-2 gap-3">
          <img 
            src={avatar} 
            alt="selected avatar" 
            className="w-16 h-16 rounded-full border-2 border-accent object-cover shadow-lg shadow-accent/15" 
          />
          <div className="flex gap-2">
            {avatarPresets.map((av, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setAvatar(av)}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                  avatar === av ? 'border-accent scale-105' : 'border-primary-light'
                }`}
              >
                <img src={av} alt="preset" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Full Name</label>
          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-primary-dark/40 border border-primary-light rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none"
              placeholder="Full Name"
            />
            <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          </div>
        </div>

        {/* Email Input (read only) */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 font-sans">Email Address (Locked)</label>
          <div className="relative">
            <input 
              type="email" 
              value={user?.email || ''} 
              readOnly 
              className="w-full bg-primary-dark/20 border border-primary-light/40 rounded-xl py-3 pl-4 pr-10 text-xs text-slate-500 cursor-not-allowed outline-none"
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
          </div>
        </div>

        {/* Phone Input */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
          <div className="relative">
            <input 
              type="text" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-primary-dark/40 border border-primary-light rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none"
              placeholder="Phone Number"
            />
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          </div>
        </div>

        {/* Birthday Input */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Birthday</label>
          <div className="relative">
            <input 
              type="date" 
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              className="w-full bg-primary-dark/40 border border-primary-light rounded-xl py-3 pl-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white text-xs font-semibold py-3 rounded-xl shadow-md transition-all active:scale-98"
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Address Book management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Address Book</span>
          <button 
            onClick={handleOpenAddAddress}
            className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
          >
            <Plus size={14} />
            <span>Add Address</span>
          </button>
        </div>

        {/* Addresses list */}
        {user?.addresses.length === 0 ? (
          <div className="bg-card-dark border border-dashed border-primary-light p-6 text-center rounded-2xl">
            <p className="text-xs text-slate-400">Your address book is empty.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {user?.addresses.map((addr) => (
              <div 
                key={addr.id}
                className="bg-card-dark border border-primary-light/40 rounded-2xl p-4 flex justify-between items-start gap-3"
              >
                <div className="flex gap-2.5 items-start">
                  <MapPin size={18} className="text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{addr.title}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-300 mt-1">{addr.receiver} — {addr.phone}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{addr.detail}, {addr.city}</p>
                  </div>
                </div>

                {/* Edit / Delete actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleOpenEditAddress(addr)}
                    className="p-2 bg-primary-light text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADDRESS MODAL DIALOG */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 animate-fade-in">
          <div className="bg-primary-dark border border-primary-light w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <h3 className="text-sm font-bold text-white mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            
            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Label (e.g. Home, Office)</label>
                <input 
                  type="text" 
                  value={addrTitle}
                  onChange={e => setAddrTitle(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Home"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Receiver Name</label>
                <input 
                  type="text" 
                  value={addrReceiver}
                  onChange={e => setAddrReceiver(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Enter receiver's name"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={addrPhone}
                  onChange={e => setAddrPhone(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Address Details</label>
                <input 
                  type="text" 
                  value={addrDetail}
                  onChange={e => setAddrDetail(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="Street, District"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">City</label>
                <input 
                  type="text" 
                  value={addrCity}
                  onChange={e => setAddrCity(e.target.value)}
                  className="w-full bg-card-dark border border-primary-light rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none" 
                  placeholder="e.g. Ho Chi Minh City"
                />
              </div>

              {/* Set Default */}
              <div className="flex items-center text-xs">
                <button 
                  type="button"
                  onClick={() => setAddrIsDefault(!addrIsDefault)}
                  className="flex items-center gap-2 text-slate-300 select-none hover:text-white"
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    addrIsDefault ? 'border-accent bg-accent text-white' : 'border-slate-600'
                  }`}>
                    {addrIsDefault && <Check size={12} />}
                  </div>
                  <span>Set as default shipping address</span>
                </button>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 bg-card-dark border border-primary-light rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-accent text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
