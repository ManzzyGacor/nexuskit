// 1. Fungsi Render Tampilan (HTML)
function renderUnbanUI() {
    return `
    <div id="unban-interface">
        <h2 style="text-align:center; color:var(--primary); margin-bottom:20px;">VXZ UNBAN V2 (VIP)</h2>
        <div style="text-align:center; margin-bottom:20px;">
            <img src="https://files.catbox.moe/ejn7q9.jpeg" style="width:100px; border-radius:50%; box-shadow:0 0 15px rgba(255,255,255,0.2);">
        </div>
        
        <label>Nomor WhatsApp</label>
        <input type="tel" id="nomor" placeholder="+628xxx" class="input">
        
        <label>Pilih Metode Banding</label>
        <select id="alasan" class="input">
            <option value="">-- UNBANNED OPTION --</option>
            <option value="permafresh">PERMA FRESH</option>
            <option value="SPAM">SPAM DETECTED</option>
            <option value="PERMA HARD">PERMA HARD</option>
            <option value="PERMASEMINGGU">PERMA - SEMINGGU</option>
            <option value="opsi5">PERMA BATU (India)</option>
        </select>

        <button class="btn" id="sendBtn" style="width:100%; margin-top:20px;">UNBANNED (AUTO EMAIL)</button>
        <div id="statusArea" style="text-align:center; margin-top:10px; font-size:0.8rem; color:#aaa; min-height:20px;"></div>
        <p style="text-align:center; font-size:0.7rem; color:#666; margin-top:10px;">VIP METHOD BY VXZ</p>
    </div>
    `;
}

