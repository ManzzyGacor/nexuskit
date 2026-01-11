// Kita import supabase dari file config agar session nyambung dengan halaman login
import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2?module'

const SUPABASE_URL = 'https://PROJECT_KAMU.supabase.co'; // GANTI DENGAN URL KAMU
const SUPABASE_KEY = 'KEY_ANON_KAMU'; // GANTI DENGAN KEY KAMU

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Variabel untuk menyimpan data user yang sedang login
let currentUser = null;
let userProfile = null;

// ==========================================
// 1. CEK STATUS LOGIN (SESSION)
// ==========================================
// Kode ini otomatis jalan saat website dibuka
window.onload = async () => {
    console.log("Website Memuat... Mengecek Session...");
    await checkSession();
};

// Fungsi untuk mengecek apakah ada user yang login
async function checkSession() {
    // Cek session dari Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Listener: Kalau user login/logout di tab lain, otomatis update
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
            fetchUserProfile(currentUser.id); // Ambil data role/username
        } else {
            // Kalau logout / session habis
            currentUser = null;
            userProfile = null;
            updateNavUI();   // Reset navbar jadi tombol login
            renderTools();   // Reset tools jadi terkunci
        }
    });
}

// ==========================================
// 2. AMBIL DATA PROFILE USER
// ==========================================
async function fetchUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn("Profile belum siap, menggunakan data sementara.");
            // Fallback jika data belum ada di database (biar gak error)
            userProfile = { 
                username: currentUser.email.split('@')[0], 
                role: 'Member' 
            };
        } else {
            userProfile = data;
        }

        // Setelah data dapat, update tampilan website
        updateNavUI();
        renderTools();

    } catch (err) {
        console.error("Gagal mengambil profile:", err);
    }
}

