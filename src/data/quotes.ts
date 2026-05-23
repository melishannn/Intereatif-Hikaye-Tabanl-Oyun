import { BookQuote } from "../types";

export const BOOK_QUOTES: BookQuote[] = [
  {
    quote:
      "Kelimelerinizi bir silah gibi değil, kendinizi ve başkalarını onarmak için bir araç gibi kullanın; çünkü diliniz gerçekliğinizi inşa eden en güçlü kuvvettir.",
    author: "Don Miguel Ruiz",
    book: "Dört Anlaşma",
    difficulty: "easy",
    choices: [
      {
        text: "Linç edenlere şefkatle cevap ver",
        effects: { resilience: 20, success: -5 },
        message: "Cevabın bazılarını sakinleştirdi, bazıları ise dalga geçti.",
      },
      {
        text: "Benzer bir silahla saldırıya geç",
        effects: { success: 10, resilience: -20, health: -15 },
        message:
          "Birkaç kişiyi susturdun ama nefret okları sana yönelmeye devam etti.",
      },
      {
        text: "Tamamen sessiz kalıp içine kapan",
        effects: { resilience: -10, success: -10, health: -5 },
        message: "Söylemediğin sözler içinde zehre dönüştü.",
      },
    ],
  },
  {
    quote:
      "Sürekli mükemmel hissetme arzusu aslında bir yetersizlik duygusuna dayanır; oysa içinde bulunduğunuz zor durumu kabullenmek, iyileşmenin en hızlı yoludur.",
    author: "Mark Manson",
    book: "Ustalık Gerektiren Kafaya Takmama Sanatı",
    difficulty: "easy",
    choices: [
      {
        text: "Durumu kabullen ve dürüstçe paylaş",
        effects: { resilience: 25, success: -10, talent: 5 },
        message: "İnsanlar dürüstlüğünü takdir etti, baskı hafifledi.",
      },
      {
        text: "Hiçbir şey olmamış gibi kusursuz görünmeye çalış",
        effects: { success: 15, resilience: -15, health: -10 },
        message: "Oynadığın rol seni içten içe tüketti.",
      },
      {
        text: "Zorluklardan şikayet etmeye başla",
        effects: { resilience: -10, success: -10, health: -5 },
        message: "Sürekli şikayet etmek seni daha da batağa çekti.",
      },
    ],
  },
  {
    quote:
      "Başkalarının size fırlattığı nefret dolu oklar aslında sizinle değil, onların kendi içlerindeki yaralarla ilgilidir; bu yüzden üzerinize alınmanıza gerek yoktur.",
    author: "Don Miguel Ruiz",
    book: "Dört Anlaşma",
    difficulty: "medium",
    choices: [
      {
        text: "Eleştirileri kişiselleştirmeden geçiştir",
        effects: { resilience: 25, success: -10, health: 5 },
        message: "Kalkanın devreye girdi, ruh sağlığın korundu.",
      },
      {
        text: "Her yoruma tek tek içerle ve ağla",
        effects: { resilience: -25, success: -5, health: -15 },
        message: "Her ok kalbine saplandı. Ruhsal gücün tükendi.",
      },
      {
        text: "Nefret kusanları ifşa et",
        effects: { resilience: -10, success: 15, health: -10 },
        message: "Kısa süreli bir zafer ama kaos ortamı dinmek bilmedi.",
      },
    ],
  },
  {
    quote:
      "İyi olanın peşinden saplantılı bir şekilde koşmak sizi yıpratırken, negatif deneyimlerle yüzleşmek sizi paradoksal olarak daha güçlü bir noktaya taşır.",
    author: "Mark Manson",
    book: "Ustalık Gerektiren Kafaya Takmama Sanatı",
    difficulty: "hard",
    choices: [
      {
        text: "Negatif durumu bir büyüme fırsatı olarak gör",
        effects: { resilience: 30, success: -15, talent: 15 },
        message: "Karanlığın içinde yepyeni bir ilham ışığı buldun.",
      },
      {
        text: "Saplantılı bir şekilde eski popülerliğine dönmeye çalış",
        effects: { success: 15, resilience: -30, health: -15 },
        message: "Çabaladıkça daha çok dibe battın.",
      },
      {
        text: "Her şeyi bırakıp pes et",
        effects: { resilience: -20, success: -25, health: -10 },
        message:
          "Kaçış seni geçici olarak rahatlattı ama kalıcı hasar bıraktı.",
      },
    ],
  },
  {
    quote:
      "Birinin size sunduğu kötü fikirleri veya hakaretleri kabul etmediğiniz sürece, o duygusal zehir sahibinin elinde kalmaya devam eder.",
    author: "Don Miguel Ruiz",
    book: "Dört Anlaşma",
    difficulty: "medium",
    choices: [
      {
        text: "Hakaretleri zihninden uzaklaştır, işine odaklan",
        effects: { resilience: 20, success: 5, talent: 10 },
        message: "Zehir sana bulaşmadı, sanatın yükseldi.",
      },
      {
        text: "Hakaretleri kabul edip kendini suçla",
        effects: { resilience: -30, success: -10, health: -20 },
        message: "Zehir tüm vücuduna yayıldı, yataktan çıkamadın.",
      },
      {
        text: "Benzer hakaretlerle karşılık ver",
        effects: { resilience: -15, success: 10, health: -10 },
        message: "Kendini zehirledin, ama karşı tarafı da öfkelendirdin.",
      },
    ],
  },
  {
    quote:
      "Hayatta gerçekten kıymet verdiğiniz her şeye ulaşmak, o yoldaki zorluklara göğüs germeyi ve onlarla mücadele etmeyi gerektirir.",
    author: "Mark Manson",
    book: "Ustalık Gerektiren Kafaya Takmama Sanatı",
    difficulty: "hard",
    choices: [
      {
        text: "Hedefin uğruna linçe rağmen çalışmaya devam et",
        effects: { resilience: 30, success: -20, health: -5, talent: 25 },
        message: "Acı çektin ama ustalığa bir adım daha yaklaştın.",
      },
      {
        text: "Mücadeleden kaçın, daha kolay bir yol seç",
        effects: { success: 10, resilience: -20, talent: -10 },
        message: "Rahatladın ama içindeki o büyüme arzusu söndü.",
      },
      {
        text: "İsyan et ve herkesi suçla",
        effects: { resilience: -15, success: -15, health: -15 },
        message: "Sorumluluktan kaçmak seni sadece zayıflattı.",
      },
    ],
  },
  {
    quote:
      "Acı çekmek kaçınılmazdır; önemli olan bu sancının dindirilmesi değil, bu mücadeleye değecek bir nedeninizin olmasıdır.",
    author: "Mark Manson",
    book: "Ustalık Gerektiren Kafaya Takmama Sanatı",
    difficulty: "hard",
    choices: [
      {
        text: "Nedenini hatırla: Sadece sanatın için katlan",
        effects: { resilience: 35, success: -25, health: 10, talent: 20 },
        message: "Sanatın her şeyin önüne geçti. Acı bir yakıt oldu.",
      },
      {
        text: "Amacını unutup acıya odaklan",
        effects: { resilience: -30, success: -10, health: -20 },
        message: "Vizyonunu kaybettin, karanlıkta kayboldun.",
      },
      {
        text: "Acıyı dindirmek için skandallara başvur",
        effects: { resilience: -20, success: 30, health: -25 },
        message: "Gündem değiştirdin ama ruhunu sattın.",
      },
    ],
  },
  {
    quote:
      "Eleştirileri kişisel bir saldırı olarak görmeyi bıraktığınızda, en kaotik sosyal ortamlarda bile iç huzurunuzu koruyacak manevi bir kalkan edinirsiniz.",
    author: "Don Miguel Ruiz",
    book: "Dört Anlaşma",
    difficulty: "medium",
    choices: [
      {
        text: "Kalkanını kuşan, kaosun içinden gülümseyerek geç",
        effects: { resilience: 25, success: 5, health: 15 },
        message: "Senin huzurun, onlara verilen en iyi cevaptı.",
      },
      {
        text: "Kaosa ayak uydur, savaşmaya başla",
        effects: { resilience: -20, success: 15, health: -15 },
        message: "Kazandığını sandın ama çok yara aldın.",
      },
      {
        text: "Ortamdan tamamen kaç",
        effects: { resilience: -10, success: -15, health: 5 },
        message: "Kısa vadede huzur, uzun vadede unutuluş.",
      },
    ],
  },
  {
    quote:
      "Kim olduğunuzu kazandığınız kupalar değil, hangi amaç için ter dökmeye ve acı çekmeye razı olduğunuz belirler.",
    author: "Mark Manson",
    book: "Ustalık Gerektiren Kafaya Takmama Sanatı",
    difficulty: "hard",
    choices: [
      {
        text: "Başarıyı boşver, emeğine odaklan",
        effects: { resilience: 30, success: -15, talent: 25 },
        message: "Kariyerin duraksadı ama karakterin çelikleşti.",
      },
      {
        text: "Her ne pahasına olursa olsun ödülleri hedeflen",
        effects: { success: 30, resilience: -30, health: -20 },
        message: "Zirvedesin ama için bomboş.",
      },
      {
        text: "Boşverip sıradan biri gibi yaşamaya karar ver",
        effects: { resilience: -10, success: -30, health: 10 },
        message: "Artık kimse seni konuşmuyor. Rahat ama sönük.",
      },
    ],
  },
  {
    quote:
      "Gerçek öz-saygı, her şey yolundayken değil, işler sarpa sardığında kendinize ne kadar şefkatli ve dürüst yaklaştığınızla ölçülür.",
    author: "Mark Manson",
    book: "Ustalık Gerektiren Kafaya Takmama Sanatı",
    difficulty: "medium",
    choices: [
      {
        text: "Kendini affet ve yavaşça toparlan",
        effects: { resilience: 25, success: -5, health: 20 },
        message: "Öz-saygın canlandı, yeni bir sen doğuyor.",
      },
      {
        text: "Kendini en ağır şekilde eleştir",
        effects: { resilience: -30, success: 0, health: -20 },
        message: "En büyük düşmanın kendi zihnin oldu.",
      },
      {
        text: "Toparlanmak için stüdyoya kapanıp çılgınca çalış",
        effects: { resilience: 10, success: 15, health: -15 },
        message: "Bir şeyler başardın ama tükenmişlik sınırındasın.",
      },
    ],
  },
];
