// --- KONFIGURASI SUPABASE ---
// Ganti dengan URL dan ANON KEY dari Dashboard Supabase kamu
const SUPABASE_URL = 'https://otqbggzzgpkpcdddbiho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWJnZ3p6Z3BrcGNkZGRiaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ5MzYsImV4cCI6MjA4MzcyMDkzNn0.UxsI1NGPh4evgB-TzxyAa2NN_rY0HCYXULIh8NppV5o';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE ---
let currentUser = null;
let userProfile = null;

// --- INITIALIZATION ---
window.onload = async () => {
    await checkSession();
};

// 1. Cek Session User
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        // Ambil Data Profile & Role
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        userProfile = data;
        updateNavUI(); // User Login -> Update Navbar
    }
    
    // Render tools setelah tahu role user
    renderTools();
}

// 2. Update Tampilan Navbar (Jika Login)
function updateNavUI() {
    const navInfo = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');

    if (userProfile && navInfo) {
        // Sembunyikan tombol Login
        if(loginLink) loginLink.style.display = 'none';

        // Tampilkan Profil User + Logout
        navInfo.classList.remove('hidden');
        navInfo.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="color:white; font-size:0.9rem;">Hai, <b style="color:var(--primary)">${userProfile.username}</b></span>
                <span class="badge ${userProfile.role.toLowerCase()}" style="position:static;">${userProfile.role}</span>
                <button id="logout-btn" style="background:crimson; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;"><i class="fa-solid fa-power-off"></i></button>
            </div>
        `;

        // Event Listener Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            if(confirm("Yakin ingin logout?")) {
                await supabase.auth.signOut();
                window.location.reload();
            }
        });
    }
}

// 3. Render Tools Grid
const toolsDB = [
    { id: 1, name: "Word Counter", role: "Member", desc: "Hitung kata standar.", icon: "📝" },
    { id: 2, name: "VXZ Unban WA", role: "VIP", desc: "Buka blokir WA (Auto Email).", icon: "🔓" },
    { id: 3, name: "Database Dumper", role: "VVIP", desc: "Dump SQL Database.", icon: "💾" },
    { id: 4, name: "Admin Panel", role: "Owner", desc: "Kelola User.", icon: "👑" }
];

function renderTools() {
    const container = document.getElementById('tools-grid');
    if(!container) return;
    container.innerHTML = '';
    
    const roles = { "Member": 1, "VIP": 2, "VVIP": 3, "Owner": 4 };
    const myRoleLvl = userProfile ? roles[userProfile.role] : 0; 

    toolsDB.forEach(tool => {
        const reqLvl = roles[tool.role];
        const isLocked = myRoleLvl < reqLvl;
        
        const lockIcon = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-rocket"></i>';
        const btnStyle = isLocked ? 'background:#222; color:#555; cursor:not-allowed;' : '';
        const btnId = `tool-btn-${tool.id}`; 

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="badge ${tool.role.toLowerCase()}">${tool.role} Only</div>
            <div style="font-size:3rem; margin-bottom:15px;">${tool.icon}</div>
            <h3 style="margin-bottom:10px;">${tool.name}</h3>
            <p style="color:#888; font-size:0.9rem; margin-bottom:20px;">${tool.desc}</p>
            <button id="${btnId}" class="btn" style="width:100%; ${btnStyle}">${lockIcon} ${isLocked ? 'Terkunci' : 'Buka Tool'}</button>
        `;
        container.appendChild(card);

        // Event Listener Buka Tool
        if (!isLocked) {
            document.getElementById(btnId).addEventListener('click', () => {
                openTool(tool.id);
            });
        }
    });
}

// 4. Logic Buka Tool
function openTool(toolId) {
    const activeArea = document.getElementById('active-tool-area');
    activeArea.classList.remove('hidden');
    activeArea.innerHTML = ''; 

    if (toolId === 2) {
        // VXZ UNBAN WA Logic
        if(typeof renderUnbanUI === 'function') {
            activeArea.innerHTML = renderUnbanUI();
            window.scrollTo({ top: 100, behavior: 'smooth' });
            if(typeof initUnbanLogic === 'function') initUnbanLogic();
        } else {
            activeArea.innerHTML = "<h3 style='text-align:center;'>Script unban belum termuat.</h3>";
        }
    } else if (toolId === 4) {
        window.location.href = 'admin.html';
    } else {
        activeArea.innerHTML = `<div class="card text-center"><h2>🚧 Tool ${toolId} Maintenance</h2></div>`;
    }
}

// 5. Logic Order WhatsApp (Sesuai Permintaan)
window.purchaseRole = function(plan, price) {
    if (!currentUser) {
        alert("Silahkan Login atau Daftar terlebih dahulu untuk membeli paket!");
        // Arahkan ke halaman login
        window.location.href = 'login.html';
        return;
    }

    // GANTI NOMOR WA OWNER DISINI (Format: 628xxx)
    const ownerPhone = "6281234567890"; 
    
    const text = `
Halo Admin Manzzy ID! 👋
Saya ingin upgrade akun saya.

📋 Detail Pesanan:
User: ${userProfile ? userProfile.username : 'User'}
Email: ${currentUser.email}
Plan: ${plan}
Harga: Rp ${price}

Mohon info metode pembayarannya (Qris/Dana/Gopay). Terima kasih!
    `.trim();

    const url = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}