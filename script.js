// HTML'deki elemanları seçiyoruz.
const dreamInput = document.getElementById('dream-input');
const submitButton = document.getElementById('submit-button');
const resultArea = document.getElementById('result-area');
const popularDreamsSection = document.getElementById('popular-dreams-section');
const popularDreamsList = document.getElementById('popular-dreams-list');

// Sayfa yüklendiğinde popüler rüyaları listeye ekleyelim.
document.addEventListener('DOMContentLoaded', () => {
    // ruyaAnsiklopedisi değişkeni ruya-ansiklopedisi.js dosyasından geliyor.
    ruyaAnsiklopedisi.forEach(ruya => {
        const dreamElement = document.createElement('div');
        dreamElement.classList.add('dream-item');
        dreamElement.innerHTML = `<h3>${ruya.baslik}</h3><p>${ruya.ozet}</p>`;
        popularDreamsList.appendChild(dreamElement);
    });
});

// Butona tıklandığında çalışacak olan fonksiyon
submitButton.addEventListener('click', async () => {
    const dreamText = dreamInput.value.trim();

    if (dreamText === '') {
        resultArea.innerHTML = '<div class="result-header"><span class="result-title">Hata</span></div><div class="result-content">Lütfen yorumlanmasını istediğiniz bir rüya yazın.</div>';
        resultArea.classList.remove('loading');
        return;
    }

    // --- YENİ ANİMASYONLU YÜKLEME EKRANI ---
    submitButton.disabled = true;
    submitButton.innerText = 'Yorumlanıyor...';
    popularDreamsSection.classList.add('hidden');
    resultArea.innerHTML = ''; // Önceki sonuçları temizle
    resultArea.classList.add('loading'); // Animasyonu başlat

    try {
        const response = await fetch('/.netlify/functions/yorumla', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dream: dreamText }),
        });

        if (!response.ok) {
            throw new Error('Sunucudan geçerli bir cevap alınamadı.');
        }

        const data = await response.json();
        
        // --- YENİ PROFESYONEL SONUÇ SUNUMU ---
        resultArea.classList.remove('loading'); // Animasyonu durdur
        resultArea.innerHTML = `
            <div class="result-header">
                <span class="result-title">İşte Rüyanızın Anlamı:</span>
            </div>
            <div class="result-content">
                ${data.interpretation}
            </div>
        `;
        
        popularDreamsSection.classList.remove('hidden');

    } catch (error) {
        console.error('Hata:', error);
        resultArea.classList.remove('loading'); // Hata durumunda da animasyonu durdur
        resultArea.innerHTML = '<div class="result-header"><span class="result-title">Hata</span></div><div class="result-content">Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</div>';
    } finally {
        // İşlem bitince butonu tekrar aktif hale getiriyoruz.
        submitButton.disabled = false;
        submitButton.innerText = 'Yorumla';
    }
});