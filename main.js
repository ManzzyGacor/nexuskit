import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2?module'

// --- KONFIGURASI SUPABASE ---
// PASTIKAN URL DAN KEY SAMA PERSIS DENGAN YANG DI LOGIN.JS
const SUPABASE_URL = 'https://otqbggzzgpkpcdddbiho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWJnZ3p6Z3BrcGNkZGRiaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ5MzYsImV4cCI6MjA4MzcyMDkzNn0.UxsI1NGPh4evgB-TzxyAa2NN_rY0HCYXULIh8NppV5o';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE ---
let currentUser = null;
let userProfile = null;

// --- AUTH LISTENER (Jantungnya Session) ---
// Kode ini otomatis jalan setiap kali status login berubah (Login/Logout/Refresh)
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth Event:", event); // Cek di Console Browser (F12)

    if (session) {
        currentUser = session.user;
        await fetchUserProfile(currentUser.id);
    } else {
        currentUser = null;
        userProfile = null;
        renderTools(); // Render ulang tools dalam mode terkunci (Guest)
        updateNavUI();
    }
});

// --- FUNGSI AMBIL DATA PROFILE ---
async function fetchUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn("Profile belum siap/error:", error.message);
            // Fallback sementara jika profile belum ke-create oleh Trigger
            userProfile = { 
                username: currentUser.email.split('@')[0], 
                role: 'Member' 
            }; 
        } else {
            userProfile = data;
        }

        updateNavUI();
        renderTools();

    } catch (err) {
        console.error("Gagal load profile:", err);
    }
}

// --- UPDATE TAMPILAN NAVBAR ---
function updateNavUI() {
    const navInfo = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');

    if (currentUser && navInfo) {
        // Sembunyikan tombol Login
        if(loginLink) loginLink.style.display = 'none';

        // Nama & Role (Pakai fallback jika profile null)
        const name = userProfile ? userProfile.username : 'User';
        const role = userProfile ? userProfile.role : 'Member';

        // Tampilkan Profil User
        navInfo.classList.remove('hidden');
        navInfo.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="text-align:right; line-height:1.2;">
                    <span style="color:white; font-size:0.85rem; display:block;">Halo, <b style="color:var(--primary)">${name}</b></span>
                    <span class="badge ${role.toLowerCase()}" style="position:static; padding:2px 8px; font-size:0.65rem;">${role}</span>
                </div>
                <button id="logout-btn" style="background:rgba(220, 20, 60, 0.2); border:1px solid crimson; color:crimson; width:35px; height:35px; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:0.3s;">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </div>
        `;

        // Event Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            if(confirm("Yakin ingin logout?")) {
                await supabase.auth.signOut();
                window.location.reload();
            }
        });
    } else {
        // Jika Guest, pastikan tombol Login muncul
        if(loginLink) loginLink.style.display = 'block';
        if(navInfo) navInfo.classList.add('hidden');
    }
}

// --- RENDER TOOLS GRID ---
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
    
    // Default Guest = Level 0
    const roles = { "Guest": 0, "Member": 1, "VIP": 2, "VVIP": 3, "Owner": 4 };
    const myRole = userProfile ? userProfile.role : "Guest";
    const myRoleLvl = roles[myRole] || 0; 

    toolsDB.forEach(tool => {
        const reqLvl = roles[tool.role];
        const isLocked = myRoleLvl < reqLvl;
        
        const lockIcon = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-rocket"></i>';
        
        // Style Tombol: Jika Locked warnanya gelap
        const btnStyle = isLocked 
            ? 'background:#1a1a1a; color:#555; border:1px solid #333; cursor:not-allowed;' 
            : 'background:linear-gradient(90deg, var(--primary), #00a8a8); color:black; cursor:pointer; box-shadow:0 0 10px rgba(0,242,234,0.2);';
            
        const btnId = `tool-btn-${tool.id}`; 
        const btnText = isLocked ? `Unlock ${tool.role}` : 'Buka Tool';

        const card = document.createElement('div');
        card.className = 'card';
        // Tambahkan efek visual jika terkunci
        if(isLocked) card.style.opacity = '0.7';

        card.innerHTML = `
            <div class="badge ${tool.role.toLowerCase()}" style="top:10px; right:10px;">${tool.role}</div>
            <div style="font-size:2.5rem; margin-bottom:15px; margin-top:10px;">${tool.icon}</div>
            <h3 style="margin-bottom:5px; font-size:1.1rem;">${tool.name}</h3>
            <p style="color:#777; font-size:0.85rem; margin-bottom:20px; line-height:1.4;">${tool.desc}</p>
            <button id="${btnId}" class="btn" style="width:100%; font-size:0.85rem; padding:10px; ${btnStyle}">
                ${lockIcon} &nbsp; ${btnText}
            </button>
        `;
        container.appendChild(card);

        // Event Listener: Hanya aktif jika TIDAK terkunci
        if (!isLocked) {
            document.getElementById(btnId).addEventListener('click', () => {
                openTool(tool.id);
            });
        } else {
            // Jika diklik saat terkunci -> Arahkan ke Pricing
            document.getElementById(btnId).addEventListener('click', () => {
                window.location.href = '#pricing';
            });
        }
    });
}

// --- LOGIC BUKA TOOL ---
function openTool(toolId) {
    const activeArea = document.getElementById('active-tool-area');
    activeArea.classList.remove('hidden');
    activeArea.innerHTML = ''; 

    if (toolId === 2) {
        // VXZ UNBAN WA Logic
        if(typeof renderUnbanUI === 'function') {
            activeArea.innerHTML = renderUnbanUI();
            window.scrollTo({ top: 120, behavior: 'smooth' }); // Auto scroll ke tool
            if(typeof initUnbanLogic === 'function') initUnbanLogic();
        } else {
            activeArea.innerHTML = "<h3 style='text-align:center; padding:20px;'>⚠️ Script unban.js belum termuat!</h3>";
        }
    } else if (toolId === 4) {
        window.location.href = 'admin.html';
    } else {
        // Placeholder tool lain
        activeArea.innerHTML = `
            <div class="glass-panel text-center" style="padding:40px;">
                <h1 style="font-size:3rem;">🚧</h1>
                <h2 style="color:var(--primary); margin:10px 0;">Tool Sedang Maintenance</h2>
                <p>Fitur ini sedang dalam perbaikan oleh Manzzy ID.</p>
                <button onclick="document.getElementById('active-tool-area').classList.add('hidden')" class="btn" style="margin-top:20px; background:#333; color:white;">Tutup</button>
            </div>
        `;
        window.scrollTo({ top: 120, behavior: 'smooth' });
    }
}

// --- ORDER WHATSAPP LOGIC ---
window.purchaseRole = function(plan, price) {
    if (!currentUser) {
        if(confirm("Anda harus Login dulu untuk upgrade akun. Mau login sekarang?")) {
            window.location.href = 'login.html';
        }
        return;
    }

    // GANTI NOMOR WA OWNER
    const ownerPhone = "6281234567890"; 
    
    const text = `
*ORDER UPGRADE NEXUSKIT* 🚀
Halo Admin Manzzy ID!

👤 User: ${userProfile ? userProfile.username : currentUser.email}
📧 Email: ${currentUser.email}
💎 Plan: *${plan}*
💰 Harga: Rp ${price}

Mohon info pembayaran Qris/E-Wallet. Terima kasih!
    `.trim();

    const url = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}