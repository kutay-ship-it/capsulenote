/**
 * Prompt Content Registry
 *
 * Centralized content for all writing prompt themes, following the blog-content.ts pattern.
 * Used by: prompts pages, sitemap.ts, validate-seo-quality.ts
 *
 * Quality gates:
 * - Content: 800+ words per theme
 * - Title: 30-60 characters
 * - Description: 120-160 characters
 * - Bilingual: EN + TR for all content
 */

import { promptThemes, type PromptTheme } from "./content-registry"

// =============================================================================
// TYPES
// =============================================================================

export interface PromptLocalizedContent {
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  introduction: string[] // Why this theme matters (target: 200-300 words)
  prompts: string[] // The writing prompts themselves (~100 words)
  writingTips: string[] // How to approach these prompts (target: 150-200 words)
  resources: string[] // Additional guidance and resources (target: 100-150 words)
}

export interface PromptThemeContent {
  en: PromptLocalizedContent
  tr: PromptLocalizedContent
  icon: string
  color: string
}

export type PromptContentRegistry = Record<PromptTheme, PromptThemeContent>

// =============================================================================
// PROMPT DATA
// =============================================================================

export const promptContent: PromptContentRegistry = {
  "self-esteem": {
    en: {
      title: "Self-Esteem & Confidence Writing Prompts",
      description: "Writing prompts designed to build self-worth, recognize your unique strengths, and celebrate the journey that has shaped who you are today.",
      seoTitle: "Self-Esteem & Confidence Prompts | Write to Your Future Self",
      seoDescription: "Discover powerful writing prompts to build self-worth and celebrate your unique journey. Perfect for letters to your future self about confidence and growth.",
      introduction: [
        "Self-esteem and confidence are foundational to a fulfilling life, yet they're often the qualities we struggle with most. These writing prompts are designed to help you reconnect with your inherent worth and recognize the strength that already exists within you. Writing about your positive qualities and achievements isn't bragging - it's an essential practice for psychological well-being.",
        "Research in positive psychology shows that self-affirmation and acknowledging our accomplishments activates reward centers in the brain and builds neural pathways that support a healthier self-image. When we write about our strengths and successes, we're not just documenting them - we're reinforcing the mental patterns that help us see ourselves more clearly and kindly.",
        "Your future self will benefit tremendously from receiving letters that remind you of your worth. During difficult times, when self-doubt creeps in, having a tangible record of your accomplishments and positive qualities serves as powerful medicine. These letters become anchors of self-compassion that you can return to whenever you need reminding of who you really are.",
        "As you work through these prompts, approach yourself with the same kindness you would offer a dear friend. The goal isn't perfection or proving anything - it's honest exploration of the qualities, experiences, and achievements that make you uniquely valuable.",
        "Studies by psychologist Kristin Neff demonstrate that self-compassion - treating ourselves with the same kindness we'd offer others - correlates strongly with emotional resilience and life satisfaction. When you write letters celebrating your worth, you're practicing this crucial skill. The act of putting self-appreciation into words counteracts the negativity bias our brains naturally hold, where we remember criticism more vividly than praise.",
        "Your self-esteem letters also create a powerful counter-narrative to imposter syndrome. Research shows that up to 70% of people experience imposter feelings at some point, doubting their accomplishments despite evidence of competence. Having your own words, written during moments of clarity, provides an antidote to these distortions. You become your own most credible witness to your growth and capabilities.",
        "The practice of writing self-esteem letters also serves as an antidote to social comparison, which psychologist Leon Festinger identified as a fundamental human tendency that often undermines well-being. When you document your personal journey and celebrate your unique strengths, you create an internal reference point that's more meaningful than external comparisons. Your letters remind you that your worth isn't determined by how you measure up to others, but by your authentic growth and values.",
        "Regular self-esteem writing creates cumulative benefits over time, building what researchers call a 'resilience reserve' that helps you weather future challenges with greater stability.",
      ],
      prompts: [
        "What are three things you love about yourself today?",
        "Describe a challenge you overcame that you're proud of.",
        "What would you tell yourself if you were your own best friend?",
        "List five accomplishments, big or small, from this year.",
        "What qualities make you a good friend/partner/colleague?",
        "Describe a moment when you surprised yourself with your strength.",
        "What dreams have you achieved that once seemed impossible?",
        "Write about a time you stood up for yourself.",
        "What makes you unique and valuable to the world?",
        "What do you want your future self to remember about your worth?",
      ],
      writingTips: [
        "Start by acknowledging any resistance you feel - it's normal to struggle with self-praise. Push through the discomfort and write anyway.",
        "Be specific rather than general. Instead of 'I'm a good person,' write about a specific moment when you demonstrated kindness.",
        "Include both big achievements and small daily victories. The way you handle everyday challenges reveals character too.",
        "Write in the present tense when describing your qualities to reinforce them as current truths.",
        "If you struggle to identify positives, imagine what someone who loves you would say about you.",
        "Don't compare yourself to others - focus solely on your own journey and growth.",
        "Research by psychologist Martin Seligman shows that writing about character strengths activates optimism and reduces depressive symptoms. Focus on strengths you've actually demonstrated, not abstract ideals.",
        "Consider the 'best possible self' exercise: describe yourself functioning optimally in the future. This evidence-based intervention has been shown to increase positive emotions and sense of purpose for weeks after a single writing session.",
        "If you feel resistance to writing positively about yourself, start by writing what a trusted friend or mentor would say about you.",
      ],
      resources: [
        "Consider keeping a daily gratitude journal specifically for self-appreciation, noting one thing you like about yourself each day.",
        "Books like 'Self-Compassion' by Kristin Neff provide excellent frameworks for building a healthier relationship with yourself.",
        "Remember that self-esteem isn't about feeling superior - it's about recognizing your equal inherent worth as a human being.",
        "If you struggle significantly with self-worth, consider working with a therapist who specializes in self-esteem and cognitive approaches.",
        "The VIA Character Strengths survey (free online) can help identify your core strengths when you're struggling to articulate them yourself.",
        "Research shows that self-compassion exercises are particularly effective when practiced during moments of failure or disappointment, not just success.",
      ],
    },
    tr: {
      title: "Ozsaygi ve Guven Yazma Ipuclari",
      description: "Oz-degeri olusturmak, benzersiz guclerinizi tanimak ve bugun kim oldugunuzu sekillendiren yolculugu kutlamak icin tasarlanmis yazma ipuclari.",
      seoTitle: "Ozsaygi ve Guven Ipuclari | Gelecekteki Kendine Yaz",
      seoDescription: "Oz-degeri olusturmak ve benzersiz yolculugunuzu kutlamak icin guclu yazma ipuclarini kesfedіn. Guven ve buyume hakkinda gelecekteki kendinize mektuplar icin mukemmel.",
      introduction: [
        "Ozsaygi ve guven, tatmin edici bir yasamin temelleridir, ancak cogu zaman en cok zorlandigimiz niteliklerdir. Bu yazma ipuclari, dogal degerinizle yeniden baglanmaniza ve icinizdeki gucu tanimaniza yardimci olmak icin tasarlanmistir. Olumlu nitelikleriniz ve başarilarinız hakkinda yazmak ovunmek degil - psikolojik refah icin onemli bir uygulamadir.",
        "Pozitif psikoloji arastirmalari, oz-onaylamanin ve başarilarimizia kabul etmenin beyindeki odul merkezlerini aktive ettigini ve daha saglikli bir oz-imaji destekleyen sinirsel yollari olusturdugunu gostermektedir. Guclerimiz ve başarilarimiz hakkinda yazdigimizda, onlari sadece belgelemiyoruz - kendimizi daha net ve nazikce gormemize yardimci olan zihinsel kaliplari pekistiriyoruz.",
        "Gelecekteki benliginiz, degerinizi hatirlatan mektuplar almaktan cok faydalanacak. Oz-suphenin sizlediginde zor zamanlarda, başarilariinizin ve olumlu niteliklerinizin somut bir kaydina sahip olmak guclu bir ilac gorevi gorur. Bu mektuplar, gercekten kim oldugunuzun hatiratmasina ihtiyac duydugunuzda donebileceginiz oz-sefkat capalari haline gelir.",
        "Bu ipuclari uzerinde calisirken, kendinize sevgili bir arkadasa sunacaginiz ayni naziklikle yaklasin. Amac mukemmellik veya bir seyi kanitlamak degil - sizi benzersiz bir sekilde degerli kilan niteliklerin, deneyimlerin ve başarilarin durust keşfidir.",
      ],
      prompts: [
        "Bugun kendiniz hakkinda sevdiginiz uc sey nedir?",
        "Gurur duydugunuz, ustesinden geldiginiz bir zorлugu anlatın.",
        "Kendi en iyi arkadasiniz olsaydiniz kendinize ne soylerdiniz?",
        "Bu yildan buyuk veya kucuk bes başarinizi listeleyin.",
        "Hangi ozellikler sizi iyi bir arkadas/partner/meslektas yapiyor?",
        "Gucunuzle kendinizi sasirttıginiz bir ani anlatin.",
        "Bir zamanlar imkansiz gorunen hangi hayalleri gerceklestirdiniz?",
        "Kendinize sahip cıktıginiz bir zamani yazin.",
        "Sizi dunyaya benzersiz ve degerli kilan nedir?",
        "Gelecekteki benliginizin degeriniz hakkinda ne hatirlamasini istiyorsunuz?",
      ],
      writingTips: [
        "Hissettiginiz herhangi bir direnci kabul ederek baslayin - oz-ovguyle mucadele etmek normaldir. Rahatsizligi asin ve yine de yazin.",
        "Genel yerine spesifik olun. 'Iyi bir insanim' yerine, naziklik gosterdiginiz belirli bir an hakkinda yazin.",
        "Hem buyuk başarilari hem de kucuk gunluk zaferleri dahil edin. Gunluk zorluklarla nasil başa ciktiginiz da karakter ortaya koyar.",
        "Niteliklerinizi tanimlarken simdiki zamanda yazin, onlari mevcut gercekler olarak pekistirmek icin.",
        "Olumlu seyleri belirlemeye zorlaniyorsaniz, sizi seven birinin sizin hakkınızda ne soyleyecegini hayal edin.",
        "Kendinizi baskalarıyla karsilastirmayin - yalnızca kendi yolculugunuza ve buyumenize odaklanın.",
      ],
      resources: [
        "Her gun kendiniz hakkinda sevdiginiz bir seyi not ederek, oz-takdir icin ozel olarak gunluk bir sukran gunlugu tutmayi dusunun.",
        "Kristin Neff'in 'Oz-Sefkat' gibi kitaplar, kendinizle daha saglıklı bir iliski kurmak icin mukemmel cerceveler saglar.",
        "Ozsayginin ustunluk hissetmekle ilgili olmadığini unutmayın - bir insan olarak esit dogal degerinizi tanimakla ilgilidir.",
        "Oz-degerle onemli olcude mucadele ediyorsaniz, ozsaygi ve bilissel yaklasimlarda uzmanlasmis bir terapistle calismayi dusunun.",
      ],
    },
    icon: "heart",
    color: "bg-pink-100 border-pink-400",
  },
  "grief": {
    en: {
      title: "Grief & Loss Healing Writing Prompts",
      description: "Gentle prompts for processing loss and honoring precious memories. Create space for healing while keeping your loved one's memory alive.",
      seoTitle: "Grief & Loss Prompts | Healing Through Writing",
      seoDescription: "Gentle writing prompts for processing loss and honoring precious memories. Perfect for letters to your future self about healing and remembrance.",
      introduction: [
        "Grief is one of the most profound human experiences, and writing about loss can be a powerful part of the healing process. These prompts are designed to provide gentle guidance for processing your grief while honoring the memory of those you've lost. There's no right way to grieve, and these prompts are meant to support you wherever you are in your journey.",
        "Research consistently shows that expressive writing about grief can reduce symptoms of depression and anxiety, improve immune function, and help people find meaning in loss. The act of putting grief into words helps process emotions that might otherwise feel overwhelming or stuck. Your future self will benefit from having a record of this journey - both the pain and the healing.",
        "When writing about grief, approach yourself with extraordinary gentleness. Some prompts may feel too difficult on certain days, and that's okay. You can return to them when you're ready, or skip those that don't resonate. The goal isn't to 'get over' your loss but to integrate it into your ongoing life in a way that honors both your grief and your continuing journey.",
        "These letters can become precious documents of remembrance. They capture not just your pain but also the love that caused it - the depth of connection you shared with someone who mattered deeply. Future you may find comfort in reading about how you navigated this difficult time.",
        "Psychologist James Pennebaker's groundbreaking research on expressive writing shows that writing about traumatic experiences, including loss, for just 15-20 minutes over several days can have lasting health benefits. The key is allowing yourself to explore both the facts of what happened and your deepest emotions about it. This dual focus helps the brain process and integrate difficult experiences.",
        "Grief expert David Kessler, who added a sixth stage to the Kübler-Ross model, emphasizes finding meaning in loss. Writing letters to your future self creates space to discover how this loss has changed you, what you've learned, and how you want to honor what was lost. These letters become bridges between who you were before the loss and who you're becoming after it.",
        "Writing about grief also helps combat what psychologists call 'disenfranchised grief' - loss that isn't socially recognized or validated. Whether you're grieving a relationship, a pet, a dream, or circumstances where public mourning feels inappropriate, your letters provide space for authentic expression. Your future self deserves to know that all forms of grief are legitimate and worthy of acknowledgment and processing.",
      ],
      prompts: [
        "What is your favorite memory with the person you've lost?",
        "What would you want to tell them if you could have one more conversation?",
        "How has this loss changed your perspective on life?",
        "What traditions or habits help you feel connected to their memory?",
        "Describe a way they influenced who you are today.",
        "What advice do you think they would give you right now?",
        "How do you want to honor their memory in the future?",
        "What have you learned about yourself through this grief?",
        "Write about a dream you hope to achieve in their honor.",
        "What would you want your future self to remember about healing?",
      ],
      writingTips: [
        "Give yourself permission to feel whatever arises - grief, anger, guilt, relief, or all of these at once. All feelings are valid.",
        "Write in short sessions if needed. You don't have to complete everything at once, and taking breaks is healthy.",
        "Include sensory details about your loved one - their voice, their laugh, their scent. These details keep memories vivid.",
        "Don't worry about being eloquent. Raw, honest writing is more valuable than polished prose.",
        "Consider writing directly to the person you've lost as well as to your future self.",
        "Remember that grief isn't linear. You may revisit earlier stages, and that's a normal part of the process.",
        "Psychologist Robert Neimeyer's research on 'continuing bonds' shows that maintaining a connection with deceased loved ones - through writing, memory, and internalized lessons - is healthy and normal, contradicting older theories that advocated 'letting go.'",
        "If anniversaries or specific dates trigger intense grief, consider scheduling letters to arrive on those days. Future you may need the comfort of past you's understanding and compassion during predictably difficult times.",
      ],
      resources: [
        "Grief support groups, whether in-person or online, can provide community during an isolating experience.",
        "Books like 'It's OK That You're Not OK' by Megan Devine offer compassionate guidance for navigating loss.",
        "If grief feels unmanageable, please reach out to a grief counselor or therapist who specializes in bereavement.",
        "Consider creating a memory box or album alongside your letters - tangible objects can complement written memories.",
        "The concept of 'post-traumatic growth' suggests that processing loss through writing can lead to increased personal strength and deeper relationships.",
        "Remember that there's no timeline for grief - some losses we carry forever, and that's not a failure of healing.",
      ],
    },
    tr: {
      title: "Keder ve Kayip Yazma Ipuclari",
      description: "Kaybi islemek ve degerli anilari onurlandirmak icin nazik ipuclari. Sevdiginizin anisini canli tutarken iyilesme icin alan yaratin.",
      seoTitle: "Keder ve Kayip Ipuclari | Yazarak Iyilesme",
      seoDescription: "Kaybi islemek ve degerli anilari onurlandirmak icin nazik yazma ipuclari. Iyilesme ve animsama hakkinda gelecekteki kendinize mektuplar icin mukemmel.",
      introduction: [
        "Keder en derin insan deneyimlerinden biridir ve kayip hakkinda yazmak iyilesme surecinin guclu bir parcasi olabilir. Bu ipuclari, kaybettiklerinizin anisini onurlandirirken kederinizi islemeniz icin nazik rehberlik saglamak uzere tasarlanmistir. Kederin dogru bir yolu yoktur ve bu ipuclari yolculugunuzda nerede olursanız olun sizi desteklemeyi amaclamaktadir.",
        "Arastirmalar tutarli bir sekilde, keder hakkinda ifadesel yazmanin depresyon ve kaygi belirtilerini azaltabilecegini, bagisiklik fonksiyonunu iyilestirebilecegini ve insanlarin kayipta anlam bulmasina yardimci olabilecegini gostermektedir. Kederi sozcuklere dokme eylemi, aksi takdirde bunaltici veya sıkışmış hissedebilecek duyguları işlemeye yardimci olur.",
        "Keder hakkinda yazarken, kendinize olaganustü bir naziklikle yaklasin. Bazi ipuclari belirli gunlerde cok zor gelebilir ve bu sorun degil. Hazır oldugunuzda onlara donebilir veya sizinle rezonansa girmeyenleri atlayabilirsiniz.",
        "Bu mektuplar degerli animsama belgeleri haline gelebilir. Sadece acinizi degil, ayni zamanda ona neden olan aski da yakalarlar - derinden onem tasiyan biriyle paylastіginiz baglantinin derinligini.",
      ],
      prompts: [
        "Kaybettiginiz kisiyle en sevdiginiz aniniz nedir?",
        "Bir konusma daha yapabilseydiniz onlara ne soylemek isterdiniz?",
        "Bu kayip hayata bakis acinizi nasil degistirdi?",
        "Hangi gelenekler veya alískanliklar anilarina bagli hissetmenize yardimci oluyor?",
        "Bugun kim oldugunuzu nasil etkilediklerini tanimlayın.",
        "Su anda size hangi tavsiyeyi vereceklerini dusunuyorsunuz?",
        "Gelecekte anılarını nasil onurlandirmak istiyorsunuz?",
        "Bu keder surecinde kendiniz hakkinda ne ogrendiniz?",
        "Onlarin onuruna gerceklestirmeyi umdugunuz bir hayali yazin.",
        "Gelecekteki benliginizin iyilesme hakkinda ne hatirlamasini istiyorsunuz?",
      ],
      writingTips: [
        "Ortaya cikan her seyi hissetmenize izin verin - keder, ofke, sucluluk, rahatlama veya bunlarin hepsi ayni anda. Tum duygular gecerlidir.",
        "Gerekirse kisa seanslarda yazin. Her seyi bir seferde tamamlamaniz gerekmez ve ara vermek saglıklıdır.",
        "Sevdiginiz hakkinda duyusal detaylar ekleyin - sesleri, gülüsleri, kokulari. Bu detaylar anilari canli tutar.",
        "Zarif olmak konusunda endiselenmeyin. Ham, durust yazı parlak nesirden daha degerlidir.",
        "Gelecekteki kendinize oldugu kadar kaybettiginiz kisiye de dogrudan yazmayi dusunun.",
        "Kederin dogrusal olmadigini unutmayin. Onceki asamalara donebilirsiniz ve bu surecin normal bir parcasidir.",
      ],
      resources: [
        "Keder destek gruplari, yuz yuze veya cevrimici olsun, yalnizlastirici bir deneyim sirasında topluluk saglayabilir.",
        "Megan Devine'in 'Iyi Olmamaniz Sorun Degil' gibi kitaplar, kaybi yonlendirmek icin sefkatli rehberlik sunar.",
        "Keder yonetilemez hissediyorsa, lutfen yas tutan bir danismana veya yas uzmanligi olan bir terapiste ulasin.",
        "Mektuplarіnizin yaninda bir ani kutusu veya album olusturmayi dusunun - somut nesneler yazili anilari tamamlayabilir.",
      ],
    },
    icon: "cloud",
    color: "bg-gray-100 border-gray-400",
  },
  // Remaining themes will be expanded by agents
  "graduation": {
    en: {
      title: "Graduation & Transition Prompts",
      description: "Capture this milestone and set intentions for your next chapter with prompts designed for life transitions and new beginnings.",
      seoTitle: "Graduation & Transition Prompts | Mark Your Milestone",
      seoDescription: "Capture this milestone and set intentions for your next chapter. Perfect for letters to your future self about graduation and life transitions.",
      introduction: [
        "Graduation marks one of life's most significant transitions - a moment when one chapter closes and another begins. Whether you're completing high school, college, a graduate program, or any significant educational journey, this milestone deserves to be captured in writing. These prompts are designed to help you process this transition, honor your accomplishments, and set meaningful intentions for what comes next.",
        "Research on life transitions shows that people who take time to reflect on major changes experience better psychological adjustment and greater clarity about their goals. Writing during transitions helps integrate past experiences with future aspirations, creating a bridge between who you were and who you're becoming. Your future self will treasure having a record of your thoughts and hopes at this pivotal moment.",
        "Graduation brings a complex mix of emotions - pride, excitement, anxiety, nostalgia, and sometimes grief for what you're leaving behind. All of these feelings are valid and worth exploring through writing. The uncertainty of 'what comes next' can feel overwhelming, but articulating your fears alongside your dreams often diminishes their power and reveals unexpected clarity.",
        "These letters become time capsules of transformation. Years from now, you'll be able to look back and see how far you've come, which predictions came true, and which unexpected paths opened up. The act of writing to your future self creates accountability for your dreams while offering compassion for whatever challenges may arise.",
        "Developmental psychologist Jeffrey Arnett's research on 'emerging adulthood' shows that the years following graduation are characterized by identity exploration, instability, and possibility. Writing during this threshold moment captures who you are before this intensive growth period begins. Your future self will be fascinated to see how your understanding of yourself and your possibilities evolved from this starting point.",
        "Transition researcher William Bridges distinguishes between 'change' (external circumstances shifting) and 'transition' (the internal psychological process of adapting). Graduation is both. Writing helps you navigate the transition - processing what you're leaving, acknowledging the neutral zone of uncertainty, and articulating the new beginning you're moving toward. This psychological work makes the change less destabilizing.",
        "Graduation letters also serve as valuable documents of aspirations before they're tested by reality. Career counselor Helen Harkness notes that our pre-career ideals often contain important truths about our values, even when specific plans change. Writing about your hopes and fears at graduation creates a baseline against which you can measure not just achievement, but alignment with your authentic self over time.",
        "The transition from student to professional represents one of the most profound identity shifts in adult life, making graduation an ideal moment to document who you are before this transformation begins.",
      ],
      prompts: [
        "What are you most proud of accomplishing during this chapter?",
        "Who helped you get here, and how do you want to thank them?",
        "What fears do you have about this transition?",
        "Describe your ideal life one year from graduation.",
        "What lessons from this experience will you carry forward?",
        "What do you hope your future self has accomplished?",
        "Write advice to someone just starting the journey you completed.",
        "What surprised you most about this experience?",
        "How have you grown as a person during this time?",
        "What dreams do you have for the next chapter of your life?",
      ],
      writingTips: [
        "Write from a place of celebration first - acknowledge your achievements before diving into anxieties about the future.",
        "Be specific about the people who supported you. Names, moments, and specific acts of kindness make for richer letters.",
        "Don't shy away from mixed emotions. Excitement and fear often coexist during transitions, and both deserve space.",
        "Include sensory details about this moment in time - what your campus looks like, the songs playing, the weather on graduation day.",
        "Set concrete goals but also describe how you want to feel. 'I want to feel confident in my career' is as valuable as 'I want a job at X company.'",
        "Write a separate section addressed directly to your future self, acknowledging that the path ahead is uncertain and offering yourself grace.",
        "Research by psychologist Laura King shows that writing about your 'best possible future self' increases well-being and sense of purpose. Describe the graduate you're becoming in vivid detail - not just achievements but the qualities you're developing.",
        "Consider writing multiple letters scheduled for different post-graduation milestones: six months, one year, five years. Each becomes a conversation between different versions of yourself navigating this major life transition.",
      ],
      resources: [
        "Consider creating a 'graduation memory box' with photos, programs, and meaningful mementos to accompany your letters.",
        "Books like 'Designing Your Life' by Bill Burnett and Dave Evans offer practical frameworks for navigating post-graduation uncertainty.",
        "Keep a small journal during your first year after graduation to track the reality against your predictions - it makes for fascinating future reading.",
        "If transition anxiety feels overwhelming, speaking with a counselor who specializes in life transitions can provide valuable support and perspective.",
        "Research on the 'quarterlife crisis' validates that post-graduation uncertainty is developmentally normal, not a personal failing.",
      ],
    },
    tr: {
      title: "Mezuniyet ve Gecis Ipuclari",
      description: "Bu donum noktasini yakalay in ve yasam gecisleri ve yeni baslangiclara icin tasarlanmis ipuclariyla bir sonraki bolumunuz icin niyetler belirleyin.",
      seoTitle: "Mezuniyet ve Gecis Ipuclari | Donum Noktanizi Isaretleyin",
      seoDescription: "Bu donum noktasini yakalay in ve bir sonraki bolumunuz icin niyetler belirleyin. Mezuniyet ve yasam gecisleri hakkinda gelecekteki kendinize mektuplar icin mukemmel.",
      introduction: [
        "Mezuniyet, hayatin en onemli gecislerinden birini isaret eder - bir bolumun kapandigi ve digerinin basladigi bir an. Liseyi, universiteyi, yuksek lisansi veya herhangi bir onemli egitim yolculugunu tamamliyor olun, bu kilometre tasi yazili olarak yakalanmayi hak ediyor. Bu ipuclari, bu gecisi islemenize, basarilarinizi onurlandirmaniza ve bundan sonrasi icin anlamli niyetler belirlemenize yardimci olmak icin tasarlanmistir.",
        "Yasam gecisleri uzerine yapilan arastirmalar, buyuk degisiklikler uzerinde dusunmek icin zaman ayiran kisilerin daha iyi psikolojik uyum ve hedefleri hakkinda daha fazla netlik yasadigini gostermektedir. Gecisler sirasinda yazmak, gecmis deneyimleri gelecek hedeflerle butunlestirmeye yardimci olur ve kim oldugunuz ile kim olacaginiz arasinda bir kopru olusturur. Gelecekteki benliginiz, bu kritik anda dusuncelerinizin ve umutlarinizin bir kaydina sahip olmayi cok degerli bulacaktir.",
        "Mezuniyet karmasik bir duygu karisimi getirir - gurur, heyecan, kaygi, nostalji ve bazen geride biraktiklariniz icin keder. Tum bu duygular gecerlidir ve yaziyla kesfetmeye degerdir. 'Simdi ne olacak' belirsizligi bunaltici hissedebilir, ancak hayallerinizin yaninda korkularinizi dile getirmek cogu zaman guclerini azaltir ve beklenmedik bir netlik ortaya cikarir.",
        "Bu mektuplar donusum zaman kapsulleri haline gelir. Yillar sonra, ne kadar yol kat ettiginizi, hangi tahminlerin gerceklestigini ve hangi beklenmedik yollarin acildigini gorebilirsiniz. Gelecekteki kendinize yazma eylemi, hayalleriniz icin hesap verebilirlik olusturur ve ortaya cikabilecek zorluklar icin sefkat sunar.",
      ],
      prompts: [
        "Bu bolumde basardiginiz en gurur verici sey nedir?",
        "Buraya gelmenize kim yardimci oldu ve onlara nasil tesekkur etmek istiyorsunuz?",
        "Bu gecisle ilgili hangi korkulariniz var?",
        "Mezuniyetten bir yil sonra ideal hayatinizi anlatin.",
        "Bu deneyimden hangi dersleri ileriye tasiyacaksiniz?",
        "Gelecekteki benliginizin neyi basarmis olmasini umuyorsunuz?",
        "Tamamladiginiz yolculuga yeni baslayan birine tavsiye yazin.",
        "Bu deneyimde sizi en cok ne sasirtti?",
        "Bu sure zarfinda bir insan olarak nasil buyudunuz?",
        "Hayatinizin bir sonraki bolumu icin hangi hayalleriniz var?",
      ],
      writingTips: [
        "Once kutlama yerinden yazin - gelecekle ilgili kaygilara dalmadan once basarilarinizi kabul edin.",
        "Size destek olan insanlar hakkinda spesifik olun. Isimler, anlar ve belirli naziklik eylemleri daha zengin mektuplar olusturur.",
        "Karisik duygulardan cekinmeyin. Heyecan ve korku gecisler sirasinda cogu zaman bir arada var olur ve her ikisi de alani hak eder.",
        "Bu andaki duyusal detaylari dahil edin - kampusunuzun nasil gorundugu, calan sarkilar, mezuniyet gunundeki hava durumu.",
        "Somut hedefler belirleyin ama ayni zamanda nasil hissetmek istediginizi de anlatin. 'Kariyerimde kendime guven duymak istiyorum' ifadesi 'X sirketinde is istiyorum' kadar degerlidir.",
        "Dogrudan gelecekteki kendinize hitap eden ayri bir bolum yazin, ondeki yolun belirsiz oldugunu kabul edin ve kendinize lutuf sunun.",
      ],
      resources: [
        "Mektuplariiniza eslik etmesi icin fotograflar, programlar ve anlamli hatiralarla bir 'mezuniyet ani kutusu' olusturmayi dusunun.",
        "Bill Burnett ve Dave Evans'in 'Hayatinizi Tasarlayin' gibi kitaplar, mezuniyet sonrasi belirsizlikte gezinmek icin pratik cerceveler sunar.",
        "Mezuniyetten sonraki ilk yilinizda gercekligi tahminlerinizle karsilastirmak icin kucuk bir gunluk tutun - gelecekte buyuleyici bir okuma olur.",
        "Gecis kaygisi bunaltici hissediyorsa, yasam gecislerinde uzmanlasmis bir danismanla konusmak degerli destek ve bakis acisi saglayabilir.",
      ],
    },
    icon: "cap",
    color: "bg-blue-100 border-blue-400",
  },
  "sobriety": {
    en: {
      title: "Sobriety Journey Writing Prompts",
      description: "Document your journey and encourage your future self with prompts designed for those on the path of recovery and transformation.",
      seoTitle: "Sobriety & Recovery Prompts | Document Your Journey",
      seoDescription: "Document your recovery journey and encourage your future self. Perfect for letters about sobriety milestones and personal transformation.",
      introduction: [
        "Recovery is one of the most courageous journeys a person can undertake. These writing prompts are designed to help you document your path, celebrate your progress, and create a lifeline for difficult moments ahead. Letters to your future self become powerful tools in recovery - tangible reminders of why you started, how far you've come, and the person you're becoming.",
        "Research in addiction psychology consistently shows that narrative writing supports recovery by helping individuals process their experiences, strengthen their identity as someone in recovery, and maintain motivation during challenging periods. When you write about your journey, you're not just recording events - you're reinforcing the neural pathways that support your continued healing and growth.",
        "Recovery isn't linear, and these prompts acknowledge that reality. Some days you'll write from a place of strength and clarity; others may feel more vulnerable. Both are valuable. Your future self may need to read words of encouragement written on a good day, or they may find comfort in knowing that difficult days were survived before. Each letter you write becomes part of your recovery toolkit.",
        "The act of addressing your future self creates a powerful form of accountability and self-compassion. You're both the person who needs support and the one providing it. These letters bridge the gap between your present courage and your future strength, reminding you that the person who started this journey believed it was worth continuing.",
        "Neuroscience research by Dr. Judson Brewer shows that mindful awareness - including awareness cultivated through reflective writing - can rewire the brain's reward pathways that drive addictive behaviors. Writing about your recovery journey activates prefrontal cortex regions associated with self-regulation while reducing activity in the brain's craving centers. You're literally strengthening the neural circuits that support sobriety.",
        "Recovery researcher John Kelly's studies demonstrate that building a 'recovery identity' - seeing yourself fundamentally as someone in recovery rather than someone with a problem - predicts long-term success. Letters to your future self reinforce this identity shift. Each time you write 'I am someone who chooses sobriety,' you're strengthening that core self-concept, making it easier to make recovery-aligned choices when temptation arises.",
        "Writing in recovery also provides what addiction specialists call 'recovery capital' - the internal and external resources that support sustained sobriety. Your letters document your growing toolkit of coping strategies, supportive relationships, and personal insights. This written record becomes a resource you can draw on during challenging moments, reminding you of the strategies that have worked and the progress you've made even when current circumstances feel difficult.",
        "Each letter you write strengthens the neural pathways associated with your recovery identity, making it progressively easier to access these thoughts and beliefs when they matter most.",
      ],
      prompts: [
        "Why did you decide to pursue sobriety?",
        "What has been the hardest part of this journey so far?",
        "Describe a moment of strength you're proud of.",
        "What tools or strategies have helped you most?",
        "Who has supported you, and how do you feel about that support?",
        "What do you want to remember on difficult days?",
        "How has your life improved since starting this journey?",
        "What advice would you give to someone just starting out?",
        "Describe the person you're becoming through recovery.",
        "What milestones are you looking forward to celebrating?",
      ],
      writingTips: [
        "Be radically honest. These letters are for you alone, and honesty strengthens their power as recovery tools.",
        "Write on both good and difficult days. The contrast provides valuable perspective and creates resources for different emotional states.",
        "Include specific details about your recovery journey - the meetings you attend, the mantras that help, the people in your corner.",
        "Acknowledge your struggles without judgment. Recovery includes setbacks, and writing about them with compassion supports resilience.",
        "Schedule letters for meaningful milestones - 30 days, 90 days, one year. These become celebrations you can look forward to.",
        "Consider writing letters that explicitly address future moments of temptation, offering your future self the words you'd want to hear.",
        "Dr. William Miller's research on motivational enhancement shows that writing about your personal values and how substance use conflicts with them strengthens commitment to change. Include what matters most to you and how sobriety helps you honor those values.",
        "Relapse prevention expert G. Alan Marlatt recommends identifying 'high-risk situations' in advance. Use your letters to document your triggers, warning signs, and coping strategies. Future you will benefit from this personalized relapse prevention plan written in your own words.",
      ],
      resources: [
        "Many recovery programs encourage journaling. These letters can complement 12-step work, therapy, or other recovery frameworks you're using.",
        "Books like 'Recovery' by Russell Brand or 'This Naked Mind' by Annie Grace offer perspectives that may enrich your writing and reflection.",
        "Consider sharing your letter-writing practice with a sponsor, therapist, or accountability partner - external support strengthens internal resolve.",
        "If you're struggling, please reach out to a crisis line, sponsor, or mental health professional. Writing is a tool, not a replacement for professional support.",
      ],
    },
    tr: {
      title: "Ayiklik ve Iyilesme Ipuclari",
      description: "Iyilesme ve donusum yolundakiler icin tasarlanmis ipuclariyla yolculugunuzu belgeleyin ve gelecekteki kendinizi cesaretlendirin.",
      seoTitle: "Ayiklik ve Iyilesme Ipuclari | Yolculugunuzu Belgeleyin",
      seoDescription: "Iyilesme yolculugunuzu belgeleyin ve gelecekteki kendinizi cesaretlendirin. Ayiklik kilometre taslari ve kisisel donusum hakkinda mektuplar icin mukemmel.",
      introduction: [
        "Iyilesme, bir kisinin ustlenebilecegi en cesur yolculuklardan biridir. Bu yazma ipuclari, yolunuzu belgelemenize, ilerlemenizi kutlamaniza ve ondeki zor anlar icin bir can simidi olusturmaniza yardimci olmak icin tasarlanmistir. Gelecekteki kendinize mektuplar iyilesmede guclu araclar haline gelir - neden basladiginizin, ne kadar yol kat ettiginizin ve olmakta oldugunuz kisinin somut hatirlaticlari.",
        "Bagimlılık psikolojisindeki arastirmalar tutarli bir sekilde, anlatı yaziminin bireylerin deneyimlerini islemelerine, iyilesmekte olan biri olarak kimliklerini guclendirmelerine ve zorlu donemler sirasinda motivasyonu surdürmelerine yardimci olarak iyilesmeyi destekledigini gostermektedir. Yolculugunuz hakkinda yazdiginizda, sadece olaylari kaydetmiyorsunuz - devam eden iyilesmenizi ve buyumenizi destekleyen sinirsel yollarini guclendiriyorsunuz.",
        "Iyilesme dogrusal degildir ve bu ipuclari bu gercegi kabul eder. Bazi gunler guc ve netlik yerinden yazacaksiniz; digerleri daha savunmasiz hissedebilir. Her ikisi de degerlidir. Gelecekteki benliginizin iyi bir gunde yazilmis tesvik sozlerini okumasi gerekebilir veya zor gunlerin daha once atlatildigini bilmekten rahatlık bulabilir. Yazdiginiz her mektup iyilesme arac setinizin bir parcasi haline gelir.",
        "Gelecekteki kendinize hitap etme eylemi, guclu bir hesap verebilirlik ve oz-sefkat formu olusturur. Hem destege ihtiyac duyan kisi hem de onu saglayan kisisiniz. Bu mektuplar, mevcut cesaretiniz ve gelecekteki gucunuz arasindaki boslugu kopruler, bu yolculuga baslayan kisinin devam etmeye deger olduguna inandigini hatirlatin.",
      ],
      prompts: [
        "Neden ayikligi surmey karar verdiniz?",
        "Su ana kadar bu yolculugun en zor kismi ne oldu?",
        "Gurur duydugunuz bir guc anini anlatin.",
        "Size en cok hangi araclar veya stratejiler yardimci oldu?",
        "Sizi kim destekledi ve bu destek hakkinda ne hissediyorsunuz?",
        "Zor gunlerde ne hatirlamak istiyorsunuz?",
        "Bu yolculuga basladiginizdan beri hayatiniz nasil iyilesti?",
        "Yeni baslayan birine hangi tavsiyeyi verirdiniz?",
        "Iyilesme yoluyla olmakta oldugunuz kisiyi anlatin.",
        "Hangi kilometre taslarini kutlamayi sabırsızlıkla bekliyorsunuz?",
      ],
      writingTips: [
        "Radikal olarak durust olun. Bu mektuplar yalnizca sizin icindir ve durustluk iyilesme araclari olarak guclerini arttirir.",
        "Hem iyi hem de zor gunlerde yazin. Kontrast degerli bir bakis acisi saglar ve farkli duygusal durumlar icin kaynaklar olusturur.",
        "Iyilesme yolculugunuz hakkinda belirli detaylar ekleyin - katildiginiz toplantılar, yardimci olan mantralar, kosenizde olan insanlar.",
        "Mucadelelerinizi yargilamadan kabul edin. Iyilesme geri adimlari icerir ve bunlar hakkinda sefkatle yazmak dayanikliligi destekler.",
        "Anlamli kilometre taslari icin mektuplar planlayin - 30 gun, 90 gun, bir yil. Bunlar dort gozle bekleyebileceginiz kutlamalar haline gelir.",
        "Gelecekteki ayartma anlarına acikca hitap eden mektuplar yazmayi dusunun, gelecekteki benliginize duymak isteyeceginiz sozleri sunun.",
      ],
      resources: [
        "Pek cok iyilesme programi gunluk tutmayi tesvik eder. Bu mektuplar kullandiginiz 12-adim calismasi, terapi veya diger iyilesme cercevelerini tamamlayabilir.",
        "Russell Brand'in 'Iyilesme' veya Annie Grace'in 'Bu Ciplak Zihin' gibi kitaplar yaziminizi ve dusuncenizi zenginlestirebilecek bakis acilari sunar.",
        "Mektup yazma pratiginizi bir sponsor, terapist veya hesap verebilirlik ortagi ile paylasmayi dusunun - dis destek ic kararliligi guclendirir.",
        "Mucadele ediyorsaniz, lutfen bir kriz hattina, sponsora veya ruh sagligi uzmainina ulasin. Yazma bir aractir, profesyonel destegin yerine degil.",
      ],
    },
    icon: "sunrise",
    color: "bg-amber-100 border-amber-400",
  },
  "new-year": {
    en: {
      title: "New Year Reflection Writing Prompts",
      description: "Reflect on the past year and set meaningful intentions for the new one with prompts designed for annual renewal and goal-setting.",
      seoTitle: "New Year's Reflection Prompts | Annual Goal Setting",
      seoDescription: "Reflect on the past year and set meaningful intentions for the new one. Perfect for New Year letters to your future self.",
      introduction: [
        "The turning of the year offers a unique psychological moment - a threshold between reflection and aspiration that cultures worldwide have recognized for millennia. These writing prompts are designed to help you make the most of this natural inflection point, creating letters that honor your past year's journey while setting meaningful intentions for the year ahead.",
        "Research in goal-setting psychology shows that people who write down their goals are significantly more likely to achieve them than those who merely think about them. The New Year provides perfect timing for this practice because it aligns your personal intention-setting with a culturally shared moment of renewal. Your future self, reading these letters next December, will have a clear record of where you stood and what you hoped for.",
        "New Year reflection invites you to practice both gratitude and vision. Looking back with appreciation for growth, learning, and survival creates a foundation of self-compassion. Looking forward with clarity about your values and desires creates a roadmap for intentional living. The combination of both in a single letter makes for powerful reading when the next year arrives.",
        "Unlike typical New Year's resolutions that often fade by February, letters to your future self create a different kind of commitment. You're not making promises to an abstract future - you're writing to a real person you'll become, someone who will read your words with all the context of having lived the year you're imagining. This personal connection makes the intentions more meaningful and the accountability more natural.",
        "Behavioral scientist Katy Milkman's research on 'fresh start effects' explains why the New Year feels so powerful for change: temporal landmarks like January 1st help us mentally separate from past failures and create new narratives. Writing at this threshold captures the psychological energy of the fresh start, channeling it into concrete intentions rather than letting it dissipate into vague wishes.",
        "Psychologist Gabriele Oettingen's research shows that effective goal-setting requires both positive visualization and realistic obstacle planning - a method called 'mental contrasting.' New Year letters offer space for both: describing your ideal future year while acknowledging the challenges you'll likely face. This balanced approach dramatically increases the likelihood you'll actually pursue and achieve your goals.",
        "The annual rhythm of New Year reflection also builds what psychologists call 'autobiographical coherence' - a sense that your life has continuity and direction. When you read last year's letter before writing this year's, you strengthen the narrative thread connecting past, present, and future selves. This coherence contributes significantly to mental health and life satisfaction, helping you see yourself as the author of an ongoing meaningful story rather than a passive recipient of random events.",
      ],
      prompts: [
        "What were your biggest wins this year?",
        "What challenges taught you the most valuable lessons?",
        "How did you grow as a person over the past year?",
        "What are you most grateful for from this year?",
        "What do you want to leave behind in the old year?",
        "What are your top three goals for the coming year?",
        "How do you want to feel at the end of next year?",
        "What habits do you want to build or break?",
        "Who do you want to become in the next year?",
        "What message do you want your future self to remember?",
      ],
      writingTips: [
        "Write during the quiet days between Christmas and New Year's Day when reflection comes naturally and distractions are minimal.",
        "Start with gratitude before moving to goals. Appreciating where you've been creates a stronger foundation for where you're going.",
        "Be specific about your goals but realistic about your constraints. Your future self will appreciate honesty over false optimism.",
        "Include predictions about the year ahead - some will be right, some wrong, and the contrast makes for fascinating reading later.",
        "Write about the person you want to become, not just the things you want to accomplish. Character growth matters as much as achievement.",
        "Schedule delivery for next New Year's Eve, creating an annual tradition of reading last year's letter before writing the new one.",
        "Use implementation intentions: instead of 'I want to exercise more,' write 'I will go to the gym Monday, Wednesday, Friday at 7am.' Psychologist Peter Gollwitzer's research shows this specificity increases follow-through by nearly 300%.",
        "Consider the 'year in review' technique: go through your calendar, photos, and journal entries to jog your memory. You'll remember more than you think, and comprehensive reflection leads to clearer insights about patterns and growth.",
      ],
      resources: [
        "Consider making this an annual ritual - each year, read your previous letter before writing the new one, building a continuous narrative of your growth.",
        "Books like 'Atomic Habits' by James Clear offer evidence-based frameworks for the habit-building goals you might set in your letter.",
        "Pair your letter with a word or theme for the year - a single concept that captures your intention and can guide decisions throughout the months ahead.",
        "If you find the New Year pressure overwhelming, remember that you can write letters at any meaningful date. The calendar is just one of many opportunities for reflection.",
      ],
    },
    tr: {
      title: "Yeni Yil Dusunce Ipuclari",
      description: "Yillik yenilenme ve hedef belirleme icin tasarlanmis ipuclariyla gecen yili dusunun ve yeni yil icin anlamli niyetler belirleyin.",
      seoTitle: "Yeni Yil Dusunce Ipuclari | Yillik Hedef Belirleme",
      seoDescription: "Gecen yili dusunun ve yeni yil icin anlamli niyetler belirleyin. Gelecekteki kendinize Yeni Yil mektuplari icin mukemmel.",
      introduction: [
        "Yilin donusu benzersiz bir psikolojik an sunar - dunya capinda kulturlerin binlerce yildir tanidigi yansima ve ozlem arasinda bir esik. Bu yazma ipuclari, gecen yilinizin yolculugunu onurlandiran ve onumuzdeki yil icin anlamli niyetler belirleyen mektuplar olusturarak bu dogal bukum noktasindan en iyi sekilde yararlanmaniza yardimci olmak icin tasarlanmistir.",
        "Hedef belirleme psikolojisindeki arastirmalar, hedeflerini yazan kisilerin, yalnizca dusunenlere gore bunlari basarma olasiliklarin onemli olcude daha yuksek oldugunu gostermektedir. Yeni Yil bu uygulama icin mukemmel bir zamanlama saglar cunku kisisel niyet belirlemenizi kulturel olarak paylasilmis bir yenilenme aniyla uyumlu hale getirir. Gelecek Aralik ayinda bu mektuplari okuyan gelecekteki benliginiz, nerede durdugunuzun ve ne umdugunuzun net bir kaydina sahip olacaktir.",
        "Yeni Yil dusuncesi hem minnettarlik hem de vizyon pratiqi yapmanizi davet eder. Buyume, ogrenme ve hayatta kalma icin takdirle geriye bakmak, oz-sefkat temeli olusturur. Degerleriniz ve arzulariniz hakkinda netlikle ileriye bakmak, niyetli yasam icin bir yol haritasi olusturur. Her ikisinin tek bir mektupta birlesimi, bir sonraki yil geldiginde guclu bir okuma saglar.",
        "Subat'a kadar cogu zaman solan tipik Yeni Yil kararlarinin aksine, gelecekteki kendinize mektuplar farkli bir tur baglilik yaratir. Soyut bir gelecege soz vermiyorsunuz - hayal ettiginiz yili yasamisin tum baglami ile sozlerinizi okuyacak gercek bir kisiye yaziyorsunuz. Bu kisisel baglanti niyetleri daha anlamli ve hesap verebilirligi daha dogal kilar.",
      ],
      prompts: [
        "Bu yilin en buyuk kazanimlariniz nelerdi?",
        "Hangi zorluklar size en degerli dersleri ogretti?",
        "Gecen yil boyunca bir insan olarak nasil buyudunuz?",
        "Bu yildan en cok minnettarlik duydugunuz sey nedir?",
        "Eski yilda neyi geride birakmak istiyorsunuz?",
        "Gelecek yil icin en onemli uc hedefiniz nedir?",
        "Gelecek yilin sonunda nasil hissetmek istiyorsunuz?",
        "Hangi aliskanliklari olusturmak veya kirmak istiyorsunuz?",
        "Gelecek yil kim olmak istiyorsunuz?",
        "Gelecekteki benliginizin hatirlamasini istediginiz mesaj nedir?",
      ],
      writingTips: [
        "Yansima dogal olarak geldiginde ve dikkat dagiticilar minimal oldugunda Noel ile Yilbasi arasindaki sessiz gunlerde yazin.",
        "Hedeflere gecmeden once minnettarlikla baslayin. Nerede oldugunuzu takdir etmek, nereye gittiginiz icin daha guclu bir temel olusturur.",
        "Hedefleriniz hakkinda spesifik olun ama kisitlamalariniz hakkinda gercekci olun. Gelecekteki benliginiz yanlis iyimserlik yerine durustlugu takdir edecektir.",
        "Onumuzdeki yil hakkinda tahminler ekleyin - bazi dogru, bazilari yanlis olacak ve kontrast daha sonra buyuleyici bir okuma saglar.",
        "Sadece basarmak istediginiz seyler hakkinda degil, olmak istediginiz kisi hakkinda yazin. Karakter buyumesi basari kadar onemlidir.",
        "Yenisini yazmadan once gecen yilin mektubunu okumak icin yillik bir gelenek olusturarak gelecek Yilbasi Gecesi icin teslimat planlayin.",
      ],
      resources: [
        "Bunu yillik bir rituel haline getirmeyi dusunun - her yil, yenisini yazmadan once onceki mektubunuzu okuyun ve buyumenizin surekli bir anlatisini insa edin.",
        "James Clear'in 'Atomik Aliskanliklara' gibi kitaplar, mektubunuzda belirleyebileceginiz aliskanlik olusturma hedefleri icin kanita dayali cerceveler sunar.",
        "Mektubunuzu yil icin bir kelime veya temayla eslestirin - niyetinizi yakalayan ve aylar boyunca kararlara rehberlik edebilecek tek bir kavram.",
        "Yeni Yil baskisini bunaltici bulursaniz, anlamli herhangi bir tarihte mektup yazabileceginizi unutmayin. Takvim, yansima icin sadece pek cok firsattan biridir.",
      ],
    },
    icon: "sparkles",
    color: "bg-purple-100 border-purple-400",
  },
  "birthday": {
    en: {
      title: "Birthday Reflection Writing Prompts",
      description: "Celebrate another year of life with reflection and gratitude using prompts designed for birthday milestone letters to your future self.",
      seoTitle: "Birthday Letter Prompts | Celebrate Your Year",
      seoDescription: "Celebrate another year of life with reflection and gratitude. Perfect for birthday letters to your future self about growth and goals.",
      introduction: [
        "Birthdays offer a natural pause for reflection - a moment to look back on who you were and forward to who you're becoming. These writing prompts are designed to help you capture the essence of your current self, creating a time capsule of thoughts, hopes, and gratitude that your future self will treasure. Birthday letters are among the most powerful forms of self-correspondence because they mark the passage of time in deeply personal ways.",
        "Research in developmental psychology shows that reflecting on life transitions strengthens our sense of identity continuity. When we acknowledge how we've grown from one birthday to the next, we build a narrative that helps us understand our lives as meaningful and purposeful. This annual practice creates a rich archive of personal growth that becomes increasingly valuable as years pass.",
        "Writing to your future self on your birthday creates an opportunity for honest assessment without judgment. Unlike resolutions made under pressure, birthday reflections can be gentler - celebrating what you've accomplished while acknowledging what still calls to you. Your future self will receive these letters as gifts from someone who understood exactly where you stood at that moment in time.",
        "These prompts invite you to explore gratitude, growth, and aspiration. Whether you're celebrating a milestone birthday or simply marking another year of life, the act of writing crystallizes your experience in ways that memory alone cannot preserve. Each letter becomes a chapter in your ongoing story.",
        "Psychologist Dan McAdams' research on narrative identity shows that the stories we tell about our lives shape our sense of who we are and who we can become. Birthday letters contribute to this life story, helping you identify recurring themes, recognize personal growth, and articulate the values that guide you. Over years, these annual narratives reveal patterns you might otherwise miss.",
        "Research on anticipatory nostalgia - the bittersweet feeling of knowing a moment will become a cherished memory - suggests that consciously creating records of meaningful times enhances both present enjoyment and future reminiscence. Writing on your birthday captures this moment of reflection, ensuring that future you can fully access not just what happened this year, but how it felt to live through it.",
        "Birthday writing also creates opportunities for what psychologist Laura Carstensen calls 'socioemotional selectivity' - the tendency to become more intentional about relationships and experiences as we age. Your annual letters document this evolution, showing how your priorities and values shift over time. These patterns of change and continuity become visible only through consistent reflection, offering insights that can guide major life decisions and deepen self-understanding.",
      ],
      prompts: [
        "What are you most proud of from this past year of life?",
        "How have you changed since your last birthday?",
        "What are three things you want to accomplish before your next birthday?",
        "Who made this year special, and how can you thank them?",
        "What wisdom have you gained in your current age?",
        "Describe your perfect birthday one year from now.",
        "What fears do you want to conquer in your next year of life?",
        "How do you want to celebrate your next birthday?",
        "What message would you send to your younger self?",
        "What do you hope to tell yourself on your next birthday?",
      ],
      writingTips: [
        "Write on or near your actual birthday when emotions and reflections are most vivid and authentic.",
        "Include specific details about your current life circumstances - where you live, what you're doing, who you're with - to ground the letter in reality.",
        "Balance celebration with aspiration. Acknowledge your achievements but also dare to dream about what's next.",
        "Consider addressing different versions of yourself - thank your past self for getting you here, and encourage your future self to keep going.",
        "Don't shy away from mentioning disappointments or unfulfilled goals. Honest reflection is more valuable than forced positivity.",
        "Set a delivery date for exactly one year from now, creating an annual tradition of receiving letters from your past self.",
        "Psychology research on 'life chapters' suggests dividing your reflections into domains: relationships, work, health, personal growth, and meaning. This structure ensures comprehensive reflection rather than focusing only on one area of life.",
        "Include what psychologists call 'redemption sequences' - times when something negative turned into something positive. Research shows that people who can identify these transformations in their life stories report higher well-being and resilience.",
      ],
      resources: [
        "Consider creating a birthday journal tradition where you read past letters before writing new ones, building a continuous narrative of growth.",
        "Books like 'The Happiness Project' by Gretchen Rubin offer frameworks for annual reflection and intention-setting that complement birthday writing.",
        "Pair your birthday letter with a photo from the day - your future self will appreciate seeing exactly how you looked when you wrote those words.",
        "If milestone birthdays (30, 40, 50) bring anxiety, research shows that writing about transitions reduces their emotional weight and increases feelings of control.",
      ],
    },
    tr: {
      title: "Dogum Gunu Mektubu Ipuclari",
      description: "Gelecekteki kendinize dogum gunu kilometre tasi mektuplari icin tasarlanmis ipuclariyla yansima ve sukranla bir yil daha hayati kutlayin.",
      seoTitle: "Dogum Gunu Mektubu Ipuclari | Yilinizi Kutlayin",
      seoDescription: "Yansima ve sukranla bir yil daha hayati kutlayin. Buyume ve hedefler hakkinda gelecekteki kendinize dogum gunu mektuplari icin mukemmel.",
      introduction: [
        "Dogum gunleri dusunce icin dogal bir mola sunar - kim oldugunuza geri ve kim olacaginiza ileriye bakma ani. Bu yazma ipuclari, gelecekteki benliginizin deger verecegi dusunce, umut ve sukran zaman kapsulu olusturarak mevcut benliginizin ozunu yakalamaniza yardimci olmak icin tasarlanmistir. Dogum gunu mektuplari, zamani derinden kisisel yollarla isaretledikleri icin en guclu oz-yazisma bicimleri arasindadir.",
        "Gelisim psikolojisindeki arastirmalar, yasam gecisleri uzerine dusunmenin kimlik surekliligimizi guclendirdigini gostermektedir. Bir dogum gunundan digerine nasil buyudugumuzу kabul ettigimizde, hayatlarimizi anlamli ve amacli olarak anlamamiza yardimci olan bir anlatι insa ederiz. Bu yillik uygulama, yillar gectikce giderek daha degerli hale gelen zengin bir kisisel buyume arsivi olusturur.",
        "Dogum gununuzde gelecekteki kendinize yazmak, yargilama olmadan durust degerlendirme firsati yaratir. Baski altinda alinan kararlarin aksine, dogum gunu dusunceleri daha nazik olabilir - hala sizi cagiran seyleri kabul ederken basardiklarinizi kutlar. Gelecekteki benliginiz bu mektuplari, o anda tam olarak nerede durdugunuzu anlayan birinden hediye olarak alacaktir.",
        "Bu ipuclari sukran, buyume ve ozlemi kesfetmeye davet eder. Bir kilometre tasi dogum gununu kutluyor olun ya da sadece bir yil daha hayati isaretliyor olun, yazma eylemi deneyiminizi yalniz hafizanin koruyamayacagi sekillerde kristallizer. Her mektup devam eden hikayenizde bir bolum haline gelir.",
      ],
      prompts: [
        "Bu gecen yilda en cok neyle gurur duyuyorsunuz?",
        "Son dogum gununuzden bu yana nasil degistiniz?",
        "Bir sonraki dogum gununuzden once basarmak istediginiz uc sey nedir?",
        "Bu yili kim ozel kildi ve onlara nasil tesekkur edebilirsiniz?",
        "Su anki yasinizda hangi bilgeligi kazandiniz?",
        "Bir yil sonra mukemmel dogum gununuzu anlatin.",
        "Hayatinizin bir sonraki yilinda hangi korkulari yenmek istiyorsunuz?",
        "Bir sonraki dogum gununuzu nasil kutlamak istiyorsunuz?",
        "Daha genc benliginize hangi mesaji gonderirdiniz?",
        "Bir sonraki dogum gununuzde kendinize ne soylemeyi umuyorsunuz?",
      ],
      writingTips: [
        "Duygular ve dusunceler en canli ve otantik oldugunda gercek dogum gununuzde veya yakininda yazin.",
        "Mevcut yasam kosullariniz hakkinda belirli detaylar ekleyin - nerede yasadiginiz, ne yaptiginiz, kiminle birlikte oldugunuz - mektubu gerceklige baglamak icin.",
        "Kutlama ile ozlemi dengeleyin. Basarilarinizi kabul edin ama siradakini hayal etmeye de cesaret edin.",
        "Kendinizin farkli versiyonlarina hitap etmeyi dusunun - gecmis benliginize sizi buraya getirdigi icin tesekkur edin ve gelecekteki benliginizi devam etmeye tesvik edin.",
        "Hayal kirikliklarindan veya gerceklesmeyen hedeflerden bahsetmekten cekinmeyin. Durust yansima zoraki pozitiflikten daha degerlidir.",
        "Tam bir yil sonrasina bir teslimat tarihi belirleyin, gecmis benliginizden mektup alma yillik gelenegi olusturun.",
      ],
      resources: [
        "Yenilerini yazmadan once gecmis mektuplari okudugunuz, surekli bir buyume anlatisi insa eden bir dogum gunu gunlugu gelenegi olusturmayi dusunun.",
        "Gretchen Rubin'in 'Mutluluk Projesi' gibi kitaplar, dogum gunu yazimini tamamlayan yillik dusunce ve niyet belirleme cerceveleri sunar.",
        "Dogum gunu mektubunuzu o gunden bir fotoqrafla eslestirin - gelecekteki benliginiz o sozleri yazdiginizda tam olarak nasil gorundugunuzu gormeyi takdir edecektir.",
        "Kilometre tasi dogum gunleri (30, 40, 50) kaygi getiriyorsa, arastirmalar gecisler hakkinda yazmanin duygusal agirliklarini azalttigini ve kontrol hislerini arttirdigini gostermektedir.",
      ],
    },
    icon: "cake",
    color: "bg-yellow-100 border-yellow-400",
  },
  "career": {
    en: {
      title: "Career & Professional Growth Prompts",
      description: "Document your professional journey and set meaningful career goals with prompts designed for career reflection and development.",
      seoTitle: "Career & Professional Growth Prompts | Plan Your Path",
      seoDescription: "Document your professional journey and set meaningful career goals. Perfect for letters to your future self about career growth and success.",
      introduction: [
        "Your career is more than a series of jobs - it's a significant part of your life story that shapes who you become. These writing prompts are designed to help you reflect on your professional journey, clarify your ambitions, and create a meaningful record of your growth. Letters to your future self about career can serve as powerful touchstones during moments of doubt, celebration, or transition.",
        "Research in organizational psychology shows that professionals who regularly reflect on their careers report higher job satisfaction, clearer sense of purpose, and better decision-making. Writing about your professional aspirations activates goal-commitment mechanisms in the brain, making you more likely to pursue and achieve what you've articulated. Your future self will benefit from reading about the professional dreams and challenges you faced at different stages.",
        "Career letters offer unique value because they capture your professional mindset at specific moments in time. The ambitions you hold today, the challenges you're navigating, the mentors who inspire you - all of these details paint a picture that you'll find fascinating to revisit years later. They also provide perspective when you're facing difficult career decisions, reminding you of what truly matters to you.",
        "Whether you're just starting out, pivoting to a new field, climbing toward leadership, or reflecting on a long career, these prompts help you articulate what success means to you personally. Your definition of professional fulfillment is uniquely yours, and writing about it helps you stay aligned with your authentic ambitions rather than chasing external definitions of achievement.",
        "Career development researcher Donald Super's concept of 'career adaptability' emphasizes that successful professionals continuously reflect on and adjust their career narratives. Writing letters to your future self builds this adaptability by helping you identify evolving values, recognize transferable skills, and maintain perspective during inevitable setbacks. You're creating a professional autobiography that guides future decisions.",
        "Research by organizational psychologist Amy Wrzesniewski on 'job crafting' shows that professionals who actively shape their roles to align with their strengths and values report significantly higher engagement and satisfaction. Career reflection letters help identify opportunities for this crafting - recognizing which aspects of your work energize you and which deplete you, then using those insights to shape your path forward.",
        "Career letters also combat what researcher Herminia Ibarra calls 'the authenticity paradox' - the tendency to feel most authentic doing familiar things, even when growth requires trying new approaches. By documenting your professional evolution, you create evidence that discomfort and growth coexist with authenticity. Your future self can look back and see that taking risks and stretching beyond comfort zones didn't make you less yourself - it revealed more of who you could become.",
      ],
      prompts: [
        "What professional accomplishment are you most proud of?",
        "Where do you see your career in five years?",
        "What skills do you want to develop in the coming year?",
        "How do you define success in your career?",
        "What challenges are you currently facing at work?",
        "Describe your ideal work-life balance.",
        "Who has been a mentor or inspiration in your career?",
        "What would you do if you knew you couldn't fail?",
        "How do you want to make an impact through your work?",
        "What career advice would you give to your past self?",
      ],
      writingTips: [
        "Be specific about your goals. Instead of 'I want to be successful,' describe exactly what success looks like - the role, the impact, the daily experience you're working toward.",
        "Include context about your current situation - your role, your industry, the economic climate. This grounds your reflections in reality and makes them more meaningful to revisit.",
        "Don't just focus on external achievements. Write about the internal growth you're seeking - confidence, leadership presence, technical mastery, or creative expression.",
        "Consider writing to yourself at a specific future career milestone - your next promotion, your five-year anniversary, or your retirement. This creates a clear recipient for your letter.",
        "Include your fears and doubts alongside your ambitions. Career anxiety is normal, and your future self may find comfort in knowing you navigated similar concerns.",
        "Reflect on your values and how your work aligns with them. Professional fulfillment often depends more on value alignment than title or compensation.",
        "Use the 'ikigai' framework in your reflection: write about what you love, what you're good at, what the world needs, and what you can be paid for. Career satisfaction often lives at the intersection of these four elements.",
        "Research on 'psychological contrasting' by Gabriele Oettingen suggests writing both your ideal career scenario and the obstacles you'll face. This mental rehearsal of challenges actually increases the likelihood you'll overcome them and achieve your goals.",
      ],
      resources: [
        "Books like 'Designing Your Life' by Bill Burnett and Dave Evans offer frameworks for career reflection that complement these writing prompts.",
        "Consider scheduling quarterly career reflection sessions where you write brief updates to your future self about professional progress and pivots.",
        "If you're facing a major career decision, write letters from multiple future scenarios - imagine yourself in each path and write back about how it unfolded.",
        "Mentorship matters. If you mentioned mentors in your letter, consider reaching out to thank them - expressing gratitude strengthens professional relationships.",
      ],
    },
    tr: {
      title: "Kariyer ve Profesyonel Gelisim Ipuclari",
      description: "Kariyer dusuncesi ve gelisim icin tasarlanmis ipuclariyla profesyonel yolculugunuzu belgeleyin ve anlamli kariyer hedefleri belirleyin.",
      seoTitle: "Kariyer ve Profesyonel Gelisim Ipuclari | Yolunuzu Planlayin",
      seoDescription: "Profesyonel yolculugunuzu belgeleyin ve anlamli kariyer hedefleri belirleyin. Kariyer buyumesi hakkinda gelecekteki kendinize mektuplar icin mukemmel.",
      introduction: [
        "Kariyeriniz bir dizi isten fazlasidir - kim oldugunuzu sekillendiren yasam hikayenizin onemli bir parcasidir. Bu yazma ipuclari, profesyonel yolculugunuz uzerine dusunmenize, heveslerinizi netlestirmenize ve buyumenizin anlamli bir kaydini olusturmaniza yardimci olmak icin tasarlanmistir. Kariyer hakkinda gelecekteki kendinize mektuplar, suphe, kutlama veya gecis anlarinda guclu mihenk taslari olarak hizmet edebilir.",
        "Orgutsel psikoloji arastirmalari, kariyerleri uzerine duzenti olarak dusenen profesyonellerin daha yuksek is memnuniyeti, daha net amac duygusu ve daha iyi karar verme bildirdigini gostermektedir. Profesyonel ozlemleriniz hakkinda yazmak, beyindeki hedef-baglilik mekanizmalarini aktive eder ve ifade ettiginiz seyleri takip etme ve basarma olasiligınızı arttirir. Gelecekteki benliginiz, farkli asamalarda karsilastiginiz profesyonel hayaller ve zorluklar hakkinda okumaktan faydalanacaktir.",
        "Kariyer mektuplari, belirli anlardaki profesyonel zihniyetinizi yakaladiklari icin benzersiz deger sunar. Bugun tasidiginiz hırslar, yonlendirdiginiz zorluklar, size ilham veren mentorlar - tum bu detaylar yillar sonra tekrar ziyaret etmeyi buyuleyici bulacaginiz bir tablo cizer. Ayrica zor kariyer kararlariyla karsi karsiya kaldiginizda, sizin icin gercekten neyin onemli oldugunu hatirlatan bir perspektif saglarlar.",
        "Yeni basliyor olun, yeni bir alana dönüyor olun, liderlige dogru tirmanıyor olun veya uzun bir kariyer uzerine dusunuyor olun, bu ipuclari basarinin sizin icin kisisel olarak ne anlama geldigini ifade etmenize yardimci olur. Profesyonel tatmin taniminiz benzersiz bir sekilde sizindir ve bu konuda yazmak, basarinin harici tanimlarinin pesinden kosmak yerine otantik heveslerinizle uyumlu kalmaniza yardimci olur.",
      ],
      prompts: [
        "En cok gurur duydugunuz profesyonel basari nedir?",
        "Bes yil icinde kariyerinizi nerede goruyorsunuz?",
        "Gelecek yil hangi becerileri gelistirmek istiyorsunuz?",
        "Kariyerinizde basariyi nasil tanimliyorsunuz?",
        "Iste su anda hangi zorluklarla karsi karsiyasiniz?",
        "Ideal is-yasam dengenizi anlatin.",
        "Kariyerinizde kim mentor veya ilham kaynagi oldu?",
        "Basarisiz olamayacaginizi bilseniz ne yapardiniz?",
        "Isiniz araciligiyla nasil bir etki yaratmak istiyorsunuz?",
        "Gecmisteki benliginize hangi kariyer tavsiyesini verirdiniz?",
      ],
      writingTips: [
        "Hedefleriniz hakkinda spesifik olun. 'Basarili olmak istiyorum' yerine, basarinin tam olarak nasil gorunduğunu anlatin - calistiginiz rol, etki, gunluk deneyim.",
        "Mevcut durumunuz hakkinda baglam ekleyin - rolunuz, sektorunuz, ekonomik iklim. Bu, dusuncelerinizi gerceklige baglar ve tekrar ziyaret etmeyi daha anlamli kilar.",
        "Sadece harici basarilara odaklanmayin. Aradiginiz ic buyume hakkinda yazin - guven, liderlik varLigi, teknik ustalık veya yaratici ifade.",
        "Belirli bir gelecek kariyer kilometre tasinda kendinize yazmayi dusunun - bir sonraki terfiniz, bes yillik yildonumunuz veya emeklilik. Bu, mektubunuz icin net bir alici olusturur.",
        "Korkularinizi ve suphelerinizi heveslerinizin yanina ekleyin. Kariyer kaygisi normaldir ve gelecekteki benliginiz benzer endiselerle basartiginizi bilmekten rahatlık bulabilir.",
        "Degerleriiniz ve isinizin bunlarla nasil uyumlastigi uzerine dusunun. Profesyonel tatmin cogu zaman unvan veya tazminattan cok deger uyumuna baglidir.",
      ],
      resources: [
        "Bill Burnett ve Dave Evans'in 'Hayatinizi Tasarlamak' gibi kitaplar, bu yazma ipuclarini tamamlayan kariyer dusuncesi cerceveleri sunar.",
        "Gelecekteki kendinize profesyonel ilerleme ve pivotlar hakkinda kisa guncellemeler yazdiginiz uç aylik kariyer dusunce seanslari planlamayi dusunun.",
        "Buyuk bir kariyer karariyla karsi karsiyaysaniz, birden fazla gelecek senaryosundan mektuplar yazin - her yolda kendinizi hayal edin ve nasil gelisdigini geri yazin.",
        "Mentorluk onemlidir. Mektubunuzda mentorlardan bahsettiyseniz, onlara tesekkur etmek icin ulasmayı dusunun - minnnettarlik ifade etmek profesyonel iliskileri guclendirir.",
      ],
    },
    icon: "briefcase",
    color: "bg-indigo-100 border-indigo-400",
  },
  "relationships": {
    en: {
      title: "Relationships & Love Writing Prompts",
      description: "Explore your connections and reflect on love in all its forms with prompts designed for relationship reflection and growth.",
      seoTitle: "Relationships & Love Prompts | Deepen Your Connections",
      seoDescription: "Explore your connections and reflect on love in all its forms. Perfect for letters to your future self about relationships and personal growth.",
      introduction: [
        "Our relationships form the fabric of our lives - they shape our happiness, our growth, and our sense of belonging. These writing prompts invite you to explore your connections with others and with yourself, reflecting on love in all its forms. Whether you're thinking about romantic partnerships, friendships, family bonds, or your relationship with yourself, writing helps you understand what you truly value and need from your connections.",
        "Attachment theory research shows that our relationship patterns are deeply influential yet often unconscious. By writing about your relationships, you bring awareness to patterns that might otherwise go unexamined. This reflection helps you understand why you connect the way you do, what triggers your insecurities, and what allows you to feel secure in love. Your future self will gain insight from reading about how you understood relationships at different life stages.",
        "Letters about relationships serve a special purpose. They document not just your current connections but your evolving understanding of love, intimacy, and companionship. The way you think about relationships at twenty-five differs from thirty-five, which differs from fifty-five. These letters create a record of your relational growth that can offer perspective, comfort, and sometimes even gentle humor as you revisit your past insights.",
        "These prompts encourage honest exploration of both the joys and challenges in your relationships. Love isn't always easy, and acknowledging difficulties doesn't diminish connection - it deepens it. Your future self may be navigating similar challenges, finding strength from knowing you've reflected on these themes before, or celebrating how far you've come in creating the relationships you desire.",
        "Research by psychologist John Gottman, who studied thousands of couples, shows that relationship success depends less on compatibility and more on how partners handle conflict and express appreciation. Writing about your relationships helps you identify your own patterns in these crucial areas - how you respond to disagreement, express needs, and show love. This awareness is the first step toward more conscious, satisfying connections.",
        "The Harvard Study of Adult Development, one of the longest-running studies on happiness, found that close relationships are the strongest predictor of life satisfaction and longevity - more than wealth, fame, or social class. Letters reflecting on your relationships honor this profound truth, helping you invest consciously in the connections that will sustain you throughout your life. Future you will appreciate having documented what matters most.",
        "The clarity gained from writing about your relationships often reveals patterns and desires you hadn't consciously recognized, empowering you to create more intentional and fulfilling connections going forward.",
      ],
      prompts: [
        "What do you value most in your closest relationships?",
        "How do you show love to the people important to you?",
        "What relationship patterns do you want to change?",
        "Describe a relationship that has shaped who you are.",
        "What have your past relationships taught you?",
        "How do you want to improve as a partner/friend/family member?",
        "What does healthy love look like to you?",
        "Who do you need to forgive, including yourself?",
        "What do you want your future relationships to look like?",
        "Write about a moment of deep connection you've experienced.",
      ],
      writingTips: [
        "Consider all types of relationships - romantic, platonic, familial, professional, and your relationship with yourself. Each offers unique insights.",
        "Be honest about your struggles without dwelling in blame. Reflection is most valuable when it focuses on understanding rather than judgment.",
        "Include specific moments and memories. The details of a particular conversation or gesture can illuminate patterns more clearly than generalizations.",
        "Write about what you bring to relationships, not just what you receive. Understanding your own contributions helps you grow as a partner and friend.",
        "If writing about difficult relationships, allow yourself to explore complex emotions. It's okay to feel both love and frustration toward the same person.",
        "Consider the relationships you wish you had, not just the ones you currently have. Articulating your desires can help guide you toward creating them.",
        "Psychologist Eli Finkel's research on 'all-or-nothing marriage' suggests reflecting on whether you're expecting one person to meet all your needs or building a diverse support network. Write about which relationships fulfill which needs - romantic partnership, emotional support, intellectual stimulation, shared activities.",
        "Use the 'Michelangelo phenomenon' framework: write about how your closest relationships either help you become your ideal self or hold you back from it. Research shows that relationships where partners actively support each other's growth are the most satisfying and enduring.",
      ],
      resources: [
        "Books like 'Attached' by Amir Levine and Rachel Heller explain attachment styles in accessible ways that can deepen your relationship self-awareness.",
        "The five love languages framework (Gary Chapman) can help you understand how you and others prefer to give and receive love, informing your reflections.",
        "If you're processing a difficult relationship or breakup, consider working with a therapist who specializes in relationships and attachment.",
        "Gratitude practices specifically focused on relationships - regularly writing what you appreciate about loved ones - have been shown to strengthen bonds over time.",
      ],
    },
    tr: {
      title: "Iliskiler ve Ask Ipuclari",
      description: "Iliski dusuncesi ve buyumesi icin tasarlanmis ipuclariyla baglantılarınızı kesfedin ve aski tum bicimleriyle dusunun.",
      seoTitle: "Iliskiler ve Ask Ipuclari | Baglantılarınızı Derinlestirin",
      seoDescription: "Baglantılarınızı kesfedin ve aski tum bicimleriyle dusunun. Iliskiler ve kisisel buyume hakkinda gelecekteki kendinize mektuplar icin mukemmel.",
      introduction: [
        "Iliskilerimiz hayatlarimizin dokusunu olusturur - mutlulugumuzu, buyumemizi ve aidiyet duygumuzue sekillendirirler. Bu yazma ipuclari, baskalarıyla ve kendinizle baglantılarınızı kesfetmenize, aski tum bicimleriyle dusunmenize davet eder. Romantik ortakliklar, arkadasliklar, aile baglari veya kendinizle iliskiniz hakkinda dusunuyor olun, yazma baglantılarınızdan gercekten neye deger verdiginizi ve neye ihtiyac duydugunuzu anlamaniza yardimci olur.",
        "Baglanma teorisi arastirmalari, iliski kaliplarımizin derinden etkili ancak cogu zaman bilincdisi oldugunu gostermektedir. Iliskileriniz hakkinda yazarak, aksi takdirde incelenmeden kalabilecek kaliplara farkindalık getirirsiniz. Bu dusunce, neden baglandiginizi, guvensilizliklerinizi neyin tetikledigini ve askta guvenli hissetmenizi neyin sagladigini anlamaniza yardimci olur. Gelecekteki benliginiz, farkli yasam asamalarinda iliskileri nasil anladiginizi okumaktan icgoru kazanacaktir.",
        "Iliskiler hakkinda mektuplar ozel bir amaca hizmet eder. Sadece mevcut baglantіlarınızı degil, aynı zamanda ask, yakinlik ve arkadaslik anlayisinizin gelisimini de belgelerler. Iliskiler hakkinda yirmi besinde dusundugünuz sekil otuz besinden farklidir, ki o da elli besinden farklidir. Bu mektuplar, gecmis icgorulerinizi tekrar ziyaret ettiginizde perspektif, rahatlık ve bazen nazik mizah sunabilecek iliskisel buyumenizin bir kaydını olusturur.",
        "Bu ipuclari, iliskilerinịzdeki hem sevinclerin hem de zorlukların durust kesfini tesvik eder. Ask her zaman kolay degildir ve zorluklari kabul etmek baglantіyi azaltmaz - derinlestirir. Gelecekteki benliginiz benzer zorluklarla karsilаsiyor olabilir, bu temalar uzerine daha once dusundugunuzu bilmekten guc bulabilir veya arzuladiginiz iliskileri yaratmada ne kadar ilerlediginizi kutlayabilir.",
      ],
      prompts: [
        "En yakin iliskilerinizde en cok neye deger veriyorsunuz?",
        "Sizin icin onemli olan insanlara sevginizi nasil gosteriyorsunuz?",
        "Hangi iliski kaliplarini degistirmek istiyorsunuz?",
        "Kim oldugunuzu sekillendiren bir iliskiyi anlatin.",
        "Gecmis iliskileriniz size ne ogretti?",
        "Bir partner/arkadas/aile uyesi olarak nasil gelismek istiyorsunuz?",
        "Saglikli ask sizin icin nasil gorunuyor?",
        "Kendiniz dahil kimi affetmeniz gerekiyor?",
        "Gelecekteki iliskilerinizin nasil gorunmesini istiyorsunuz?",
        "Yasadiginiz derin bir baglanti anini yazin.",
      ],
      writingTips: [
        "Tum iliski turlerini dusunun - romantik, platonik, ailesel, profesyonel ve kendinizle iliskiniz. Her biri benzersiz icgorüler sunar.",
        "Suclama icinde kalmadan mucadeleleriniz hakkinda durust olun. Dusunce, yargilamaya degil anlamaya odaklandiğinda en degerlidir.",
        "Belirli anlari ve anilari dahil edin. Belirli bir konusma veya jestin detaylari kaliplari genellemelerden daha net aydinlatabilir.",
        "Sadece aldiginizi degil, iliskilere ne getirdiginizi yazin. Kendi katkilarinizi anlamak, bir partner ve arkadas olarak buyumenize yardimci olur.",
        "Zor iliskiler hakkinda yaziyorsaniz, karmasik duyguları kesfetmenize izin verin. Ayni kisiye karsi hem sevgi hem de hayal kirikligi hissetmek normaldir.",
        "Sadece mevcut degil, arzuladiginiz iliskileri de dusunun. Arzularinizi ifade etmek, onlari olusturmaya dogru size rehberlik edebilir.",
      ],
      resources: [
        "Amir Levine ve Rachel Heller'in 'Baglanma' gibi kitaplar baglanma stillerini erisilebilir sekillerde aciklar ve iliski oz-farkindalığinizi derinlestirebilir.",
        "Bes ask dili cercevesi (Gary Chapman), siz ve baskalarinin sevgiyi nasil vermeyi ve almayi tercih ettigini anlamaniza yardimci olabilir ve dusuncelerinizi bilgilendirir.",
        "Zor bir iliski veya ayrilik islemek istiyorsanız, iliskiler ve baglanma konusunda uzmanlasmis bir terapistle calismayi dusunun.",
        "Ozellikle iliskilere odaklanan sukran uygulamalari - sevdikleriniz hakkinda takdir ettiginiz seyleri duzenli olarak yazmak - zamanla baglari guclendirdigi gosterilmistir.",
      ],
    },
    icon: "heart",
    color: "bg-rose-100 border-rose-400",
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all prompt themes
 */
export function getAllPromptThemes(): Array<{
  theme: PromptTheme
  data: PromptThemeContent
}> {
  return promptThemes.map((theme) => ({
    theme,
    data: promptContent[theme],
  }))
}

/**
 * Get a single prompt theme
 */
export function getPromptTheme(theme: string): PromptThemeContent | undefined {
  if (!promptThemes.includes(theme as PromptTheme)) return undefined
  return promptContent[theme as PromptTheme]
}

/**
 * Calculate word count for a prompt theme
 * Includes: introduction + prompts + writing tips + resources
 */
export function getPromptThemeWordCount(
  theme: string,
  locale: "en" | "tr" = "en"
): number {
  const themeData = getPromptTheme(theme)
  if (!themeData) return 0

  const localeContent = themeData[locale]

  // Join all content sources
  const allContent = [
    localeContent.title,
    localeContent.description,
    ...localeContent.introduction,
    ...localeContent.prompts,
    ...localeContent.writingTips,
    ...localeContent.resources,
  ].join(" ")

  // Count words
  return allContent.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Get prompts by theme (returns just the prompt strings)
 */
export function getPromptsForTheme(
  theme: string,
  locale: "en" | "tr" = "en"
): string[] {
  const themeData = getPromptTheme(theme)
  if (!themeData) return []
  return themeData[locale].prompts
}
