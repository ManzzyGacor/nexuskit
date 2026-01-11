// --- KONFIGURASI SUPABASE ---
// Ganti dengan URL dan ANON KEY dari Dashboard Supabase kamu
const SUPABASE_URL = 'https://otqbggzzgpkpcdddbiho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWJnZ3p6Z3BrcGNkZGRiaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ5MzYsImV4cCI6MjA4MzcyMDkzNn0.UxsI1NGPh4evgB-TzxyAa2NN_rY0HCYXULIh8NppV5o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE ---
let currentUser = null;
let userProfile = null;
let isLoginMode = true; // Default mode login

// --- TOOLS DATA ---
const toolsDB = [
    { id: 1, name: "Word Counter", role: "Member", desc: "Hitung kata standar.", icon: "📝" },
    { id: 2, name: "Unban WA", role: "VIP", desc: "Buka blokir WA (Auto Email).", icon: "🔓" },
    { id: 3, name: "Database Dumper", role: "VVIP", desc: "Dump SQL Database.", icon: "💾" },
    { id: 4, name: "Admin Panel", role: "Owner", desc: "Kelola User.", icon: "👑" }
];

// --- INITIALIZATION ---
window.onload = async () => {
    console.log("Website Loaded. Checking Session...");
    await checkSession();
};

async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        // Ambil Profile & Role
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
    if(!container) return; // Guard clause
    container.innerHTML = '';
    
    // Hirarki Role
    const roles = { "Member": 1, "VIP": 2, "VVIP": 3, "Owner": 4 };
    const myRoleLvl = userProfile ? roles[userProfile.role] : 0; 

    toolsDB.forEach(tool => {
        const reqLvl = roles[tool.role];
        const isLocked = myRoleLvl < reqLvl;
        
        // Cek icon status
        const lockIcon = isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-rocket"></i>';
        const btnClass = isLocked ? 'background:#222; color:#555; cursor:not-allowed;' : '';
        const btnAction = isLocked ? '' : `onclick="openTool(${tool.id})"`;
        const btnText = isLocked ? 'Terkunci' : 'Buka Tool';

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="badge ${tool.role.toLowerCase()}">${tool.role} Only</div>
            <div style="font-size:3rem; margin-bottom:15px;">${tool.icon}</div>
            <h3 style="margin-bottom:10px;">${tool.name}</h3>
            <p style="color:#888; font-size:0.9rem; margin-bottom:20px;">${tool.desc}</p>
            <button class="btn" style="width:100%; ${btnClass}" ${btnAction}>${lockIcon} ${btnText}</button>
        `;
        container.appendChild(card);
    });
}

function updateNavUI() {
    const navInfo = document.getElementById('user-info');
    const navLinks = document.querySelector('.nav-links'); // Container tombol login

    if (userProfile && navInfo) {
        // Tampilkan Info User & Sembunyikan Tombol Login di Navbar
        navInfo.classList.remove('hidden');
        navInfo.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="color:white; font-size:0.9rem;">Hai, <b style="color:var(--primary)">${userProfile.username}</b></span>
                <span class="badge ${userProfile.role.toLowerCase()}" style="position:static; margin:0;">${userProfile.role}</span>
                <button onclick="handleLogout()" style="background:crimson; border:none; color:white; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:0.8rem;"><i class="fa-solid fa-power-off"></i></button>
            </div>
        `;
        
        // Sembunyikan tombol login di menu
        const loginBtn = document.querySelector("a[onclick*='showAuthModal']");
        if(loginBtn) loginBtn.style.display = 'none';
    }
}

// --- TOOL LOGIC ---
function openTool(toolId) {
    const activeArea = document.getElementById('active-tool-area');
    activeArea.classList.remove('hidden');
    activeArea.innerHTML = ''; 

    if (toolId === 2) {
        // VXZ UNBAN WA
        // Pastikan renderUnbanUI dari unban.js sudah tersedia
        if(typeof renderUnbanUI === 'function') {
            activeArea.innerHTML = renderUnbanUI();
            window.scrollTo({ top: 100, behavior: 'smooth' }); // Scroll sedikit ke bawah
            // Panggil logic
            if(typeof initUnbanLogic === 'function') initUnbanLogic();
        } else {
            activeArea.innerHTML = "<h3 style='text-align:center; color:red;'>Error: Script unban.js belum termuat.</h3>";
        }
    } else if (toolId === 4) {
        window.location.href = 'admin.html';
    } else {
        activeArea.innerHTML = `<div class="card text-center"><h2>🚧 Tool ${toolId} Sedang Maintenance</h2><button class="btn" onclick="this.parentElement.parentElement.classList.add('hidden')" style="margin-top:20px;">Tutup</button></div>`;
    }
}

// --- AUTH FUNCTIONS ---
function showAuthModal(mode) {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.classList.remove('hidden');
    
    // Reset form state
    isLoginMode = true; 
    updateAuthModalUI();
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if(modal) modal.classList.add('hidden');
}

function switchAuthMode() {
    isLoginMode = !isLoginMode;
    updateAuthModalUI();
}

function updateAuthModalUI() {
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const userField = document.getElementById('username');
    const switchText = document.getElementById('auth-switch-text');
    const switchLink = document.querySelector("#auth-modal a");

    if (isLoginMode) {
        title.innerText = "Login Member";
        btn.innerText = "Masuk Sekarang";
        userField.classList.add('hidden');
        switchText.innerText = "Belum punya akun?";
        switchLink.innerText = "Daftar Disini";
    } else {
        title.innerText = "Daftar Baru";
        btn.innerText = "Daftar Akun";
        userField.classList.remove('hidden');
        switchText.innerText = "Sudah punya akun?";
        switchLink.innerText = "Login Disini";
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;

    if (!email || !password) return alert("Email & Password wajib diisi!");

    const btn = document.getElementById('auth-btn');
    btn.innerText = "Loading...";
    btn.disabled = true;

    try {
        if (isLoginMode) {
            // LOGIN
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            location.reload();
        } else {
            // DAFTAR
            if (!username) {
                btn.disabled = false;
                return alert("Username wajib diisi untuk pendaftaran!");
            }
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: username } }
            });
            if (error) throw error;
            
            alert("Berhasil Daftar! Cek email untuk verifikasi (jika aktif) atau coba login.");
            isLoginMode = true;
            updateAuthModalUI();
        }
    } catch (err) {
        alert("Gagal: " + err.message);
    } finally {
        btn.innerText = isLoginMode ? "Masuk Sekarang" : "Daftar Akun";
        btn.disabled = false;
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    location.reload();
}

function purchaseRole(plan, price) {
    if (!currentUser) {
        alert("Eits! Login dulu bosku sebelum beli paket.");
        showAuthModal('login');
        return;
    }

    const ownerPhone = "6281234567890"; // GANTI NOMOR WA KAMU DISINI
    
    const text = `
Halo Admin Manzzy ID! 👋
Saya ingin upgrade akun saya.

📋 Detail Pesanan:
User: ${userProfile ? userProfile.username : 'User'}
Email: ${currentUser.email}
Plan: ${plan}
Harga: Rp ${price}

Mohon info pembayaran.
    `.trim();

    window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(text)}`, '_blank');
}

// --- PENTING: EXPOSE KE GLOBAL (WINDOW) ---
// Ini yang bikin tombol di HTML bisa baca fungsi di file ini
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthMode = switchAuthMode;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.openTool = openTool;
window.purchaseRole = purchaseRole;