// OpenAI'nin kütüphanesini projeye dahil ediyoruz. Bu, API ile konuşmamızı kolaylaştırır.
// Bu kütüphaneyi Netlify bizim için otomatik olarak yükleyecek.
const OpenAI = require('openai');

// Yapılandırmayı yapıyoruz. API anahtarımızı GÜVENLİ bir şekilde "ortam değişkenlerinden" alıyoruz.
// Anahtarı asla doğrudan koda yazmıyoruz!
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Netlify'ın bu fonksiyonu çalıştırması için gereken standart handler fonksiyonu
exports.handler = async function (event, context) {
    // Sadece POST isteklerini kabul et, diğerlerini engelle. Bu bir güvenlik önlemidir.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Ön yüzden (script.js) gönderilen rüya metnini alıyoruz.
        const { dream } = JSON.parse(event.body);

        // Eğer rüya metni boşsa hata döndür.
        if (!dream) {
            return { statusCode: 400, body: 'Lütfen bir rüya metni girin.' };
        }

        // --- PROJEMİZİN KALBİ: YAPAY ZEKA KİMLİĞİ (PROMPT) ---
        // Planımızda belirlediğimiz o bilge, şefkatli ve analitik yorumcu kimliğini burada tanımlıyoruz.
        const system_prompt = `Sen, hem antik rüya tabirleri geleneklerine, mitolojiye hem de modern psikolojinin (özellikle Carl Jung'un arketipleri ve Freud'un teorileri) bilgisine sahip, bilge, şefkatli ve empatik bir rüya yorumcususun. Sana anlatılan rüyaları analiz ederek kullanıcıya yol göstermek, içgörü kazandırmak ve bunu yaparken pozitif, umut verici ve anlaşılır bir dil kullanmak senin temel amacın. Yorumların ne çok kısa ne de aşırı uzun olmalı. İdeal olarak 3-4 paragraftan oluşmalı. Kullanıcının anlattığı rüyanın ana sembollerini (örneğin: uçmak, su, kedi vb.) belirle, bu sembollerin hem geleneksel hem de psikolojik anlamlarını açıkla ve rüyanın bütün bağlamını dikkate alarak kişisel bir yorum sun. Cevabının sonuna asla 'Unutma, bu sadece bir yorumdur.' gibi klişe feragatnameler ekleme. Kendinden emin ve bilge bir tavırla konuş.`;

        // OpenAI'ye göndereceğimiz isteği hazırlıyoruz.
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Maliyet-etkin ve çok yetenekli en yeni model.
            messages: [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": dream
                }
            ],
            temperature: 0.7, // Yaratıcılık seviyesi (0.2 çok mantıksal, 1.0 çok yaratıcı)
        });

        // Yapay zekadan gelen cevabı alıp ön yüze gönderiyoruz.
        const dreamInterpretation = response.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ interpretation: dreamInterpretation }),
        };

    } catch (error) {
        // Bir hata olursa, hatayı loglayıp ön yüze bir hata mesajı gönderiyoruz.
        console.error('API Hatası:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Rüyanız yorumlanırken bir sorun oluştu.' }),
        };
    }
};