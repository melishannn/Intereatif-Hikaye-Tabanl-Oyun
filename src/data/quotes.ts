import { BookQuote } from '../types';

export const BOOK_QUOTES: BookQuote[] = [
  {
    quote: "Pozitif deneyimi arzu etmek aslında negatif deneyimdir.",
    difficulty: 'easy',
    choices: [
      { text: "Linç edildiğini kabul et, sessizce izle", effects: { resilience: 20, success: -15 }, message: "Fırtınanın geçmesini bekledin. Psikolojin nefes aldı ama sosyal medya seni unuttu." },
      { text: "Sahte pozitif içerik paylaş", effects: { success: 10, resilience: -20, health: -10 }, message: "Gündem geçti ama içten çürümeye devam ettin. Maskeyi takmak yorucu." },
      { text: "Sadece emoji ile cevap ver", effects: { resilience: -5, success: -10, health: -5 }, message: "Ne evet dedin ne hayır. Orta yol seni kurtarmadı." }
    ]
  },
  {
    quote: "Vasatlığınızı kucaklayın, mükemmel görünmek zorunda değilsiniz.",
    difficulty: 'easy',
    choices: [
      { text: "Doğal halini paylaş, kusurlarını göster", effects: { resilience: 25, success: -10, talent: 5 }, message: "Bazı hayranlar dürüstlüğünü sevdi, bazıları ise seni küçümsedi." },
      { text: "Mükemmel stüdyo fotoğrafı paylaş", effects: { success: 15, resilience: -15, health: -10 }, message: "İmajın kurtuldu ama sahteliğin ağırlığı altında ezildin." },
      { text: "Telefonu kapat, 1 gün boyunca hiçbir şey yapma", effects: { resilience: -10, success: -10, health: -5 }, message: "Kaos sensiz büyüdü. Kaçmak çözüm değil." }
    ]
  },
  {
    quote: "Sorumluluğu üstlenin, linç sizin suçunuz olmasa bile tepkiniz sizin sorumluluğunuz.",
    difficulty: 'medium',
    choices: [
      { text: "Özür videosu çek, hatayı üstlen", effects: { resilience: -15, success: 20, health: -15 }, message: "Hayranların geri döndü ama kendine olan güvenini kaybettin." },
      { text: "Avukat açıklaması yap, sert dur", effects: { success: 15, resilience: -10, health: -10 }, message: "Savaş kazandın ama çevrende kimse kalmadı." },
      { text: "Yorumları tek tek savunmaya çalış", effects: { resilience: -20, success: -20, health: -10 }, message: "Saldırdıkça batıyorsun. Savunma yapmak suçluyu ispat eder." }
    ]
  },
  {
    quote: "Dürüstlüğü popülerliğin önüne koyun.",
    difficulty: 'medium',
    choices: [
      { text: "Gerçekleri anlat, gerekirse herkesi karşına al", effects: { resilience: 25, success: -30, talent: 15 }, message: "Popülerliğin bitti ama sanatçı olarak doğdun." },
      { text: "Popüler kalmaya devam et, sessiz kal", effects: { success: 20, resilience: -25, health: -10 }, message: "Çok seviliyorsun ama aynaya bakamıyorsun." },
      { text: "Sadece like atıp çık", effects: { resilience: -5, success: -5, health: -5 }, message: "Bu ne bir duruş ne de bir kaçış. Orta yol seni zayıflattı." }
    ]
  },
  {
    quote: "Hangi ıstıraba katlanmaya razı olduğunuzu sorgulayın.",
    difficulty: 'hard',
    choices: [
      { text: "Sanatın için linçi çek, üretmeye devam et", effects: { resilience: 30, success: -35, health: 10, talent: 20 }, message: "Sanatın yüceldi, takipçin azaldı. Bedeli ağır." },
      { text: "Linç ortasında sahneye çık, şovunu yap", effects: { resilience: -30, success: 35, health: -30 }, message: "Kahraman oldun ya da tamamen bittin. Risk büyüktü." },
      { text: "Kaosun ortasında açıklama yapma, sadece bekle", effects: { resilience: -15, success: -20, health: -15 }, message: "Sessizliğin çaresizlik gibi algılandı. Zarar büyük." }
    ]
  }
];
