// --- KONFIGURASI SUPABASE ---
// Ganti dengan URL dan ANON KEY dari Dashboard Supabase kamu
const SUPABASE_URL = 'https://otqbggzzgpkpcdddbiho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWJnZ3p6Z3BrcGNkZGRiaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ5MzYsImV4cCI6MjA4MzcyMDkzNn0.UxsI1NGPh4evgB-TzxyAa2NN_rY0HCYXULIh8NppV5o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE ---
let currentUser = null;
let userProfile = null;

// --- TOOLS DATA ---
const toolsDB = [
    { id: 1, name: "Word Counter", role: "Member", desc: "Hitung kata standar.", icon: "📝" },
    { id: 2, name: "Unban WA", role: "VIP", desc: "Buka blokir WA (Auto Email).", icon: "🔓" },
    { id: 3, name: "Database Dumper", role: "VVIP", desc: "Dump SQL Database.", icon: "💾" },
    { id: 4, name: "Admin Panel", role: "Owner", desc: "Kelola User.", icon: "👑" }
];

// --- INITIALIZATION ---
window.onload = async () => {
    checkSession();
};

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        // Ambil Profile & Role dari tabel 'profiles'
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if(data) userProfile = data;
        updateNavUI();
    }
    renderTools();
}

// --- UI RENDERING ---
function renderTools() {
    const container = document.getElementById('tools-grid');
    container.innerHTML = '';
    
    // Hirarki Role
    const roles = { "Member": 1, "VIP": 2, "VVIP": 3, "Owner": 4 };
    const myRoleLvl = userProfile ? roles[userProfile.role] : 0; // 0 kalau belum login

    toolsDB.forEach(tool => {
        const reqLvl = roles[tool.role];
        const isLocked = myRoleLvl < reqLvl;
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="badge ${tool.role.toLowerCase()}">${tool.role} Only</div>
            <div style="font-size:3rem; margin-bottom:10px;">${tool.icon}</div>
            <h3>${tool.name}</h3>
            <p style="color:#aaa; font-size:0.9rem;">${tool.desc}</p>
            <br>
            ${isLocked 
                ? `<button class="btn" style="background:#333; color:#666; cursor:not-allowed;">Terkunci 🔒</button>` 
                : `<button class="btn" onclick="openTool(${tool.id})">Buka Tool 🚀</button>`
            }
        `;
        container.appendChild(card);
    });
}

function updateNavUI() {
    const nav = document.getElementById('user-info');
    if (userProfile) {
        nav.innerHTML = `
            <span style="margin-right:15px;">Halo, <b>${userProfile.username}</b> [${userProfile.role}]</span>
            <button class="btn" onclick="handleLogout()" style="background:crimson; box-shadow:none;">Logout</button>
        `;
    }
}

// ... kode sebelumnya ...

function openTool(toolId) {
    const activeArea = document.getElementById('active-tool-area');
    activeArea.classList.remove('hidden');
    activeArea.innerHTML = ''; // Reset

    // Logika menampilkan tool spesifik
    if (toolId === 2) {
        // Render UI
        activeArea.innerHTML = renderUnbanUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // --- PENTING: PANGGIL LOGIC DISINI ---
        initUnbanLogic(); 

    } else if (toolId === 4) {
        activeArea.innerHTML = `<h2>Admin Panel belum dibuat di demo ini.</h2>`;
    } else {
        activeArea.innerHTML = `<h2>Tool ${toolId} Terbuka! (Placeholder)</h2>`;
    }
}

// ... kode setelahnya ...

// --- AUTH LOGIC (SUPABASE) ---
let isLoginMode = true;

function showAuthModal(mode) {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function switchAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const userField = document.getElementById('username');
    const switchText = document.getElementById('auth-switch-text');

    if (isLoginMode) {
        title.innerText = "Login";
        btn.innerText = "Masuk";
        userField.classList.add('hidden');
        switchText.innerText = "Belum punya akun?";
    } else {
        title.innerText = "Daftar Member";
        btn.innerText = "Daftar";
        userField.classList.remove('hidden');
        switchText.innerText = "Sudah punya akun?";
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value; // Cuma dipakai saat daftar

    if (!email || !password) return alert("Isi email dan password!");

    try {
        if (isLoginMode) {
            // LOGIN
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            location.reload();
        } else {
            // DAFTAR
            if (!username) return alert("Isi username!");
            
            // Simpan username di metadata agar bisa diambil trigger SQL
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username: username }
                }
            });
            if (error) throw error;
            alert("Pendaftaran berhasil! Silakan cek email untuk verifikasi (jika aktif) atau langsung login.");
            switchAuthMode();
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

// ... (Kode main.js sebelumnya di atas sini) ...

// --- PAYMENT / ORDER LOGIC ---
function purchaseRole(plan, price) {
    if (!currentUser) {
        alert("Silahkan Login atau Daftar terlebih dahulu untuk membeli paket!");
        showAuthModal('login');
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

async function handleLogout() {
    await supabase.auth.signOut();
    location.reload();
}