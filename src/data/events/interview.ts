import { GameEvent } from "../../types";

export const EVENTS: GameEvent[] = [
  {
    id: "interview_1",
    location: "interview",
    description: "Canlı yayındasın. Sunucu aniden 'Geçmişteki skandalın hakkında neler diyeceksin?' diye soruyor. Kameralar sana yaklaşıyor.",
    choices: [
      {
        text: "Gülümseyerek 'O günler geride kaldı, şimdi geleceğe odaklanıyorum' de.",
        effects: { success: 15, resilience: 10, health: -5 },
        message: "Profesyonel bir cevap verdin. İnsanlar senin ne kadar geliştiğini konuştu."
      },
      {
        text: "Kızarak 'Bu konu kapanmıştı, neden açıyorsunuz?' diye tepki göster.",
        effects: { success: -15, resilience: -10, health: -10 },
        message: "Agresif çıkışın medyada olay oldu. 'Kontrolsüz' ilan edildin."
      },
      {
        text: "Gözyaşlarına boğulup sessiz kal.",
        effects: { success: -5, resilience: -20, health: -5 },
        message: "Ekrandaki savunmasız halin herkesi üzdü, ama bazıları seni güçsüz buldu."
      }
    ]
  },
  {
    id: "interview_2",
    location: "interview",
    description: "Bir dergi röportajında gazeteci sana 'Rakiplerinin senin hakkında söylediği kötü sözler seni etkiliyor mu?' diye sordu.",
    choices: [
      {
        text: "'Herkesin kendi fikri var, onlara saygı duyuyorum ama işime odaklıyım' de.",
        effects: { success: 10, resilience: 15, health: 5 },
        message: "Ne kadar olgun olduğunu gösterdin. Hayranların bu tavrına bayıldı."
      },
      {
        text: "'Beni çekemiyorlar, hepsi kıskanç' diyerek kibirli bir cevap ver.",
        effects: { success: -20, resilience: -5, health: 5 },
        message: "Verdiğin kibirli cevap tepki çekti, hayranlarından bazılarının gözünden düştün."
      },
      {
        text: "Sustuktan sonra, 'Sizce gerçekten etkilenmeli miyim?' diye karşı soru sor.",
        effects: { success: 5, resilience: 10, health: -5 },
        message: "Akıllıca bir manevrayla konuyu gazeteciye pasladın."
      }
    ]
  },
  {
    id: "interview_3",
    location: "interview",
    description: "Hayranlardan gelen sorular bölümünde, biri 'Son zamanlarda çok kilo aldın, bir idol olarak kendine bakmıyor musun?' diye sordu.",
    choices: [
      {
        text: "'Benim değerim sahnede gösterdiğim yeteneğimle ölçülür, kilomla değil' de.",
        effects: { resilience: 20, success: 10, health: 15 },
        message: "Beden olumlama mesajın viral oldu, birçok kişiye ilham verdin!"
      },
      {
        text: "Utanarak başını öne eğ ve 'Diyet yapacağım' diyerek özür dile.",
        effects: { resilience: -20, success: -10, health: -15 },
        message: "Özür dilemen, nefret söylemlerini daha da artırdı. Psikolojin bozuldu."
      },
      {
        text: "Soruyu görmezden gelip mikrofonu sunucuya uzat.",
        effects: { resilience: -5, success: -5, health: 0 },
        message: "Cevapsız bıraktığın için dedikodular devam etti, ama anı kurtardın."
      }
    ]
  }
];
