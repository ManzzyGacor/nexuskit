import { supabase } from './config.js'; // <-- Import dari pusat

// DOM Elements
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const userInput = document.getElementById('username');
const submitBtn = document.getElementById('submit-btn');
const switchBtn = document.getElementById('switch-btn');
const formTitle = document.getElementById('form-title');
const switchText = document.getElementById('switch-text');
const errorMsg = document.getElementById('error-msg');

let isLoginMode = true;

// Event Listeners
if(switchBtn) switchBtn.addEventListener('click', (e) => { e.preventDefault(); toggleMode(); });
if(submitBtn) submitBtn.addEventListener('click', handleAuth);

function toggleMode() {
    isLoginMode = !isLoginMode;
    errorMsg.style.display = 'none';
    
    if (isLoginMode) {
        formTitle.innerText = "Login Member";
        submitBtn.innerText = "Masuk Sekarang";
        switchText.innerText = "Belum punya akun?";
        switchBtn.innerText = "Daftar Disini";
        if(userInput) userInput.classList.add('hidden');
    } else {
        formTitle.innerText = "Daftar Akun Baru";
        submitBtn.innerText = "Daftar Sekarang";
        switchText.innerText = "Sudah punya akun?";
        switchBtn.innerText = "Login Disini";
        if(userInput) userInput.classList.remove('hidden');
    }
}

async function handleAuth() {
    const email = emailInput.value;
    const password = passInput.value;
    const username = userInput ? userInput.value : '';

    if (!email || !password) return showError("Email & Password wajib diisi!");

    submitBtn.innerText = "Loading...";
    submitBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        if (isLoginMode) {
            // LOGIN
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // SUKSES -> PINDAH KE INDEX
            window.location.href = "index.html";
        } else {
            // DAFTAR
            if (!username) throw new Error("Username wajib diisi!");
            const { error } = await supabase.auth.signUp({
                email, password, options: { data: { username } }
            });
            if (error) throw error;
            alert("Daftar berhasil! Silakan login.");
            toggleMode();
        }
    } catch (err) {
        showError(err.message);
        submitBtn.disabled = false;
        submitBtn.innerText = isLoginMode ? "Masuk Sekarang" : "Daftar Sekarang";
    }
}

function showError(msg) {
    errorMsg.innerText = msg;
    errorMsg.style.display = 'block';
}