// 2. Fungsi Logic Utama (Script dari kamu)
function initUnbanLogic() {
    /* ------------------ App / Mail logic (original, preserved + fixed) ------------------ */
    const sendBtn = document.getElementById('sendBtn');
    const statusEl = document.getElementById('statusArea');
    const nomorInput = document.getElementById('nomor');
    const alasanSelect = document.getElementById('alasan');

    function enc(v){ return encodeURIComponent(v || ''); }
    function isAndroid(){ return /Android/i.test(navigator.userAgent); }
    function setStatus(t){ statusEl.textContent = t; }
    function normalizeNumber(n){
        if(!n) return n;
        const s=n.trim().replace(/\s+/g,'');
        if(/^[0][0-9]+$/.test(s)) return '62'+s.slice(1);
        if(/^\+/.test(s)) return s;
        return s;
    }

    /* buildTemplate: placeholders for 5 opsi */
    function buildTemplate(nomor, alasan){
        const tampilNomor = (nomor.startsWith('+') || nomor.startsWith('62')) ? nomor : ('+'+nomor);

        switch(alasan){
        case "permafresh":
            return {
            to: 'support@support.whatsapp.com',
            subject: 'Hello whatsapp developer, please help me.',
            body: `Hello developer, my Whatsapp is Vixzz. I would like to ask for help regarding my account being blocked a few hours ago. I don't know the exact reason, but when I woke up and wanted to chat with my girlfriend, my Whatsapp account was blocked permanently. Here is my blocked Whatsapp number:\n${tampilNomor} I beg you to restore it immediately, thank you.`
            };
        case "SPAM":
            return {
            to: 'support@support.whatsapp.com',
            subject: 'tolong saya',
            body: `Hallo developer whatsapp saya vixzz salah satu pengguna whatsapp dari tahun 2023 dan saya saat ini ingin mengeluhkan atas pemblockiran akun whatsapp saya dengan alasan spam pada tanggal [ tanggal ke band ], ini sangat lah aneh karena saya sudah sering membaca layanan ketentuan aplikasi whatsapp dan sudah mematuhinya juga selama 2/3 tahun terakhir dan saya percaya ini adalah kesalahan sistem whatsapp yang salah mendeteksi kesalahan sehingga mungkin hanya chatan biasa pun bisa di anggap spam dan di blockir. Saya mohon untuk pihak whatsapp fix bug ini karena sangat meresahkan dan buka kan akun whatsapp saya [ ${tampilNomor} ] secepat mungkin karena saya ingin menghubungi keluarga saya yang kini sedang ada di luar kota dan saya menyayangi nya, terima kasih.`
            };
        case "PERMA HARD":
            return {
            to: 'support@support.whatsapp.com',
            subject: `please unblock this WhatsApp account [ ${tampilNomor} ] its a system error`,
            body: `Hi developer, I'm contacting you via WhatsApp to request a review of my WhatsApp account, which has been blocked for no apparent reason. I've already requested a review through the WhatsApp application, but the block hasn't been lifted. I urgently need that WhatsApp account, as I've mentioned in the Gmail subject. Sorry for bothering you, but I need my WhatsApp account back now. Thank you.`
            };
        case "PERMASEMINGGU":
            return {
            to: 'support@support.whatsapp.com',
            subject: 'help me plss',
            body: `Hi WhatsApp Developer, I'm vixzz. My WhatsApp account (+${tampilNomor}) was blocked without reason. I always follow WhatsApp's Terms of Service, use the official app, never spam, and behave respectfully. I believe this is a system error. Please review and restore my account. Thank you for your attention and help.`
            };
        case "opsi5":
            return {
            to: 'support@support.whatsapp.com',
            subject: 'hi',
            body: `Hizmet şartlarınızı ihlal etmedim, hesabı açıklanamaz bir şekilde yasakladınız. Hesap etkinliklerimi inceledikten sonra, WhatsApp a erişebilmem için kısıtlamayı hızla kaldırırsınız. Çünkü hesabım yanlışlıkla yasaklandı \n\nŞartlarınızı veya politikanızı ihlal ettiğimi kabul ediyorum ve bunun için gerçekten üzgünüm lütfen bir şans verin ve yasağı hesabımdan kaldırın ${tampilNomor} isim Satya Budist gursarai\n\nGörüşleriniz için teşekkürler\nHindistan lıyım, ülke kodum ${tampilNomor}\nYasal adım Satya Budist gursarai\nUmarım bu SIM kartın yeni sahibi olduğum için WhatsApp hesap numaramdan kısıtlamalarınızı kaldırırsınız ${tampilNomor}\n\nVe o kaldırılmalıdır, aksi takdirde WhatsApp ın derecelendirmesini rahatsız etmeyeceksiniz Ki amaiyo chod hoga kardeş ke lado`
            };
        default:
            return {
            to: 'support@support.whatsapp.com',
            subject: `My WhatsApp number was blocked ${tampilNomor}`,
            body: `प्रिय व्हाट्सएप सपोर्ट टीम,\n\nमुझे आशा है कि यह संदेश आपको अच्छी तरह से मिल जाएगा ।  मैं अपने व्हाट्सएप अकाउंट पर प्रतिबंध की अपील करने के लिए लिख रहा हूं ।  मैं समझता हूं कि व्हाट्सएप की सेवा की शर्तों के उल्लंघन के कारण मेरे खाते पर प्रतिबंध लगा दिया गया था, और मैं किसी भी अनजाने कार्यों के लिए ईमानदारी से माफी मांगता हूं जिसके कारण यह हो सकता है । \n\nमैं व्हाट्सएप को एक आवश्यक संचार उपकरण और समुदाय के रूप में महत्व देता हूं, और मैं व्हाट्सएप की नीतियों और दिशानिर्देशों का पालन करने के लिए प्रतिबद्ध हूं ।  मैं कृपया अपने मामले की समीक्षा और अपने खाते पर प्रतिबंध हटाने का अनुरोध करता हूं ताकि मैं जिम्मेदारी से व्हाट्सएप का उपयोग करना जारी रख सकूं । \n\nकृपया नीचे कुछ जानकारी प्राप्त करें जो आपकी समीक्षा के लिए सहायक हो सकती हैं: - मेरा पंजीकृत फोन नंबर.`
            };
        }
    }

    function buildIntentUrl(t){return `intent://compose?to=${enc(t.to)}&subject=${enc(t.subject)}&body=${enc(t.body)}#Intent;scheme=mailto;package=com.google.android.gm;end`;}
    function buildMailtoUrl(t){return `mailto:${enc(t.to)}?subject=${enc(t.subject)}&body=${enc(t.body)}`;}
    function buildGmailWebUrl(t){return `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(t.to)}&su=${enc(t.subject)}&body=${enc(t.body)}`;}

    sendBtn.addEventListener('click',()=>{
        let nomor=(nomorInput.value||'').trim();
        let alasan=(alasanSelect.value||'');

        if(!nomor || !alasan){ setStatus("Mohon isi nomor & pilih alasan."); return; }

        nomor = normalizeNumber(nomor);
        const tpl = buildTemplate(nomor, alasan);

        const intentUrl = buildIntentUrl(tpl);
        const mailtoUrl = buildMailtoUrl(tpl);
        const gmailWebUrl = buildGmailWebUrl(tpl);

        sendBtn.disabled = true;
        sendBtn.setAttribute('aria-busy','true');

        if(isAndroid()){
            setStatus("Mencoba membuka Gmail app...");
            try{ window.location.href = intentUrl; } catch(e){}

            let handled=false;
            const fallback = ()=>{
                if(handled) return;
                handled=true;
                setStatus("GAGAL...");
                try{ window.location.href = mailtoUrl; } catch(e){
                try{ window.open(gmailWebUrl,'_blank'); } catch(err){ setStatus("Gagal membuka email."); }
                }
                sendBtn.disabled=false;
                sendBtn.removeAttribute('aria-busy');
            };

            const onVisChange = ()=>{
                if(document.hidden){
                handled=true;
                setStatus("Compose terbuka.");
                sendBtn.disabled=false;
                sendBtn.removeAttribute('aria-busy');
                }
            };
            document.addEventListener('visibilitychange', onVisChange, {once:true});
            setTimeout(()=>{ if(!handled) fallback(); }, 1200);

        } else {
            setStatus("Membuka aplikasi email...");
            try{
                window.location.href = mailtoUrl;
                setTimeout(()=>{
                if(!document.hidden){
                    try{ window.open(gmailWebUrl,"_blank"); } catch(e){}
                }
                sendBtn.disabled=false;
                sendBtn.removeAttribute('aria-busy');
                },900);
            }catch(err){
                try{ window.open(gmailWebUrl,"_blank"); } catch(e){}
                sendBtn.disabled=false;
                sendBtn.removeAttribute('aria-busy');
            }
        }
    });
}