// ==========================================
// 3. UPDATE TAMPILAN NAVBAR
// ==========================================
function updateNavUI() {
    const navInfo = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');

    // Jika User Sedang Login
    if (currentUser && navInfo) {
        // 1. Sembunyikan tombol Login biasa
        if(loginLink) loginLink.style.display = 'none';

        // 2. Siapkan data untuk ditampilkan
        const name = userProfile ? userProfile.username : 'User';
        const role = userProfile ? userProfile.role : 'Member';

        // 3. Tampilkan Info User di Navbar
        navInfo.classList.remove('hidden');
        navInfo.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="text-align:right;">
                    <span style="color:white; font-size:0.9rem; display:block;">Halo, <b style="color:var(--primary)">${name}</b></span>
                    <span class="badge ${role.toLowerCase()}" style="position:static; padding:2px 8px; font-size:0.65rem;">${role}</span>
                </div>
                <button id="logout-btn" style="background:crimson; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </div>
        `;

        // 4. Aktifkan Tombol Logout
        document.getElementById('logout-btn').addEventListener('click', async () => {
            const confirmLogout = confirm("Apakah anda yakin ingin keluar akun?");
            if(confirmLogout) {
                await supabase.auth.signOut();
                window.location.reload(); // Refresh halaman
            }
        });

    } else {
        // Jika User Belum Login (Guest)
        if(loginLink) loginLink.style.display = 'block'; // Munculkan tombol login
        if(navInfo) navInfo.classList.add('hidden');     // Sembunyikan info user
    }
}

// ==========================================
// 4. DAFTAR TOOLS & RENDER
// ==========================================
const toolsDB = [
    { id: 1, name: "Word Counter", role: "Member", desc: "Hitung jumlah kata dan karakter teks.", icon: "📝" },
    { id: 2, name: "VXZ Unban WA", role: "VIP", desc: "Buka blokir WhatsApp (Auto Email).", icon: "🔓" },
    { id: 3, name: "Database Dumper", role: "VVIP", desc: "Dump SQL Database Injection.", icon: "💾" },
    { id: 4, name: "Admin Panel", role: "Owner", desc: "Kelola User dan Membership.", icon: "👑" }
];

function renderTools() {
    const container = document.getElementById('tools-grid');
    if(!container) return;
    
    container.innerHTML = ''; // Bersihkan isi lama
    
    // Tentukan Level Role User
    const roles = { "Guest": 0, "Member": 1, "VIP": 2, "VVIP": 3, "Owner": 4 };
    const myRole = userProfile ? userProfile.role : "Guest";
    const myLevel = roles[myRole] || 0; 

    // Loop semua tools
    toolsDB.forEach(tool => {
        const requiredLevel = roles[tool.role];
        const isLocked = myLevel < requiredLevel;
        
        // Atur Tampilan Tombol (Terkunci vs Terbuka)
        let btnContent = '';
        let btnStyle = '';
        
        if (isLocked) {
            btnContent = `<i class="fa-solid fa-lock"></i> &nbsp; Terkunci (${tool.role})`;
            btnStyle = 'background:#222; color:#555; border:1px solid #333; cursor:not-allowed;';
        } else {
            btnContent = `Buka Tool 🚀`;
            btnStyle = 'background:linear-gradient(90deg, var(--primary), #00a8a8); color:black; font-weight:bold; cursor:pointer; box-shadow:0 0 10px rgba(0,242,234,0.2);';
        }

        // Buat Elemen Kartu Tool
        const card = document.createElement('div');
        card.className = 'card';
        if(isLocked) card.style.opacity = '0.75'; // Agak transparan kalau terkunci

        card.innerHTML = `
            <div class="badge ${tool.role.toLowerCase()}" style="position:absolute; top:15px; right:15px;">${tool.role} Only</div>
            <div style="font-size:2.5rem; margin-top:10px; margin-bottom:15px;">${tool.icon}</div>
            <h3 style="margin-bottom:10px;">${tool.name}</h3>
            <p style="color:#888; font-size:0.9rem; margin-bottom:20px; line-height:1.5;">${tool.desc}</p>
            <button id="btn-tool-${tool.id}" class="btn" style="width:100%; padding:12px; border-radius:8px; ${btnStyle}">
                ${btnContent}
            </button>
        `;
        container.appendChild(card);

        // Tambahkan Event Klik
        const btnElement = document.getElementById(`btn-tool-${tool.id}`);
        
        if (isLocked) {
            // Kalau terkunci, arahkan ke Pricing saat diklik
            btnElement.addEventListener('click', () => {
                alert(`Fitur ini khusus ${tool.role}. Silahkan upgrade akun anda!`);
                window.location.href = '#pricing';
            });
        } else {
            // Kalau terbuka, jalankan fungsinya
            btnElement.addEventListener('click', () => {
                openTool(tool.id);
            });
        }
    });
}

// ==========================================
// 5. LOGIKA MEMBUKA TOOL
// ==========================================
function openTool(toolId) {
    const activeArea = document.getElementById('active-tool-area');
    activeArea.classList.remove('hidden');
    activeArea.innerHTML = ''; // Reset area
    
    // Tool ID 2: VXZ Unban WA
    if (toolId === 2) {
        // Cek apakah script unban.js sudah termuat
        if(typeof renderUnbanUI === 'function') {
            activeArea.innerHTML = renderUnbanUI();
            
            // Scroll otomatis ke area tool agar user sadar tool sudah terbuka
            const yOffset = -100; 
            const y = activeArea.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({top: y, behavior: 'smooth'});

            // Jalankan logika unban (tombol kirim, dll)
            if(typeof initUnbanLogic === 'function') {
                initUnbanLogic();
            }
        } else {
            activeArea.innerHTML = "<h3 style='text-align:center; padding:20px; color:red;'>⚠️ Error: Script unban.js belum termuat di halaman ini.</h3>";
        }
    } 
    // Tool ID 4: Admin Panel
    else if (toolId === 4) {
        window.location.href = 'admin.html';
    } 
    // Tool Lainnya (Placeholder)
    else {
        activeArea.innerHTML = `
            <div class="glass-panel text-center" style="padding:50px;">
                <h1 style="font-size:3rem; margin-bottom:20px;">🚧</h1>
                <h2 style="color:var(--primary); margin-bottom:10px;">Tool Sedang Maintenance</h2>
                <p>Fitur ini sedang dalam perbaikan dan pengembangan oleh Developer.</p>
                <button onclick="document.getElementById('active-tool-area').classList.add('hidden')" class="btn" style="margin-top:20px; background:#333; color:white;">Tutup Tool</button>
            </div>
        `;
        window.scrollTo({ top: 150, behavior: 'smooth' });
    }
}

// ==========================================
// 6. LOGIKA PEMBELIAN ROLE (WHATSAPP)
// ==========================================
// Fungsi ini dipanggil dari tombol "Beli VIP" di index.html
window.purchaseRole = function(plan, price) {
    // 1. Cek Login Dulu
    if (!currentUser) {
        const confirmLogin = confirm("Maaf, anda harus Login atau Daftar terlebih dahulu untuk membeli paket membership. Menuju halaman login?");
        if(confirmLogin) {
            window.location.href = 'login.html';
        }
        return;
    }

    // 2. Data Owner
    const ownerPhone = "6287756632352"; // GANTI DENGAN NOMOR WA KAMU (Format 628xxx)
    
    // 3. Ambil data user saat ini
    const username = userProfile ? userProfile.username : 'User Baru';
    const email = currentUser.email;

    // 4. Format Pesan WhatsApp (Lengkap & Profesional)
    const text = `
*ORDER UPGRADE MEMBERSHIP* 🚀
Halo Admin Manzzy ID, saya ingin melakukan upgrade akun.

📋 *DETAIL PESANAN:*
━━━━━━━━━━━━━━━━━━
👤 *Username* : ${username}
📧 *Email* : ${email}
💎 *Paket* : ${plan}
💰 *Harga* : Rp ${price}
━━━━━━━━━━━━━━━━━━

Mohon informasikan metode pembayarannya (QRIS / DANA / GOPAY).
Terima kasih!
    `.trim();

    // 5. Buka WhatsApp
    const url = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}