// Import Supabase dari config pusat agar session terbaca
import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2?module'

const SUPABASE_URL = 'https://PROJECT_KAMU.supabase.co'; // GANTI DENGAN URL KAMU
const SUPABASE_KEY = 'KEY_ANON_KAMU'; // GANTI DENGAN KEY KAMU

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


let allUsers = [];

// ==========================================
// 1. INIT & CEK SECURITY
// ==========================================
window.onload = async () => {
    console.log("Admin Panel Loaded...");
    
    // Cek apakah ada user login?
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        alert("⚠️ Anda belum login! Silahkan login dulu.");
        window.location.href = 'login.html';
        return;
    }

    // Cek apakah User ini OWNER?
    const user = session.user;
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'Owner') {
        document.body.innerHTML = `
            <div style="display:flex; height:100vh; justify-content:center; align-items:center; flex-direction:column; color:white;">
                <h1 style="color:crimson; font-size:3rem;">⛔ AKSES DITOLAK</h1>
                <p>Anda bukan Owner. Pergi sana!</p>
                <a href="index.html" style="color:var(--primary); margin-top:20px;">Kembali ke Home</a>
            </div>
        `;
        return;
    }

    // Jika Lolos semua, ambil data user
    fetchUsers();
};

// ==========================================
// 2. FETCH DATA USERS
// ==========================================
async function fetchUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert("Error Fetch: " + error.message);
    } else {
        allUsers = data;
        renderTable(allUsers);
    }
}

// ==========================================
// 3. RENDER TABEL (Tampilan)
// ==========================================
function renderTable(users) {
    const tbody = document.getElementById('userTable');
    if(!tbody) return;
    tbody.innerHTML = '';

    users.forEach(user => {
        // Hitung Sisa Hari
        let expiredText = "-";
        let styleStatus = "color:#aaa";

        if (user.expired_at) {
            const daysLeft = Math.ceil((new Date(user.expired_at) - new Date()) / (1000 * 60 * 60 * 24));
            if (daysLeft > 0) {
                expiredText = `${daysLeft} Hari Lagi`;
                styleStatus = "color:#00f2ea; font-weight:bold;";
            } else {
                expiredText = "EXPIRED";
                styleStatus = "color:crimson; font-weight:bold;";
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight:bold; color:white;">${user.username || 'No Name'}</div>
                <div style="font-size:0.7rem; color:#666;">ID: ${user.id.substr(0,8)}...</div>
            </td>
            <td>
                <span class="badge ${user.role.toLowerCase()}" style="padding:4px 8px; border:1px solid #444;">${user.role}</span>
            </td>
            <td style="${styleStatus}">${expiredText}</td>
            <td>
                <select class="role-select" id="role-${user.id}" style="background:#111; color:white; border:1px solid #333; padding:5px;">
                    <option value="Member" ${user.role === 'Member' ? 'selected' : ''}>Member</option>
                    <option value="VIP" ${user.role === 'VIP' ? 'selected' : ''}>VIP</option>
                    <option value="VVIP" ${user.role === 'VVIP' ? 'selected' : ''}>VVIP</option>
                    <option value="Owner" ${user.role === 'Owner' ? 'selected' : ''}>Owner</option>
                </select>
            </td>
            <td>
                <button class="btn-action" data-id="${user.id}" data-action="add30" style="background:#333; color:white; border:none; padding:5px; cursor:pointer;">+30 Hari</button>
                <button class="btn-action" data-id="${user.id}" data-action="reset" style="background:crimson; color:white; border:none; padding:5px; cursor:pointer;">Reset</button>
            </td>
        `;
        tbody.appendChild(tr);

        // Event Listener untuk Select Role
        document.getElementById(`role-${user.id}`).addEventListener('change', (e) => {
            updateRole(user.id, e.target.value);
        });
    });

    // Event Listener untuk Tombol Action (Pakai Delegation biar ringan)
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const uid = e.target.getAttribute('data-id');
            const act = e.target.getAttribute('data-action');
            if(act === 'add30') addDuration(uid, 30);
            if(act === 'reset') resetExpired(uid);
        });
    });
}

// ==========================================
// 4. DATABASE ACTIONS
// ==========================================
async function updateRole(uid, newRole) {
    if(!confirm(`Ubah role user ini jadi ${newRole}?`)) {
        fetchUsers(); return; 
    }
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', uid);
    if(error) alert(error.message);
    else fetchUsers();
}

async function addDuration(uid, days) {
    const user = allUsers.find(u => u.id === uid);
    let newDate = new Date();
    
    // Jika masih aktif, tambah dari tanggal expired terakhir
    if(user.expired_at && new Date(user.expired_at) > new Date()) {
        newDate = new Date(user.expired_at);
    }
    newDate.setDate(newDate.getDate() + days);

    const { error } = await supabase.from('profiles').update({ expired_at: newDate.toISOString() }).eq('id', uid);
    if(error) alert(error.message);
    else { alert(`Berhasil tambah ${days} hari!`); fetchUsers(); }
}

async function resetExpired(uid) {
    if(!confirm("Hapus masa aktif user ini?")) return;
    const { error } = await supabase.from('profiles').update({ expired_at: null }).eq('id', uid);
    if(error) alert(error.message);
    else fetchUsers();
}

// Global Filter Function
window.filterUsers = function() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allUsers.filter(u => u.username && u.username.toLowerCase().includes(term));
    renderTable(filtered);
}