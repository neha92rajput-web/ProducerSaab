const [accountType, setAccountType] = useState('');
const roles = ['Producer', 'Artist', 'Songwriter', 'Engineer', 'Musician', 'DJ', 'Fan'];

// Use this inside your signup form UI:
<div className="space-y-3">
  <label className="text-xs font-black uppercase tracking-widest text-[#A4927A]">Choose your role</label>
  <div className="grid grid-cols-2 gap-2">
    {roles.map((role) => (
      <button
        key={role}
        type="button"
        onClick={() => setAccountType(role)}
        className={`py-2 px-3 text-[10px] font-black uppercase tracking-widest border rounded-full transition ${
          accountType === role 
            ? 'bg-[#191919] text-white border-[#191919]' 
            : 'bg-transparent text-[#191919] border-[#E3DEC1] hover:border-[#191919]'
        }`}
      >
        {role}
      </button>
    ))}
  </div>
</div>
