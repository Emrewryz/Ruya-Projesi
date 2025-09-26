// HTML'deki elemanları seçiyoruz.
const dreamInput = document.getElementById('dream-input');
const submitButton = document.getElementById('submit-button');
const resultArea = document.getElementById('result-area');

// Butona tıklandığında çalışacak olan fonksiyonu "async" olarak işaretliyoruz.
// Bu, içinde "await" yani bekleme komutlarını kullanabilmemizi sağlar.
submitButton.addEventListener('click', async () => {
    const dreamText = dreamInput.value.trim();

    if (dreamText === '') {
        resultArea.innerText = 'Lütfen yorumlanmasını istediğiniz bir rüya yazın.';
        return;
    }

    // Kullanıcıya beklemesini söylüyoruz ve butonu geçici olarak devre dışı bırakıyoruz ki tekrar tekrar basamasın.
    resultArea.innerText = 'Rüyanız bilge yorumcumuz tarafından analiz ediliyor, lütfen bekleyin...';
    submitButton.disabled = true;
    submitButton.innerText = 'Yorumlanıyor...';

    try {
        // Bizim "güvenli aracımıza" (Netlify Function) bir istek gönderiyoruz.
        // '/.netlify/functions/yorumla' adresi, projemiz internete yüklendiğinde otomatik olarak çalışacak olan sihirli adrestir.
        const response = await fetch('/.netlify/functions/yorumla', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dream: dreamText }),
        });

        // Eğer aracıdan gelen cevap başarılı değilse, bir hata mesajı göster.
        if (!response.ok) {
            throw new Error('Sunucudan geçerli bir cevap alınamadı.');
        }

        // Gelen cevabı JSON formatından normal metne çeviriyoruz.
        const data = await response.json();
        
        // Sonucu, yani rüya yorumunu ekrana yazdırıyoruz.
        resultArea.innerText = data.interpretation;

    } catch (error) {
        // Herhangi bir aşamada hata olursa kullanıcıya bunu bildiriyoruz.
        console.error('Hata:', error);
        resultArea.innerText = 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.';
    } finally {
        // İşlem başarılı da olsa, hata da olsa, butonu tekrar aktif hale getiriyoruz.
        submitButton.disabled = false;
        submitButton.innerText = 'Yorumla';
    }
});