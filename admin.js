// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://otqbggzzgpkpcdddbiho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWJnZ3p6Z3BrcGNkZGRiaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ5MzYsImV4cCI6MjA4MzcyMDkzNn0.UxsI1NGPh4evgB-TzxyAa2NN_rY0HCYXULIh8NppV5o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATE ---
let allUsers = [];

// --- INIT ---
window.onload = async () => {
    await checkAdminAccess();
    await fetchUsers();
};

// 1. Cek Security (Hanya Owner boleh masuk)
async function checkAdminAccess() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert("Silahkan login dulu!");
        window.location.href = 'index.html';
        return;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'Owner') {
        document.body.innerHTML = "<h1 style='color:white; text-align:center; margin-top:50px;'>⛔ AKSES DITOLAK: Anda bukan Owner.</h1>";
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
}

// 2. Ambil Semua Data User
async function fetchUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        alert("Gagal ambil data: " + error.message);
    } else {
        allUsers = data;
        renderTable(allUsers);
    }
}

// 3. Render Tabel
function renderTable(users) {
    const tbody = document.getElementById('userTable');
    tbody.innerHTML = '';

    users.forEach(user => {
        // Hitung sisa hari
        let expiredText = "-";
        let statusStyle = "color: #aaa;";
        
        if (user.expired_at) {
            const now = new Date();
            const exp = new Date(user.expired_at);
            const diffTime = exp - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 0) {
                expiredText = `${diffDays} Hari Lagi`;
                statusStyle = "color: #00f2ea;"; // Cyan
            } else {
                expiredText = "Expired";
                statusStyle = "color: crimson;";
            }
        }

        const row = `
            <tr>
                <td>
                    <b>${user.username || 'No Name'}</b><br>
                    <span style="font-size:0.7rem; color:#666;">ID: ${user.id.substr(0,8)}...</span>
                </td>
                <td>
                    <span class="badge ${user.role.toLowerCase()}" 
                          style="padding: 2px 8px; border-radius:4px; border:1px solid #444;">
                        ${user.role}
                    </span>
                </td>
                <td style="${statusStyle}">${expiredText}</td>
                <td>
                    <select class="role-select" onchange="updateRole('${user.id}', this.value)">
                        <option value="Member" ${user.role === 'Member' ? 'selected' : ''}>Member</option>
                        <option value="VIP" ${user.role === 'VIP' ? 'selected' : ''}>VIP</option>
                        <option value="VVIP" ${user.role === 'VVIP' ? 'selected' : ''}>VVIP</option>
                        <option value="Owner" ${user.role === 'Owner' ? 'selected' : ''}>Owner</option>
                    </select>
                </td>
                <td>
                    <button class="btn-small" onclick="addDays('${user.id}', 30)">+30 Hari</button>
                    <button class="btn-small" onclick="addDays('${user.id}', 7)">+7 Hari</button>
                    <button class="btn-small" style="background:crimson;" onclick="resetExpired('${user.id}')">Reset</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// 4. Update Role Database
async function updateRole(userId, newRole) {
    if(!confirm(`Ubah role user ini jadi ${newRole}?`)) return fetchUsers(); // Revert jika cancel

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) alert("Gagal update: " + error.message);
    else fetchUsers(); // Refresh tabel
}

// 5. Tambah Durasi Expired
async function addDays(userId, days) {
    // Cari user di data lokal dulu untuk ambil expired lama
    const user = allUsers.find(u => u.id === userId);
    let newExpDate = new Date();

    if (user.expired_at && new Date(user.expired_at) > new Date()) {
        // Jika belum expired, tambah dari tanggal expired terakhir
        newExpDate = new Date(user.expired_at);
    }
    
    // Tambah hari
    newExpDate.setDate(newExpDate.getDate() + days);

    const { error } = await supabase
        .from('profiles')
        .update({ expired_at: newExpDate.toISOString() })
        .eq('id', userId);

    if (error) alert("Gagal tambah hari: " + error.message);
    else {
        alert(`Berhasil tambah ${days} hari!`);
        fetchUsers();
    }
}

// 6. Reset Expired (Jadi null / Member biasa)
async function resetExpired(userId) {
    if(!confirm("Hapus masa aktif user ini?")) return;

    const { error } = await supabase
        .from('profiles')
        .update({ expired_at: null })
        .eq('id', userId);

    if (error) alert("Gagal reset: " + error.message);
    else fetchUsers();
}

// 7. Filter Search
function filterUsers() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.username && u.username.toLowerCase().includes(term))
    );
    renderTable(filtered);
}

