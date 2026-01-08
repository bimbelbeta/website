export function generateResetPasswordEmail(userName: string, url: string, _token: string): string {
	return `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>Halo ${userName},</h2>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun bimbelbeta Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
            <div style="margin: 20px 0;">
              <a href="${url}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Atur Ulang Kata Sandi
              </a>
            </div>
            <p>Jika tombol di atas tidak berfungsi, Anda juga dapat menyalin dan menempelkan tautan berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #666;">${url}</p>
            <p>Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini. Kata sandi Anda tidak akan berubah sampai Anda mengakses tautan di atas dan membuat yang baru.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 0.8em; color: #888;">&copy; 2026 bimbelbeta. Semua hak dilindungi undang-undang.</p>
          </div>
        `;
}
