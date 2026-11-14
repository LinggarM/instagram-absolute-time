function updateInstagramTimestamps() {
    // 1. Cari SEMUA tag <time> yang memiliki atribut 'datetime'
    const timeElements = document.querySelectorAll('time[datetime]');

    timeElements.forEach(el => {
        // 2. Lewati jika elemen ini sudah pernah kita ubah (Penting untuk performa)
        if (el.dataset.replaced) return;

        const isoString = el.getAttribute('datetime');
        if (!isoString) return;

        // 3. Simpan teks asli (misal: "377w" atau "23 hours ago")
        const originalText = el.textContent.trim();

        // 4. Parse string ISO (2019-08-16T12:18:04.000Z) menjadi objek Date JavaScript
        const date = new Date(isoString);

        // Cek apakah tanggal valid
        if (isNaN(date.getTime())) return;

        // 5. Format tanggal ke format yang mudah dibaca (Waktu Indonesia Barat / Jakarta)
        const formattedDate = date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta' // Dipaksa ke WIB
        });

        // 6. Ganti teks di layar
        el.textContent = formattedDate;

        // 7. Beri tooltip (muncul saat kursor diarahkan ke teks waktu)
        el.title = `Waktu asli: ${originalText}\nWaktu server (UTC): ${isoString}`;

        // 8. Tandai elemen ini sudah diproses agar tidak diubah berulang kali
        el.dataset.replaced = 'true';

        // 9. (Opsional) Beri warna biru khas Instagram agar Anda tahu ini sudah diubah
        el.style.color = '#0095f6';
        el.style.fontWeight = '500';
        el.style.cursor = 'help'; // Mengubah kursor jadi tanda tanya saat di-hover
    });
}

// Jalankan sekali saat halaman selesai dimuat
updateInstagramTimestamps();

// Pantau perubahan DOM (Karena Instagram adalah SPA / tidak reload halaman saat klik postingan)
const observer = new MutationObserver(() => {
    // Gunakan setTimeout kecil untuk memastikan React selesai me-render elemen <time>
    setTimeout(updateInstagramTimestamps, 100);
});

// Mulai mengamati perubahan di seluruh body halaman
observer.observe(document.body, {
    childList: true,
    subtree: true
});