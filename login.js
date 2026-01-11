import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2?module'

// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://otqbggzzgpkpcdddbiho.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cWJnZ3p6Z3BrcGNkZGRiaWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNDQ5MzYsImV4cCI6MjA4MzcyMDkzNn0.UxsI1NGPh4evgB-TzxyAa2NN_rY0HCYXULIh8NppV5o';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DOM ELEMENTS ---
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const userInput = document.getElementById('username');
const submitBtn = document.getElementById('submit-btn');
const switchBtn = document.getElementById('switch-btn');
const formTitle = document.getElementById('form-title');
const switchText = document.getElementById('switch-text');
const errorMsg = document.getElementById('error-msg');

let isLoginMode = true;

// --- EVENT LISTENERS ---
switchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMode();
});

submitBtn.addEventListener('click', async () => {
    await handleAuth();
});

// --- FUNCTIONS ---
function toggleMode() {
    isLoginMode = !isLoginMode;
    errorMsg.style.display = 'none';
    
    if (isLoginMode) {
        formTitle.innerText = "Login Member";
        submitBtn.innerText = "Masuk Sekarang";
        switchText.innerText = "Belum punya akun?";
        switchBtn.innerText = "Daftar Disini";
        userInput.classList.add('hidden');
    } else {
        formTitle.innerText = "Daftar Akun Baru";
        submitBtn.innerText = "Daftar Sekarang";
        switchText.innerText = "Sudah punya akun?";
        switchBtn.innerText = "Login Disini";
        userInput.classList.remove('hidden');
    }
}

async function handleAuth() {
    const email = emailInput.value;
    const password = passInput.value;
    const username = userInput.value;

    // Validasi Sederhana
    if (!email || !password) {
        showError("Email dan Password wajib diisi!");
        return;
    }

    submitBtn.innerText = "Loading...";
    submitBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        if (isLoginMode) {
            // --- LOGIKA LOGIN ---
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Sukses Login -> Redirect ke Index
            window.location.href = "index.html";

        } else {
            // --- LOGIKA DAFTAR ---
            if (!username) {
                showError("Username wajib diisi!");
                submitBtn.disabled = false;
                submitBtn.innerText = "Daftar Sekarang";
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { username: username } // Simpan username ke metadata
                }
            });

            if (error) throw error;

            alert("Pendaftaran Berhasil! Silakan Login.");
            toggleMode(); // Kembali ke mode login
        }
    } catch (err) {
        showError(err.message);
    } finally {
        if(isLoginMode) submitBtn.innerText = "Masuk Sekarang";
        else submitBtn.innerText = "Daftar Sekarang";
        submitBtn.disabled = false;
    }
}

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.style.display = 'block';
}

