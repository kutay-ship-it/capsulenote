/**
 * Template Content Registry
 *
 * Centralized content for all letter templates, following the blog-content.ts pattern.
 * Used by: templates pages, sitemap.ts, validate-seo-quality.ts
 *
 * Quality gates:
 * - Content: 800+ words per template
 * - Title: 30-60 characters
 * - Description: 120-160 characters
 * - Bilingual: EN + TR for all content
 */

import { templateCategories, type TemplateCategory } from "./content-registry"

// =============================================================================
// TYPES
// =============================================================================

export interface TemplateLocalizedContent {
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  content: string[] // Main explanatory content (target: 400-450 words)
  guidingQuestions: string[] // Questions to guide writing (target: 150-200 words)
  sampleOpening: string
  howToSteps: Array<{ name: string; text: string }> // Step-by-step guide (target: 150-200 words)
}

export interface TemplateContent {
  en: TemplateLocalizedContent
  tr: TemplateLocalizedContent
  estimatedTime: string
  category: TemplateCategory
}

export type TemplateSlug = string
export type TemplateContentRegistry = Record<TemplateCategory, Record<TemplateSlug, TemplateContent>>

// =============================================================================
// TEMPLATE DATA
// =============================================================================

export const templateContent: TemplateContentRegistry = {
  "self-reflection": {
    "annual-self-check": {
      en: {
        title: "Annual Self-Check Letter Template",
        description: "A yearly ritual of honest reflection on your growth, challenges, and aspirations. Document your journey and create a meaningful record for your future self.",
        seoTitle: "Annual Self-Check Letter Template | Write to Your Future Self",
        seoDescription: "Write a yearly reflection letter to your future self. Review your growth, celebrate wins, and set intentions for the year ahead with our guided template.",
        content: [
          "The annual self-check is a powerful practice of pausing once a year to take stock of where you are, where you've been, and where you want to go. It's a moment to be honest with yourself about your growth, your setbacks, and your dreams. This ancient tradition of yearly reflection has been practiced across cultures for centuries, from the philosophical practices of ancient Stoics to modern journaling movements.",
          "Research in positive psychology shows that regular self-reflection significantly improves emotional intelligence, decision-making abilities, and overall life satisfaction. Dr. Tasha Eurich's studies reveal that only about 10-15% of people are truly self-aware, yet this skill is foundational to personal growth. Writing an annual letter creates structured time for the deep reflection that builds genuine self-awareness.",
          "This template guides you through the key questions that make an annual reflection meaningful. You'll capture not just what happened, but how it shaped you and what you want to carry forward. The process of articulating your experiences in writing helps consolidate memories and extract wisdom from both successes and challenges.",
          "When you receive this letter in the future, you'll have a window into who you were at this moment - your hopes, fears, and the small details of daily life that memory tends to blur over time. Studies show that our future selves often feel like strangers to us; these letters bridge that psychological distance and create continuity in your personal narrative.",
          "The annual self-check becomes even more powerful when practiced consistently over multiple years. You begin to see patterns in your growth, recurring themes in your challenges, and the gradual evolution of your dreams. Many practitioners report that reading letters from five or ten years ago provides profound insights into how far they've come.",
          "Consider making this practice a sacred ritual. Choose a consistent date each year - perhaps your birthday, New Year's Day, or another personally significant moment. Create a comfortable environment without distractions, where you can reflect deeply and write honestly. The investment of 30-60 minutes in this practice yields benefits that compound over your lifetime.",
          "Research from Harvard Business School demonstrates that employees who spent just 15 minutes at the end of the day reflecting on lessons learned performed 23% better on subsequent tasks than those who didn't reflect. This data highlights how structured reflection - like an annual self-check - doesn't just preserve memories, it actively enhances our ability to learn from experience and apply those lessons moving forward. Your annual letter becomes both a historical record and a learning tool, helping you identify what strategies worked, what didn't, and why.",
          "The psychological concept of 'temporal landmarks' explains why annual reflection is particularly powerful. Research by Hengchen Dai and colleagues shows that fresh starts - like birthdays, New Year's, or anniversaries - create psychological distance from past imperfections and motivate aspirational behaviors. By anchoring your annual self-check to such a landmark, you leverage this natural motivation boost. The ritual becomes a reliable checkpoint where you can celebrate progress, forgive setbacks, and recommit to your authentic path with renewed clarity and compassion for the journey ahead.",
        ],
        guidingQuestions: [
          "What were your biggest wins this year, and what made them possible?",
          "What challenges did you overcome, and what strengths did they reveal in you?",
          "What are you most grateful for right now, and how has gratitude shaped your year?",
          "What do you want to remember about this time in your life that might otherwise be forgotten?",
          "What are your hopes and dreams for the year ahead, and what first steps will you take?",
          "What advice would you give your future self based on what you've learned this year?",
          "How have your relationships evolved, and what do they mean to you now?",
          "What beliefs or assumptions have you questioned or changed this year?",
        ],
        sampleOpening: "Dear Future Me, as I sit down to write this on [date], I'm reflecting on a year that has been both challenging and transformative. Looking back at who I was twelve months ago, I'm struck by how much has changed - not just in my circumstances, but in who I've become...",
        howToSteps: [
          { name: "Create sacred space", text: "Set aside 45-60 minutes in a calm, comfortable environment where you won't be interrupted. Consider lighting a candle or playing soft music to mark this as special time." },
          { name: "Review your year thoroughly", text: "Look through photos, journals, calendars, and social media to remember key moments and milestones. Don't rely on memory alone - we often forget significant events and emotions." },
          { name: "Answer the guiding questions deeply", text: "Work through each question honestly, writing from your heart without self-censorship. Allow yourself to feel the emotions that arise as you reflect." },
          { name: "Add personal context and details", text: "Include specifics about your current life that you might forget - where you live, who you spend time with, what brings you joy, what worries you, what you're reading or watching." },
          { name: "Set meaningful intentions", text: "Based on your reflections, articulate clear intentions for the year ahead. Be specific about what you want to cultivate, release, or achieve." },
          { name: "Schedule delivery thoughtfully", text: "Choose a meaningful date one year from now - perhaps the same date next year to create an annual tradition of receiving and writing these letters." },
        ],
      },
      tr: {
        title: "Yillik Oz-Kontrol Mektup Sablonu",
        description: "Buyumeniz, zorluklariniz ve hedefleriniz uzerine durust bir yillik dusunce ritueli. Yolculugunuzu belgeleyin ve gelecekteki kendiniz icin anlamli bir kayit olusturun.",
        seoTitle: "Yillik Oz-Kontrol Mektup Sablonu | Gelecekteki Kendine Yaz",
        seoDescription: "Gelecekteki kendinize yillik bir dusunce mektubu yazin. Rehberli sablonumuzla buyumenizi gozden gecirin ve niyetler belirleyin.",
        content: [
          "Yillik oz-kontrol, nerede oldugunuzu, nerede bulundugunuzu ve nereye gitmek istediginizi degerlendirmek icin yilda bir kez duraklamanin guclu bir uygulamasidir. Buyumeniz, gerilemeleriniz ve hayalleriniz hakkinda kendinize karsi durust olmanin bir anidir. Bu kadim yillik dusunce gelenegi, antik Stoiklerin felsefi pratiklerinden modern gunluk tutma hareketlerine kadar yuzyillar boyunca kulturler arasi uygulanmistir.",
          "Pozitif psikoloji arastirmalari, duzenlı oz-dusuncenin duygusal zeka, karar verme yetenekleri ve genel yasam memnuniyetini onemli olcude iyilestirdigini gostermektedir. Dr. Tasha Eurich'in calismalari, insanlarin yalnizca yakla ık %10-15'inin gercekten oz-farkinda oldugunu, ancak bu becerinin kisisel gelisim icin temel oldugunu ortaya koymaktadır.",
          "Bu sablon, yillik bir dusunceyi anlamli kilan temel sorularda size rehberlik eder. Sadece ne oldugunu degil, sizi nasil sekillendirdigini ve ne tasimak istediginizi yakalayacaksiniz. Deneyimlerinizi yazili olarak ifade etme sureci, anilari pekistirmeye ve hem basarilardan hem de zorluklardan bilgelik cikarmaniza yardimci olur.",
          "Gelecekte bu mektubu aldiginizda, bu andaki kendinize bir pencere acilacak - umutlariniz, korkulariniz ve hafizanin zamanla bulaniklastirdigi gunluk yasamin kucuk detaylari. Calismalar, gelecekteki benliklerimizin cogu zaman bize yabanci gibi hissettigini gostermektedir.",
          "Yillik oz-kontrol, birden fazla yil boyunca tutarli bir sekilde uygulandiginda daha da guclu hale gelir. Buyumenizde kaliplari, zorluklarinizdaki yinelenen temalari ve hayallerinizin kademeli evrimini gormeye baslars ınız. Bircok uygulayici, bes veya on yil onceki mektuplari okumanin ne kadar ilerledigine dair derin icgoruler sagladigini bildirmektedir.",
          "Bu uygulamayi kutsal bir rituel haline getirmeyi dusunun. Her yil tutarli bir tarih secin - belki dogum gununuz, Yeni Yil Gunu veya baska bir kisisel olarak anlamli an. Derin dusunebileceginiz ve durustce yazabileceginiz, dikkat dagiticilardan uzak rahat bir ortam yaratın.",
        ],
        guidingQuestions: [
          "Bu yil en buyuk basarilariniz neydi ve onlari ne mumkun kildi?",
          "Hangi zorluklarin ustesinden geldiniz ve sizde hangi gucleri ortaya cikardilar?",
          "Su anda en cok neye minnettar hissediyorsunuz ve sukran yilinizi nasil sekillendirdi?",
          "Hayatinizin bu doneminden aksi takdirde unutulabilecek neyi hatirlamak istiyorsunuz?",
          "Onumuzdeki yil icin umutlariniz ve hayalleriniz neler ve hangi ilk adimlari atacaksiniz?",
          "Bu yil ogrendiklerinize dayanarak gelecekteki kendinize ne tavsiye verirsiniz?",
          "Iliskileriniz nasil gelisti ve simdi sizin icin ne anlam ifade ediyorlar?",
          "Bu yil hangi inanclar ı veya varsayimlari sorguladiniz veya degistirdiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, [tarih] tarihinde bunu yazarken, hem zorlu hem de donusturucu olan bir yili dusunuyorum. On iki ay onceki kendime baktigimda, ne kadar cok seyin degistigine sasiriyorum - sadece kosullarimda degil, kim oldugumda da...",
        howToSteps: [
          { name: "Kutsal alan yaratin", text: "Rahatsiz edilmeyeceginiz sakin, rahat bir ortamda 45-60 dakika ayirin. Bunu ozel bir zaman olarak isaretlemek icin bir mum yakmay i veya hafif muzik calmay i dusunun." },
          { name: "Yilinizi kapsamli bir sekilde gozden gecirin", text: "Onemli anlari ve kilometre taslarini hatirlamak icin fotograflara, gunluklere, takvimlere ve sosyal medyaya bakin. Yalnizca hafizaya guvenmeyin." },
          { name: "Rehber sorulari derinden cevaplayin", text: "Her soruyu durustce, oz-sansur yapmadan kalbinizden yazarak cevaplayin. Dusundukce ortaya cikan duygulari hissetmenize izin verin." },
          { name: "Kisisel baglam ve detaylar ekleyin", text: "Unutabileceginiz mevcut yasaminiz hakkinda ayrintilar ekleyin - nerede yasadiginizi, kiminle vakit gecirdiginizi, sizi neyin mutlu ettigini." },
          { name: "Anlamli niyetler belirleyin", text: "Dusuncelerinize dayanarak, onumuzdeki yil icin net niyetler ifade edin. Neyi gelistirmek, birakmak veya başarmak istediginiz konusunda spesifik olun." },
          { name: "Teslimat zamanini dikkatlice planlyin", text: "Bir yil sonra anlamli bir tarih secin - belki gelecek yil ayni tarihte bu mektuplari alma ve yazma yillik gelenegi olusturmak icin." },
        ],
      },
      estimatedTime: "45-60 min",
      category: "self-reflection",
    },
    "mindfulness-moment": {
      en: {
        title: "Mindfulness Moment Letter Template",
        description: "Capture your present state of mind with awareness and compassion. Create a snapshot of your inner world that your future self can treasure and learn from.",
        seoTitle: "Mindfulness Moment Letter Template | Present-Moment Awareness",
        seoDescription: "Write a mindful letter to your future self. Capture your present thoughts, feelings, and awareness with compassion using our guided mindfulness template.",
        content: [
          "A mindfulness moment letter invites you to pause and truly notice what's present in your experience right now - without judgment, with curiosity and compassion. In our fast-paced world where we're constantly rushing from one task to the next, this practice creates an island of presence that you can gift to your future self.",
          "The practice of mindful writing has roots in contemplative traditions spanning thousands of years. Modern neuroscience confirms what practitioners have long known: the act of bringing non-judgmental awareness to our present experience actually changes our brain structure, strengthening neural pathways associated with emotional regulation and well-being.",
          "This practice helps create a snapshot of your inner world that your future self can revisit. It's an anchor point that reminds you how you once experienced life, what mattered to you, and how you related to your own thoughts and feelings. These snapshots become increasingly precious as time passes and we naturally forget the texture of past moments.",
          "When you read this letter later, you'll reconnect with a version of yourself who took the time to be fully present, which can be a powerful gift during busy or challenging times. Research shows that reading about past positive experiences can boost mood and provide perspective during difficulties.",
          "The key to this practice is approaching it without expectations or goals. Unlike goal-setting letters, this one is purely about witnessing what is, exactly as it is. You're not trying to fix anything, achieve anything, or become anything different. You're simply noticing and recording your present-moment experience.",
          "Consider writing mindfulness moment letters during different emotional states - not just when you feel peaceful, but also when you're anxious, excited, sad, or confused. Your future self will benefit from having access to your full emotional range and the wisdom you gained from meeting each experience with presence.",
          "Neuroscientific research by Dr. Sara Lazar at Harvard Medical School reveals that regular mindfulness practice literally changes brain structure, increasing gray matter density in regions associated with learning, memory, and emotional regulation while decreasing density in the amygdala, the brain's fear center. Writing mindfulness moment letters serves as both practice and documentation of this transformative process. Each letter is an exercise in present-moment awareness that strengthens your capacity for mindfulness while creating a record of your evolving relationship with the present.",
          "The practice of capturing mindful moments in writing addresses what psychologists call 'experience decay' - our tendency to quickly forget the richness of lived experience. Studies on memory show that we retain emotional content but lose sensory and contextual details within days. By documenting the full texture of your present experience - sights, sounds, physical sensations, and emotional nuances - you preserve what would otherwise be lost. These preserved moments become anchors for mindfulness practice, reminding your future self of the depth available in any given moment when approached with awareness.",
          "Research on savoring - the conscious attention to pleasurable experiences - shows that people who intentionally notice and appreciate positive moments report significantly higher well-being and life satisfaction. Mindfulness letters formalize this savoring practice, creating deliberate space to attend fully to your experience. Whether capturing a moment of joy, peace, or even productive struggle, the act of writing slows you down enough to truly receive the experience rather than rushing past it.",
        ],
        guidingQuestions: [
          "What sensations do you notice in your body right now? Where do you feel tension, warmth, or ease?",
          "What emotions are present for you in this moment? Can you name them without trying to change them?",
          "What thoughts keep arising, and can you observe them without attachment or judgment?",
          "What are you grateful for in this present moment, however small?",
          "What sounds, smells, or physical sensations are part of your current experience?",
          "What do you want your future self to remember about the gift of being present?",
          "What wisdom or insight is available to you right now that might be easy to forget?",
        ],
        sampleOpening: "Dear Future Me, I'm writing this from a place of presence, noticing the quality of light filtering through my window, the subtle hum of the world around me, and the rhythm of my own breathing. In this moment, I'm aware of...",
        howToSteps: [
          { name: "Ground yourself fully", text: "Take three deep breaths, feeling your feet on the floor and your body in your seat. Let go of any agenda for this time and arrive fully in the present moment." },
          { name: "Practice non-judgmental observation", text: "Notice your thoughts, feelings, and sensations with curiosity rather than criticism. There's no wrong way to feel or think right now." },
          { name: "Write from embodied awareness", text: "Capture what you notice in simple, honest language. Don't try to be poetic or profound - just describe your direct experience." },
          { name: "Include sensory details", text: "Note what you see, hear, smell, taste, and feel physically. These details make the moment vivid and memorable." },
          { name: "Express compassion for yourself", text: "Include kind words for your future self. Remind them of your shared humanity and the importance of self-kindness." },
          { name: "Choose a meaningful delivery date", text: "Select a time when you might need this reminder of presence - perhaps during a typically stressful period or as a regular monthly practice." },
        ],
      },
      tr: {
        title: "Farkindalik Ani Mektup Sablonu",
        description: "Mevcut zihin durumunuzu farkindalik ve sefkatle yakalay in. Gelecekteki benliginizin deger verecegi ve ogrenebildigi ic dunyanizin bir anlık goruntusunu olusturun.",
        seoTitle: "Farkindalik Ani Mektup Sablonu | Anın Farkindaliği",
        seoDescription: "Gelecekteki kendinize farkinda bir mektup yazin. Rehberli farkindalik sablonumuzla mevcut dusuncelerinizi ve duygularinizi sefkatle yakalay in.",
        content: [
          "Bir farkindalik ani mektubu, sizi durdurmaya ve su anda deneyiminizde neyin mevcut oldugunu gercekten fark etmeye davet eder - yargilamadan, merak ve sefkatle. Bir gorevden digerine surekli koştuğumuz hizli tempolu dunyamizda, bu uygulama gelecekteki kendinize hediye edebileceginiz bir mevcudiyet adasi yaratir.",
          "Farkinda yazma uygulamasinin kokleri binlerce yili kapayan tefekkur geleneklerine dayanmaktadir. Modern norobiliim, uygulayicilarin uzun suredir bildiklerini dogrulamaktadir: mevcut deneyimimize yargilamasiz farkindalik getirme eylemi aslinda beyin yapimizi degistirir.",
          "Bu uygulama, gelecekteki benliginizin yeniden ziyaret edebilecegi ic dunyanizin bir anlık goruntusunu olusturmaya yardimci olur. Bu, bir zamanlar yasami nasil deneyimlediginizi, sizin icin neyin onemli oldugunu ve kendi dusuncelerinizle duygulariniza nasil iliskilendiginizi hatirlatan bir dayanak noktasidir.",
          "Bu mektubu daha sonra okudugunda, tam anlamiyla mevcut olmak icin zaman ayiran bir kendinle yeniden baglanti kuracaksiniz, bu da yogun veya zorlu zamanlarda guclu bir hediye olabilir. Arastirmalar, gecmis olumlu deneyimler hakkinda okumani ruh halini iyilestirebilecegini gostermektedir.",
          "Bu uygulamanin anahtari, ona beklentiler veya hedefler olmadan yaklasmaktır. Hedef belirleme mektuplarinin aksine, bu tamamen oldugu gibi olan seye taniklik etmekle ilgilidir. Bir seyi duzeltmeye, bir sey başarmaya veya farkli bir sey olmaya calismiyorsunuz.",
          "Farkli duygusal durumlarda farkindalik ani mektuplari yazmayi dusunun - sadece huzurlu hissettiginizde degil, ayni zamanda endiseli, heyecanli, uzgun veya kafasi karismis oldugunuzda da. Gelecekteki benliginiz, tam duygusal yelpazenize ve her deneyimi mevcudiyetle karsilamaktan kazandiginiz bilgelige erisebilmekten faydalanacaktır.",
        ],
        guidingQuestions: [
          "Su anda vucudunuzda hangi hisleri fark ediyorsunuz? Nerede gerginlik, sicaklik veya rahatlık hissediyorsunuz?",
          "Bu anda sizin icin hangi duygular mevcut? Onlari degistirmeye calismadan adlandirabilir misiniz?",
          "Hangi dusunceler ortaya cikmaya devam ediyor ve onlari baglilik veya yargilama olmadan gozlemleyebilir misiniz?",
          "Su anki anda, ne kadar kucuk olursa olsun, neye minnettar hissediyorsunuz?",
          "Mevcut deneyiminizin parcasi olan hangi sesler, kokular veya fiziksel hisler var?",
          "Gelecekteki benliginizin mevcut olma hediyesi hakkinda ne hatilamasini istiyorsunuz?",
          "Su anda hangi bilgelik veya icgoru mevcut ve unutulmasi kolay olabilir?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bunu bir mevcudiyet yerinden yaziyorum, penceremden suzdlen isigin kalitesini, etrafımdaki dunyanin hafif ugultusunu ve kendi nefesimin ritmini fark ederek. Bu anda farkindayim...",
        howToSteps: [
          { name: "Kendinizi tam olarak toparlayin", text: "Uc derin nefes alin, ayaklarinizi yerde ve vucudunuzu koltugunda hissedin. Bu zaman icin herhangi bir gundemi birakin ve şu ana tam olarak gelin." },
          { name: "Yargilamasiz gozlem yapın", text: "Dusuncelerinizi, duygularinizi ve hislerinizi elestiri yerine merakla gozlemleyin. Su anda hissetmenin veya dusunmenin yanlis bir yolu yok." },
          { name: "Somutlastirilmis farkindaliliktan yazin", text: "Fark ettiklerinizi basit, durust bir dilde yakalay in. Siirsel veya derin olmaya calismayin - sadece dogrudan deneyiminizi tanimlayin." },
          { name: "Duyusal detaylar ekleyin", text: "Gorduklerinizi, duyduklarinizi, kokladiklarınızı, tattiklarinizi ve fiziksel olarak hissettiklerinizi not edin." },
          { name: "Kendinize sefkat ifade edin", text: "Gelecekteki kendiniz icin nazik sozler ekleyin. Onlara ortak insanliginizi ve oz-sefkatin onemini hatirlatin." },
          { name: "Anlamli bir teslimat tarihi secin", text: "Bu mevcudiyet hatiratmasina ihtiyac duyabileceginiz bir zaman secin - belki tipik olarak stresli bir donemde veya duzenli aylik bir uygulama olarak." },
        ],
      },
      estimatedTime: "20-30 min",
      category: "self-reflection",
    },
    "values-reflection": {
      en: {
        title: "Values Reflection Letter Template",
        description: "Explore and document your core values and how you're living them. Create clarity about what matters most and build alignment between your values and daily life.",
        seoTitle: "Values Reflection Letter Template | Discover Your Core Values",
        seoDescription: "Write a letter exploring your core values. Document what matters most and how you're living your values with our guided reflection template.",
        content: [
          "Understanding your core values is essential for living a meaningful, authentic life. This template helps you articulate what matters most to you and reflect on how well your life aligns with those values. Values serve as your internal compass, guiding decisions both large and small, and providing a foundation for genuine fulfillment.",
          "Values clarification has been studied extensively in psychology and has been shown to improve decision-making, reduce anxiety, increase resilience, and enhance overall well-being. When we live in alignment with our values, we experience what psychologists call 'value congruence' - a state associated with greater life satisfaction and psychological health.",
          "Values can shift over time as we grow and change. What mattered deeply to you at twenty may feel less important at forty, while new values may emerge from life experiences you couldn't have anticipated. This letter creates a record of what you believe in now, which your future self can compare to see how you've evolved.",
          "By writing about your values, you strengthen your commitment to them and give your future self a compass for decision-making. Research shows that simply reflecting on personal values activates brain regions associated with self-relevance and meaning, making you more likely to act in accordance with those values.",
          "The gap between our stated values and our lived values often causes internal conflict and dissatisfaction. This template invites honest assessment of where you're aligned and where you're not. This awareness is the first step toward closing that gap and living with greater integrity.",
          "Consider returning to this values reflection annually or during major life transitions. As you accumulate these letters over time, you'll gain profound insight into your personal evolution and what has remained constant at your core versus what has changed with life experience.",
          "Dr. Kelly McGonigal's research on values affirmation shows remarkable results: students who wrote about their core values for just 15 minutes showed improved grades, better health behaviors, and reduced stress levels months later. The act of clarifying and affirming values creates what psychologists call 'self-integrity' - a psychological resource that helps us navigate challenges and make difficult decisions. Your values reflection letter serves this same function, providing a touchstone you can return to when facing crossroads or when life's demands threaten to pull you away from what matters most.",
          "Values-based living has been consistently linked to greater psychological well-being, resilience, and life satisfaction across diverse populations and cultures. Research in Acceptance and Commitment Therapy demonstrates that people who identify their values and take committed action toward them report higher quality of life even when facing significant challenges. This letter helps you not only articulate your values but also creates accountability to your future self. When you read it later, you'll be able to assess whether your actions matched your stated values, providing valuable feedback for continued growth and alignment.",
          "The practice of values reflection becomes especially powerful during times of transition or uncertainty. When facing major life decisions - career changes, relationship commitments, geographic moves - having a clear record of your values provides an anchor point for decision-making. Many people report that re-reading their values letters during challenging times helped them reconnect with their authentic priorities and make choices they wouldn't regret.",
        ],
        guidingQuestions: [
          "What are the 3-5 values that matter most to you, and why do they hold such importance?",
          "How are you currently living these values in your daily life? Give specific examples.",
          "Where do you feel misaligned with your values, and what obstacles prevent alignment?",
          "What would living more fully aligned with your values look like in practice?",
          "What do you want your future self to remember about what matters most?",
          "How have your values evolved over the past 5-10 years?",
          "What decisions are easier when you're clear about your values?",
          "Who exemplifies living by their values in a way that inspires you?",
        ],
        sampleOpening: "Dear Future Me, I've been thinking deeply about what truly matters to me, and I want to share and document the values that guide my life right now. These aren't just abstract concepts - they're the principles I try to honor in my daily choices, even when it's difficult...",
        howToSteps: [
          { name: "Identify your core values", text: "Reflect on what principles guide your decisions and bring you fulfillment. Consider moments when you felt most alive and authentic - what values were you honoring?" },
          { name: "Assess current alignment", text: "Honestly evaluate how well your current life reflects these values. Look at how you spend your time, energy, and resources as indicators of lived values." },
          { name: "Acknowledge gaps with compassion", text: "Note areas where you're not living in alignment and explore why, without harsh self-judgment. Understanding the obstacles helps you address them." },
          { name: "Set values-based intentions", text: "Write about how you want to live these values going forward. Be specific about practices or changes that would bring greater alignment." },
          { name: "Connect values to decisions", text: "Consider upcoming decisions or challenges and how your values should guide your approach." },
          { name: "Schedule for periodic reflection", text: "Choose a date 6-12 months out to check in on your values alignment and continue this ongoing practice." },
        ],
      },
      tr: {
        title: "Degerler Dusuncesi Mektup Sablonu",
        description: "Temel degerlerinizi ve onlari nasil yasadiginizi kesfedin ve belgeleyin. En onemli seyler hakkinda netlik yaratin ve degerlerinizle gunluk yasam arasinda uyum kurun.",
        seoTitle: "Degerler Dusuncesi Mektup Sablonu | Temel Degerlerinizi Kesfedin",
        seoDescription: "Temel degerlerinizi kesfeden bir mektup yazin. Rehberli dusunce sablonumuzla en onemli seyleri ve degerlerinizi nasil yasadiginizi belgeleyin.",
        content: [
          "Temel degerlerinizi anlamak, anlamli ve otantik bir yasam surmek icin onemlidir. Bu sablon, sizin icin en onemli seyleri ifade etmenize ve yasaminizin bu degerlerle ne kadar uyumlu oldugunu dusunmenize yardimci olur. Degerler, buyuk ve kucuk kararlara rehberlik eden ve gercek tatmin icin temel saglayan ic pusulaniz olarak hizmet eder.",
          "Deger netlestirme psikolojide kapsamlı bir sekilde calışılmıştır ve karar vermeyi iyilestirdigi, kaygıyı azalttigi, dayaniklılığı artirdigi ve genel refahı gelistirdigi gosterilmistir. Degerlerimizle uyum icinde yasadigimizda, psikologların 'deger uyumu' dedigini deneyimleriz.",
          "Degerler buyudukce ve degistikce zamanla degisebilir. Yirmi yasinda sizin icin derinden onemli olan sey kırk yasinda daha az onemli hissedebilir, ongoremedиginiz yasam deneyimlerinden yeni degerler ortaya cikabilir. Bu mektup, su anda neye indiginizin bir kaydini olusturur.",
          "Degerleriniz hakkinda yazarak, onlara bagiliginizi guclendirir ve gelecekteki kendinize karar verme icin bir pusula verirsiniz. Arastirmalar, kisisel degerler uzerine sadece dusunmenin oz-iliski ve anlamla iliskili beyin bolgelerini aktive ettigini gostermektedir.",
          "Belirtilen degerlerimiz ile yasanan degerlerimiz arasındaki boşluk genellikle ic catismaya ve memnuniyetsizlige neden olur. Bu sablon, nerede uyumlu oldugunuz ve nerede olmadiginiz konusunda durust bir degerlendirmeye davet eder.",
          "Yillik olarak veya buyuk yasam gecisleri sirasinda bu degerler dusuncesine donmeyi dusunun. Zamanla bu mektuplari biriktirdikce, kisisel evrиminize ve deneyimle neyin degistigine karsi cekirdekte neyin sabit kaldigına dair derin icgoru kazanacaksiniz.",
        ],
        guidingQuestions: [
          "Sizin icin en onemli 3-5 deger nedir ve neden bu kadar onem tasiyorlar?",
          "Simdi bu degerleri gunluk hayatinizda nasil yasiyorsunuz? Spesifik ornekler verin.",
          "Degerlerinizle uyumsuz oldugunu nerede hissediyorsunuz ve hangi engeller uyumu engelliyor?",
          "Degerlerinizle daha tam uyumlu yasamak pratikte nasıl gorunurdu?",
          "Gelecekteki benliginizin en onemli seyler hakkinda ne hatirlamasini istiyorsunuz?",
          "Degerleriniz son 5-10 yilda nasil gelisti?",
          "Degerleriniz hakkinda net oldugunuzda hangi kararlar daha kolay?",
          "Degerleriyle yasamayi size ilham veren bir sekilde kim ornekliyor?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, benim icin gercekten neyin onemli oldugunu derinden dusunuyordum ve simdi hayatima yol gosteren degerleri paylasip belgelemek istiyorum. Bunlar sadece soyut kavramlar degil - zor olsa bile gunluk secimlerimde onurlandirmaya calistigim ilkeler...",
        howToSteps: [
          { name: "Temel degerlerinizi belirleyin", text: "Kararlarinizi yonlendiren ve size tatmin getiren ilkeleri dusunun. En canli ve otantik hissettiginiz anlari dusunun - hangi degerleri onurlandiriyordunuz?" },
          { name: "Mevcut uyumu degerlendirin", text: "Mevcut yasaminizin bu degerleri ne kadar iyi yansittigini durustce degerlendirin. Yasanan degerlerin gostergeleri olarak zamaninizi, enerjinizi ve kaynaklarinizi nasil harcadiginiza bakin." },
          { name: "Bosluklari sefkatle kabul edin", text: "Uyum icinde yasamadiginiz alanlari not edin ve sert oz-yargilama olmadan neden oldugunu arastirin." },
          { name: "Deger tabanli niyetler belirleyin", text: "Bu degerleri ileriye dogru nasil yasamak istediginizi yazin. Daha buyuk uyum getirecek uygulamalar veya degisiklikler hakkinda spesifik olun." },
          { name: "Degerleri kararlarla iliskilendirin", text: "Yaklasan kararlari veya zorluklari ve degerlerinizin yaklasiminiza nasil yol gostermesi gerektigini dusunun." },
          { name: "Periyodik dusunce icin planlyin", text: "Deger uyumunuzu kontrol etmek ve bu devam eden uygulamayi surdurmek icin 6-12 ay sonra bir tarih secin." },
        ],
      },
      estimatedTime: "30-40 min",
      category: "self-reflection",
    },
  },
  // Additional categories will be added by expansion agents
  "goals": {
    "new-years-resolution": {
      en: {
        title: "New Year's Resolution Letter Template",
        description: "Transform your resolutions into a meaningful commitment letter to your future self. Create accountability and capture your hopes for the year ahead.",
        seoTitle: "New Year's Resolution Letter Template | Future Self Goals",
        seoDescription: "Write a powerful New Year's resolution letter to your future self. Create lasting accountability and transform intentions into meaningful commitments.",
        content: [
          "New Year's resolutions have been a tradition for over 4,000 years, dating back to ancient Babylon where people made promises to their gods at the start of each year. Despite this long history, research shows that only about 9% of people who make resolutions actually complete them. The gap between intention and action remains one of the greatest challenges in personal development.",
          "Writing a letter to your future self transforms the resolution process from a fleeting wish into a documented commitment. Psychology research by Dr. Gail Matthews at Dominican University found that people who write down their goals are 42% more likely to achieve them. When you put your resolutions in letter form, you create both accountability and a deeper emotional connection to your future self.",
          "The act of addressing your resolutions to your future self activates what psychologists call 'future self-continuity' - the degree to which you feel connected to the person you'll become. Studies by Dr. Hal Hershfield at UCLA show that people with higher future self-continuity make better long-term decisions and are more likely to follow through on commitments.",
          "This template guides you beyond simple goal statements to explore the deeper motivations behind your resolutions. Understanding why a goal matters to you - not just what you want to achieve - dramatically increases your chances of success. You'll capture not just the goals themselves, but the person you want to become and the life you want to create.",
          "When your letter arrives at the end of the year, you'll have a clear record of your intentions and the wisdom to evaluate not just whether you achieved your goals, but how you grew in the process. Many people find that even 'failed' resolutions teach valuable lessons about priorities, realistic expectations, and self-compassion.",
          "Consider writing your resolution letter during the reflective period between Christmas and New Year's Day, when natural rhythms support introspection. Create a quiet, comfortable space without distractions, and give yourself at least 45 minutes to write thoughtfully. This investment of time signals to your subconscious that these commitments truly matter.",
          "The neuroscience of commitment reveals why written resolutions are particularly powerful. Dr. Art Markman's research on prospective memory - our ability to remember to do things in the future - shows that external memory aids dramatically improve follow-through. Your letter serves as both external memory and emotional anchor, engaging multiple brain systems simultaneously. When you write about your resolutions by hand or with deliberate focus, you activate the reticular activating system, which helps your brain recognize and prioritize information related to your goals throughout the year.",
          "Beyond individual achievement, resolution letters often reveal deeper patterns about personal growth and life satisfaction. Research by psychologist Sonja Lyubomirsky demonstrates that the process of pursuing goals can be as important to happiness as achieving them, especially when those goals align with intrinsic values rather than external pressures. As you write your letter, pay attention to which resolutions energize you and which feel like obligations - this distinction often points toward what will genuinely enhance your well-being versus what you think you 'should' want.",
        ],
        guidingQuestions: [
          "What are the 2-3 resolutions that matter most to you, and why do they feel important right now?",
          "How will your life be different a year from now if you achieve these resolutions?",
          "What obstacles have prevented you from achieving similar goals in the past?",
          "What resources, support, or habits will you need to succeed this time?",
          "What will you do when motivation fades and the initial excitement wears off?",
          "How will you measure progress, and how often will you check in with yourself?",
          "What advice would you give your future self for staying committed through challenges?",
          "What will you celebrate when you read this letter next year, regardless of outcome?",
        ],
        sampleOpening: "Dear Future Me, as this year draws to a close and a new one begins, I'm taking time to be intentional about what I want to create in the months ahead. These aren't just wishes - they're commitments I'm making to you, my future self, because I believe in who we can become...",
        howToSteps: [
          { name: "Reflect on the past year first", text: "Before setting new resolutions, honestly assess what worked and what didn't last year. Understanding your patterns helps you set more realistic and meaningful goals this time." },
          { name: "Choose 2-3 meaningful resolutions", text: "Resist the temptation to list everything you want to change. Focus on a small number of resolutions that genuinely matter and that you have the capacity to pursue." },
          { name: "Explore the deeper why", text: "For each resolution, write about why it matters to you. Connect it to your values, your vision for your life, and the person you want to become." },
          { name: "Anticipate obstacles honestly", text: "Identify what might derail you and plan how you'll respond. This realistic planning increases your resilience when challenges inevitably arise." },
          { name: "Create accountability systems", text: "Write about how you'll stay accountable - whether through tracking, sharing with others, or regular self-check-ins. Specificity matters." },
          { name: "Schedule delivery for December", text: "Set your letter to arrive in late December so you can read it before making next year's resolutions. This creates a powerful annual ritual of reflection and intention." },
        ],
      },
      tr: {
        title: "Yeni Yil Kararlari Mektup Sablonu",
        description: "Kararlarinizi gelecekteki kendinize anlamli bir taahhut mektubuna donusturun. Hesap verebilirlik olusturun ve onumuzdeki yil icin umutlarinizi yakalay in.",
        seoTitle: "Yeni Yil Kararlari Mektup Sablonu | Gelecek Hedefler",
        seoDescription: "Gelecekteki kendinize guclu bir Yeni Yil karari mektubu yazin. Kalici hesap verebilirlik olusturun ve niyetleri anlamli taahhutlere donusturun.",
        content: [
          "Yeni Yil kararlari, insanlarin her yilin basinda tanrilarina sozler verdigi Eski Babil'e kadar uzanan 4.000 yillik bir gelenektir. Bu uzun tarihe ragmen, arastirmalar karar alan insanlarin yalnizca yaklasik %9'unun bunlari gercekten tamamladigini gostermektedir. Niyet ile eylem arasindaki bosluk, kisisel gelisimdeki en buyuk zorluklardan biri olmaya devam etmektedir.",
          "Gelecekteki kendinize bir mektup yazmak, karar alma surecini gecici bir dilekten belgelenmis bir taahhude donusturur. Dominican Universitesi'nden Dr. Gail Matthews'un psikoloji arastirmasi, hedeflerini yazan insanlarin bunlara ulasma olasiliginin %42 daha fazla oldugunu bulmustur. Kararlarinizi mektup formunda ifade ettiginizde, hem hesap verebilirlik hem de gelecekteki benliginizle daha derin bir duygusal baglanti yaratirsiniz.",
          "Kararlarinizi gelecekteki benliginize yonlendirme eylemi, psikologların 'gelecek benlik surekliligi' dedigi seyi aktive eder - olacaginiz kisiye ne kadar bagli hissettiginiz derecesi. UCLA'dan Dr. Hal Hershfield'in calismalari, daha yuksek gelecek benlik surekliligi olan insanlarin daha iyi uzun vadeli kararlar verdigini ve taahhutleri yerine getirme olasiliginin daha yuksek oldugunu gostermektedir.",
          "Bu sablon, sizi basit hedef ifadelerinin otesinde kararlarinizin arkasindaki daha derin motivasyonlari kesfetmeye yonlendirir. Bir hedefin sizin icin neden onemli oldugunu anlamak - sadece ne elde etmek istediginizi degil - basari sansinizi onemli olcude arttirir. Sadece hedeflerin kendisini degil, ayni zamanda olmak istediginiz kisiyi ve yaratmak istediginiz yasami yakalayacaksiniz.",
          "Mektubunuz yilin sonunda geldiginde, niyetlerinizin net bir kaydina ve sadece hedeflerinize ulasip ulasmadiginizi degil, surec icinde nasil buyudugunuzu degerlendirme bilgeligine sahip olacaksiniz. Bircok insan, 'basarisiz' kararlarin bile oncelikler, gercekci beklentiler ve oz-sefkat hakkinda degerli dersler ogrettigini bulmaktadir.",
          "Karar mektubunuzu, dogal ritimlerin ic gozlemi destekledigi Noel ve Yeni Yil Gunu arasindaki dusunce doneminde yazmayi dusunun. Dikkat dagiticilardan uzak sessiz, rahat bir alan yaratin ve dusunceli bir sekilde yazmak icin en az 45 dakika verin. Bu zaman yatirimi, bilinc altiniza bu taahhutlerin gercekten onemli oldugunu isaret eder.",
        ],
        guidingQuestions: [
          "Sizin icin en onemli 2-3 karar nedir ve su anda neden onemli hissediyorlar?",
          "Bu kararlari basardıginizda bir yil sonra hayatiniz nasil farkli olacak?",
          "Gecmiste benzer hedeflere ulasmanizi hangi engeller onledi?",
          "Bu sefer basarili olmak icin hangi kaynaklara, destege veya aliskanliklara ihtiyaciniz olacak?",
          "Motivasyon azaldiginda ve ilk heyecan gectiginde ne yapacaksiniz?",
          "Ilerlemeyi nasil olceceksiniz ve kendinizle ne siklikta kontrol edeceksiniz?",
          "Zorluklar boyunca taahhude sadik kalmak icin gelecekteki kendinize ne tavsiye verirsiniz?",
          "Sonuc ne olursa olsun, bu mektubu gelecek yil okudugunuzda neyi kutlayacaksiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bu yil sona ererken ve yeni bir yil baslarken, onumuzdeki aylarda ne yaratmak istedigim konusunda kasitli olmak icin zaman ayiriyorum. Bunlar sadece dilekler degil - sana, gelecekteki benligime verdigim taahhutler, cunku kim olabilecegimize inaniyorum...",
        howToSteps: [
          { name: "Once gecen yili dusunun", text: "Yeni kararlar belirlemeden once, gecen yil neyin isledigi ve neyin islemedigi hakkinda durust bir sekilde degerlendirin. Kalıplarinizi anlamak, bu sefer daha gercekci ve anlamli hedefler belirlemenize yardimci olur." },
          { name: "2-3 anlamli karar secin", text: "Degistirmek istediginiz her seyi listeleme cazibesine direnin. Gercekten onemli olan ve takip etme kapasitenize sahip oldugunuz az sayida karara odaklanin." },
          { name: "Daha derin nedeni kesfedin", text: "Her karar icin neden sizin icin onemli oldugunu yazin. Degerlerinize, hayatiniz icin vizyonunuza ve olmak istediginiz kisiye baglayin." },
          { name: "Engelleri durust bir sekilde ongorun", text: "Sizi raydan cikarabilecek seyleri belirleyin ve nasil yanit verecegi nizi planlayin. Bu gercekci planlama, zorluklar kacinilmaz olarak ortaya ciktiginda dayanikliliginizi artirir." },
          { name: "Hesap verebilirlik sistemleri olusturun", text: "Nasil hesap verebilir kalacaginizi yazin - ister izleme yoluyla, ister baskalariyla paylasarak, ister duzenli oz-kontroller araciligiyla. Ozgulluk onemlidir." },
          { name: "Teslimat icin Aralik ayini planlayin", text: "Mektubunuzu Aralik ayinin sonlarinda gelecek sekilde ayarlayin, boylece gelecek yilin kararlarini almadan once okuyabilirsiniz. Bu, dusunce ve niyet konusunda guclu bir yillik rituel olusturur." },
        ],
      },
      estimatedTime: "45-60 min",
      category: "goals",
    },
    "five-year-vision": {
      en: {
        title: "Five-Year Vision Letter Template",
        description: "Craft a detailed vision of your life five years from now. Connect with your future self and create a powerful roadmap for long-term personal transformation.",
        seoTitle: "Five-Year Vision Letter Template | Long-Term Goal Planning",
        seoDescription: "Write a visionary letter to yourself five years in the future. Create clarity about your long-term goals and the life you want to build.",
        content: [
          "Five years is a remarkable timeframe for personal transformation. It's long enough for significant change to occur - careers can be completely reimagined, relationships can deepen or transform, skills can develop from novice to mastery, and entirely new chapters of life can unfold. Yet five years is also near enough that the person receiving this letter will still feel connected to who you are today.",
          "Research on goal-setting consistently shows that having a clear vision of the future significantly increases the likelihood of achieving meaningful goals. Dr. Edwin Locke's pioneering work on goal-setting theory demonstrates that specific, challenging goals lead to higher performance than vague or easy goals. A five-year vision provides the specificity and ambition that drive genuine transformation.",
          "The practice of 'mental time travel' - vividly imagining yourself in the future - has been shown to improve motivation, decision-making, and emotional regulation. When you write a detailed letter to your future self, you're engaging neural pathways that help bridge the psychological distance between present and future, making long-term goals feel more personally relevant and achievable.",
          "This template encourages you to think expansively about all areas of your life: career and professional growth, relationships and family, health and vitality, financial security, personal development, and contribution to others. True fulfillment rarely comes from optimizing just one domain - it emerges from thoughtful cultivation of a whole, integrated life.",
          "Writing to yourself five years in the future also provides perspective on what truly matters. Many concerns that feel urgent today will seem insignificant from a five-year vantage point. This temporal distance helps you distinguish between what's truly important and what merely feels pressing in the moment, allowing you to invest your energy more wisely.",
          "When your letter arrives in five years, it will serve as both a time capsule and a mirror. You'll see how much has changed, what predictions came true, which dreams evolved, and what unexpected blessings or challenges life brought. This perspective is invaluable for continued growth and for setting your next five-year vision.",
          "The psychological concept of 'possible selves' - developed by Hazel Markus and Paula Nurius - explains why envisioning your future can be so transformative. Your possible selves include both the selves you hope to become and the selves you fear becoming. Writing a detailed five-year vision letter activates your hoped-for possible self, which then serves as a powerful motivational framework. Studies show that people with clearly articulated possible selves demonstrate greater persistence in goal pursuit and better emotional regulation when facing setbacks, because they can reference their vision during difficult moments.",
          "Research on implementation intentions by Peter Gollwitzer reveals that bridging the gap between goals and action requires concrete planning. While your five-year vision provides the 'what' and 'why,' consider also addressing the 'how' and 'when' for at least your first year. Specify not just the destination but some of the paths you'll explore to get there. This combination of expansive vision and grounded planning creates what psychologists call 'realistic optimism' - the sweet spot between dreaming big and taking practical steps forward.",
        ],
        guidingQuestions: [
          "Where do you see yourself living, working, and spending your time five years from now?",
          "What does your ideal typical day look like in five years?",
          "Which relationships do you want to deepen, nurture, or create over the next five years?",
          "What skills, knowledge, or capabilities do you want to develop by then?",
          "How do you want your health and energy to feel five years from now?",
          "What do you want your financial situation to look like, and what security would that provide?",
          "What contribution do you want to be making to your family, community, or the world?",
          "What do you hope you'll have let go of or moved beyond by then?",
        ],
        sampleOpening: "Dear Future Me, I'm writing to you from five years in the past, with a heart full of hope and a mind full of dreams. I want to paint a vivid picture of the life I envision for us - not as a rigid prescription, but as a guiding star to help us navigate the years ahead...",
        howToSteps: [
          { name: "Create expansive mental space", text: "Set aside at least an hour in a peaceful environment. Let go of immediate concerns and allow yourself to dream without limitation. This is not the time for 'realistic' thinking - that comes later." },
          { name: "Visualize your future self vividly", text: "Close your eyes and imagine a typical day five years from now. Where do you wake up? Who is with you? What work engages you? What brings you joy? Make it as detailed and sensory-rich as possible." },
          { name: "Write across all life domains", text: "Address career, relationships, health, finances, personal growth, and contribution. A compelling vision integrates all aspects of life rather than focusing narrowly on just one area." },
          { name: "Balance ambition with authenticity", text: "Your vision should stretch you while remaining true to your core values and identity. The goal is not to become someone else, but to become more fully yourself." },
          { name: "Acknowledge uncertainty with courage", text: "Recognize that life will bring surprises - both challenges and blessings you cannot foresee. Write about how you hope to respond to uncertainty with resilience and grace." },
          { name: "Schedule for meaningful delivery", text: "Set your letter to arrive exactly five years from now. Consider choosing a significant date - perhaps your birthday or another anniversary that will make receiving this letter even more meaningful." },
        ],
      },
      tr: {
        title: "Bes Yillik Vizyon Mektup Sablonu",
        description: "Bes yil sonraki hayatinizin ayrintili bir vizyonunu olusturun. Gelecekteki kendinizle baglanti kurun ve uzun vadeli kisisel donusum icin guclu bir yol haritasi yaratin.",
        seoTitle: "Bes Yillik Vizyon Mektup Sablonu | Uzun Vadeli Hedef Planlamasi",
        seoDescription: "Bes yil sonraki kendinize vizyoner bir mektup yazin. Uzun vadeli hedefleriniz ve kurmak istediginiz hayat hakkinda netlik yaratin.",
        content: [
          "Bes yil, kisisel donusum icin olaganüstü bir zaman dilimidir. Onemli degisikliklerin meydana gelmesi icin yeterince uzun - kariyerler tamamen yeniden tasarlanabilir, iliskiler derinlesebilir veya donusebilir, beceriler acemilikten ustaliga gelisebilir ve hayatın tamamen yeni bolumleri acilabilir. Yine de bes yil, bu mektubu alan kisinin bugun kim oldugunuzla hala bagli hissetmesi icin yeterince yakindir.",
          "Hedef belirleme uzerine arastirmalar, gelecege dair net bir vizyona sahip olmanin anlamli hedeflere ulasma olasiligini onemli olcude artirdigini tutarli bir sekilde gostermektedir. Dr. Edwin Locke'un hedef belirleme teorisi uzerine oncü calismasi, belirli, zorlu hedeflerin belirsiz veya kolay hedeflerden daha yuksek performansa yol actigini gostermektedir.",
          "'Zihinsel zaman yolculugu' uygulamasi - kendinizi gelecekte canli bir sekilde hayal etmek - motivasyonu, karar vermeyi ve duygusal duzenleyimi iyilestirdigi gosterilmistir. Gelecekteki kendinize ayrintili bir mektup yazdiginizda, simdiki ve gelecek arasindaki psikolojik mesafeyi kapatmaya yardimci olan sinirsel yollari aktive edersiniz.",
          "Bu sablon, sizi hayatinizin tum alanlari hakkinda kapsamli dusunmeye tesvik eder: kariyer ve profesyonel buyume, iliskiler ve aile, saglik ve canlilik, finansal guvenlik, kisisel gelisim ve baskalarina katki. Gercek tatmin nadiren yalnizca bir alanin optimize edilmesinden gelir - butunsel, entegre bir yasamin dusunceli kultivasyonundan ortaya cikar.",
          "Bes yil sonraki kendinize yazmak ayni zamanda gercekten neyin onemli olduguna dair perspektif saglar. Bugun acil hisseden bircok endise, bes yillik bir bakis acisindan onemsiz gorunecektir. Bu zamansal mesafe, gercekten onemli olan ile anda sadece baskili hissettiren arasinda ayrim yapmaniza yardimci olur.",
          "Mektubunuz bes yil icinde geldiginde, hem bir zaman kapsulu hem de bir ayna olarak hizmet edecektir. Ne kadar degistiğini, hangi tahminlerin gerceklestigini, hangi hayallerin evrilestigini ve yasamin hangi beklenmedik nimetler veya zorluklar getirdigini goreceksiniz.",
        ],
        guidingQuestions: [
          "Bes yil sonra kendinizi nerede yasarken, calisirken ve zamaninizi gecirirken goruyorsunuz?",
          "Bes yil sonra ideal tipik gununuz nasil gorunuyor?",
          "Onumuzdeki bes yil boyunca hangi iliskileri derinlestirmek, beslemek veya yaratmak istiyorsunuz?",
          "O zamana kadar hangi becerileri, bilgileri veya yetenekleri gelistirmek istiyorsunuz?",
          "Bes yil sonra sagliginizin ve enerjinizin nasil hissetmesini istiyorsunuz?",
          "Finansal durumunuzun nasil gorunmesini istiyorsunuz ve bu ne tur bir guvenlik saglayacak?",
          "Ailenize, toplulugunuza veya dunyaya nasil bir katki yapmak istiyorsunuz?",
          "O zamana kadar neyi birakmis veya geride birakmis olmayi umuyorsunuz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, sana bes yil oncesinden, umutla dolu bir kalp ve hayallerle dolu bir zihinle yaziyorum. Bizim icin hayal ettigim hayatın canli bir resmini cizmek istiyorum - katı bir recete olarak degil, onumuzdeki yillarda bize yol gosteren bir yildiz olarak...",
        howToSteps: [
          { name: "Genis zihinsel alan yaratin", text: "Huzurlu bir ortamda en az bir saat ayirin. Ani endiseleri birakin ve sinirlama olmadan hayal kurmaniza izin verin. Bu 'gercekci' dusunme zamani degil - o daha sonra gelir." },
          { name: "Gelecekteki benliginizi canli bir sekilde goruntuyleyin", text: "Gozlerinizi kapatin ve bes yil sonra tipik bir gunu hayal edin. Nerede uyaniyorsunuz? Kim sizinle? Hangi is sizi mesgul ediyor? Size ne mutluluk veriyor? Mumkun oldugunca ayrintili yapin." },
          { name: "Tum yasam alanlarinda yazin", text: "Kariyer, iliskiler, saglik, finans, kisisel gelisim ve katkiyi ele alin. Ilgi cekici bir vizyon, yalnizca bir alana dar bir sekilde odaklanmak yerine yasamin tum yonlerini entegre eder." },
          { name: "Hirsi otantiklikle dengeleyin", text: "Vizyonunuz sizi zorlarken temel degerlerinize ve kimliginize sadik kalmalidir. Amac baska biri olmak degil, daha tam anlamiyla kendiniz olmaktir." },
          { name: "Belirsizligi cesaretle kabul edin", text: "Hayatin surprizler getirecegini kabul edin - hem ongoremeceginiz zorluklar hem de nimetler. Belirsizlige dayaniklilik ve zarafetle nasil yanit vermek istediginizi yazin." },
          { name: "Anlamli teslimat icin planlayin", text: "Mektubunuzu tam olarak bes yil sonra gelecek sekilde ayarlayin. Onemli bir tarih secmeyi dusunun - belki dogum gununuz veya bu mektubu almayi daha da anlamli kilacak baska bir yildonumu." },
        ],
      },
      estimatedTime: "60-90 min",
      category: "goals",
    },
    "monthly-goals": {
      en: {
        title: "Monthly Goals Review Letter Template",
        description: "Set clear intentions for the month ahead with accountability built in. Create a focused action plan and future perspective that keeps you motivated and on track.",
        seoTitle: "Monthly Goals Letter Template | 30-Day Goal Setting",
        seoDescription: "Write a monthly goals letter to your future self. Create accountability, set clear intentions, and build momentum with our guided 30-day planning template.",
        content: [
          "Monthly goal-setting strikes the perfect balance between the ambition of long-term planning and the immediacy of daily tasks. A month is long enough to accomplish meaningful progress, yet short enough to maintain focus and urgency. This rhythm aligns with natural cycles of work and rest, allowing for regular reassessment and course correction.",
          "Research by Dr. Gabriele Oettingen on mental contrasting shows that the most effective goal-setting combines positive visualization with realistic obstacle anticipation. Her WOOP framework (Wish, Outcome, Obstacle, Plan) has been validated across multiple studies. This template incorporates these evidence-based principles to maximize your chances of success.",
          "Writing a letter to yourself at the end of the month creates a unique form of accountability. Unlike sharing goals with others - which can sometimes provide premature satisfaction that reduces motivation - a letter to your future self maintains the personal nature of your commitment while still creating a meaningful checkpoint.",
          "The monthly rhythm also allows for what productivity experts call 'deliberate iteration.' Each month becomes an experiment in which you can test approaches, learn from results, and refine your methods. Over time, this iterative process leads to deep self-knowledge about what works for you personally.",
          "This template encourages you to set goals across multiple categories while maintaining focus. The key is selectivity - choosing 3-5 meaningful goals rather than a long list of wishes. Research consistently shows that focus, not breadth, drives achievement. By writing about why each goal matters, you strengthen your intrinsic motivation.",
          "When your letter arrives at month's end, you'll have the opportunity to celebrate progress, learn from setbacks, and set the stage for the next month with increased wisdom. Many practitioners find that this monthly practice compounds over time, leading to remarkable transformation when viewed across multiple months or years.",
          "The psychology of small wins, researched extensively by Teresa Amabile at Harvard Business School, demonstrates that making progress in meaningful work is the most powerful motivator for sustained performance. Monthly goal-setting creates a structure for experiencing these small wins regularly. Each month becomes an opportunity to experience what Amabile calls 'the progress principle' - the profound effect that a sense of forward movement has on our inner work life, including our emotions, motivations, and perceptions. By documenting your monthly intentions and reviewing them at month's end, you create a tangible record of progress that fuels continued momentum.",
          "Research on self-determination theory by Edward Deci and Richard Ryan highlights the importance of autonomy, competence, and relatedness for intrinsic motivation. Monthly goal letters uniquely support all three psychological needs: autonomy through self-directed goal selection, competence through regular achievement cycles, and relatedness through the intimate dialogue with your future self. This monthly practice becomes not just a productivity tool but a form of self-care and self-relationship building. Over time, the accumulated letters become a personal narrative of growth, revealing patterns, celebrating evolution, and providing wisdom that only comes from consistent, intentional self-reflection.",
        ],
        guidingQuestions: [
          "What are the 3-5 most important goals you want to accomplish this month, and why do they matter?",
          "What does success look like for each goal? How will you know you've achieved it?",
          "What obstacles might you face, and what's your plan for overcoming them?",
          "What habits or daily practices will support your monthly goals?",
          "Who can support you or hold you accountable this month?",
          "What will you need to say no to in order to make space for these priorities?",
          "How do these monthly goals connect to your larger life vision?",
          "What will you do to maintain energy and avoid burnout while pursuing these goals?",
        ],
        sampleOpening: "Dear Future Me, as this new month begins, I'm setting clear intentions for the weeks ahead. I want you to read this letter at month's end and see how far we've come. Here are the goals I'm committing to, and why they matter enough to pursue with focus and determination...",
        howToSteps: [
          { name: "Review the previous month", text: "Before setting new goals, reflect on the past month. What worked? What didn't? What did you learn? This reflection informs smarter goal-setting and prevents repeating the same patterns." },
          { name: "Select 3-5 focused goals", text: "Choose a small number of meaningful goals rather than a lengthy list. Be specific about what you want to accomplish - vague goals lead to vague results." },
          { name: "Define success criteria clearly", text: "For each goal, write exactly how you'll know you've succeeded. This clarity prevents moving goalposts and provides clear targets to aim for." },
          { name: "Anticipate obstacles and plan responses", text: "Identify what might get in your way and decide in advance how you'll respond. This mental rehearsal prepares you for challenges before they arise." },
          { name: "Connect goals to daily actions", text: "Break monthly goals into weekly or daily actions. A goal without a plan is just a wish - create the specific practices that will move you forward." },
          { name: "Schedule for end-of-month delivery", text: "Set your letter to arrive on the last day of the month. This creates a natural checkpoint for reflection and sets up a powerful monthly ritual." },
        ],
      },
      tr: {
        title: "Aylik Hedefler Mektup Sablonu",
        description: "Onumuzdeki ay icin hesap verebilirlik yerlesik olarak net niyetler belirleyin. Sizi motive ve yolda tutan odakli bir eylem plani ve gelecek perspektifi olusturun.",
        seoTitle: "Aylik Hedefler Mektup Sablonu | 30 Gunluk Hedef Belirleme",
        seoDescription: "Gelecekteki kendinize bir aylik hedefler mektubu yazin. Rehberli 30 gunluk planlama sablonumuzla hesap verebilirlik olusturun ve ivme kazanin.",
        content: [
          "Aylik hedef belirleme, uzun vadeli planlamanin hirsi ile gunluk gorevlerin aciliyeti arasinda mukemmel dengeyi yakalar. Bir ay, anlamli ilerleme kaydetmek icin yeterince uzun, ancak odagi ve aciliyeti korumak icin yeterince kisadir. Bu ritim, duzenli yeniden degerlendirme ve rota duzeltmesine izin vererek calisma ve dinlenmenin dogal donguleriy le uyumludur.",
          "Dr. Gabriele Oettingen'in zihinsel karsilastirma uzerine arastirmasi, en etkili hedef belirlemenin pozitif gorsellestirmeyi gercekci engel beklentisiyle birlestirdigini gostermektedir. WOOP cercevesi (Wish, Outcome, Obstacle, Plan) birden fazla calismada dogrulanmistir. Bu sablon, basari sansinizi en ust duzeye cikarmak icin bu kanitlara dayali ilkeleri icerir.",
          "Ayin sonunda kendinize bir mektup yazmak, benzersiz bir hesap verebilirlik bicimi olusturur. Hedefleri baskalarıyla paylasmaktan farkli olarak - bu bazen motivasyonu azaltan erken tatmin saglayabilir - gelecekteki benliginize bir mektup, anlamli bir kontrol noktasi olustururken taahhudunuzun kisisel dogasini korur.",
          "Aylik ritim ayni zamanda verimlilik uzmanlarinin 'kasitli yineleme' dedigi seye izin verir. Her ay, yaklasimlari test edebileceginiz, sonuclardan ogrenebileceginiz ve yontemlerinizi rafine edebileceginiz bir deney haline gelir. Zamanla, bu yinelemeli surec, sizin icin kisisel olarak neyin isledigine dair derin oz-bilgiye yol acar.",
          "Bu sablon, odagi korurken birden fazla kategoride hedefler belirlemenizi tesvik eder. Anahtar seciciliktir - uzun bir dilek listesi yerine 3-5 anlamli hedef secmek. Arastirmalar tutarli bir sekilde odagin, genisligin degil, basariyi surdugunu gostermektedir. Her hedefin neden onemli oldugunu yazarak, icsel motivasyonunuzu guclendirirsiniz.",
          "Mektubunuz ay sonunda geldiginde, ilerlemeyi kutlama, gerilemelerden ogrenme ve bir sonraki ayi artan bilgelikle hazirlama firsatiniz olacak. Bircok uygulayici, bu aylik uygulamanin zamanla bilestigini ve birden fazla ay veya yil boyunca bakildiginda dikkate deger bir donusume yol actigini bulmaktadir.",
        ],
        guidingQuestions: [
          "Bu ay basarmak istediginiz en onemli 3-5 hedef nedir ve neden onemliler?",
          "Her hedef icin basari nasil gorunuyor? Basardiginizi nasil bileceksiniz?",
          "Hangi engellerle karsilasabilirsiniz ve bunlari asma planiniz nedir?",
          "Hangi aliskanliklar veya gunluk uygulamalar aylik hedeflerinizi destekleyecek?",
          "Bu ay size kim destek olabilir veya sizi sorumlu tutabilir?",
          "Bu onceliklere yer acmak icin neye hayir demeniz gerekecek?",
          "Bu aylik hedefler daha buyuk yasam vizyonunuzla nasil baglantili?",
          "Bu hedefleri takip ederken enerjiyi korumak ve tukenmislikten kacinmak icin ne yapacaksiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bu yeni ay baslarken, onumuzdeki haftalar icin net niyetler belirliyorum. Bu mektubu ay sonunda okumani ve ne kadar ilerledigimizi gormeni istiyorum. Iste taahhut ettigim hedefler ve neden odak ve kararlililikla takip edilecek kadar onemliler...",
        howToSteps: [
          { name: "Onceki ayi gozden gecirin", text: "Yeni hedefler belirlemeden once, gecen ay uzerinde dusunun. Ne isledi? Ne islemedi? Ne ogrendiniz? Bu dusunce daha akilli hedef belirlemeyi bilgilendirir." },
          { name: "3-5 odakli hedef secin", text: "Uzun bir liste yerine az sayida anlamli hedef secin. Ne basarmak istediginiz konusunda spesifik olun - belirsiz hedefler belirsiz sonuclara yol acar." },
          { name: "Basari kriterlerini net bir sekilde tanimlayin", text: "Her hedef icin, basarili oldugunuzu tam olarak nasil bilecegi nizi yazin. Bu netlik, hedef degistirmeyi onler ve hedeflenecek net hedefler saglar." },
          { name: "Engelleri ongorun ve yanitlari planlayin", text: "Yolunuza cikabilecek seyleri belirleyin ve onceden nasil yanit verecegi nizi kararlas tirin. Bu zihinsel prova, sizi zorluklar ortaya cikmadan once hazirlar." },
          { name: "Hedefleri gunluk eylemlerle iliskilendirin", text: "Aylik hedefleri haftalik veya gunluk eylemlere bolun. Plansiz bir hedef sadece bir dilektir - sizi ileri tasiyacak belirli uygulamalari olusturun." },
          { name: "Ay sonu teslimati icin planlayin", text: "Mektubunuzu ayin son gununde gelecek sekilde ayarlayin. Bu, dusunce icin dogal bir kontrol noktasi olusturur ve guclu bir aylik rituel kurar." },
        ],
      },
      estimatedTime: "30-45 min",
      category: "goals",
    },
  },
  "gratitude": {
    "daily-gratitude": {
      en: {
        title: "Daily Gratitude Letter Template",
        description: "Transform your perspective through the practice of daily gratitude. Document the small and large blessings that your future self will treasure as reminders of life's abundance.",
        seoTitle: "Daily Gratitude Letter Template | Write to Your Future Self",
        seoDescription: "Write a daily gratitude letter to your future self. Capture blessings and positive moments with our guided template based on positive psychology research.",
        content: [
          "Daily gratitude practice is one of the most scientifically validated paths to lasting happiness and well-being. This template guides you in capturing moments of appreciation that might otherwise fade from memory, creating a treasure chest of positive experiences your future self can open during challenging times. The simple act of noticing what's good transforms both your present experience and your future perspective.",
          "Research by Dr. Robert Emmons at UC Davis has shown that people who regularly practice gratitude experience 25% more happiness, sleep better, exercise more, and report fewer physical symptoms. The neuroscience is equally compelling: gratitude activates the brain's reward circuitry and releases dopamine and serotonin, the neurotransmitters associated with happiness and calm. Over time, this practice literally rewires your brain for positivity.",
          "What makes gratitude so powerful is its ability to shift attention from what's lacking to what's present. In our culture of constant striving and comparison, we often overlook the abundance that already exists in our lives. A gratitude letter forces a pause to acknowledge these gifts, from the warmth of morning coffee to the support of loved ones to the simple miracle of being alive on this day.",
          "Writing gratitude letters to your future self adds a unique dimension to this practice. You're not just noting what you're grateful for, you're gifting those positive memories to a future version of yourself who may need them most. Studies show that recalling past positive experiences can provide significant mood boosts during difficult times. Your gratitude letters become an emotional first-aid kit.",
          "The key to effective gratitude practice is specificity. Rather than writing 'I'm grateful for my family,' describe a specific moment: 'I'm grateful for how my daughter laughed uncontrollably at dinner tonight when she tried to tell a joke and kept forgetting the punchline.' These vivid details make gratitude letters more emotionally resonant and memorable.",
          "Consider making daily gratitude letters a cornerstone habit in your life. Many practitioners write them in the morning to set a positive tone for the day, while others prefer evening reflection to close the day with appreciation. Experiment to find what works for you, and remember that consistency matters more than timing. Even three minutes of focused gratitude can shift your entire day's trajectory.",
          "The cumulative effects of daily gratitude practice extend far beyond mood improvement. Research published in the Journal of Personality and Social Psychology found that gratitude interventions lead to increased prosocial behavior, with grateful individuals more likely to help others and engage in generous actions. This creates a positive ripple effect: as you become more attuned to the good in your life, you naturally become a source of goodness for others. Additionally, longitudinal studies suggest that gratitude practice strengthens resilience, helping people recover more quickly from adversity and maintain perspective during challenging periods.",
          "One often overlooked benefit of writing gratitude letters to your future self is the creation of a personal archive of joy. Unlike photographs that capture moments but not feelings, your gratitude letters preserve the emotional texture of your life's best experiences. Years from now, you'll be able to read your own words and remember not just what happened, but how it felt to be grateful in that moment. This archive becomes increasingly precious with time, offering your future self a bridge back to periods of abundance, love, and appreciation that might otherwise be forgotten in memory's fog.",
        ],
        guidingQuestions: [
          "What simple pleasure brought you joy today that might be easy to overlook or take for granted?",
          "Who made a positive difference in your day, even in a small way, and how did their kindness affect you?",
          "What about your body, health, or physical abilities can you appreciate today?",
          "What moment of beauty, humor, or connection would you want to remember from today?",
          "What challenge or difficulty are you grateful for because of what it taught you or how it strengthened you?",
          "What aspect of your home, environment, or daily routine brings you comfort or happiness?",
          "What opportunity or possibility in your life right now fills you with gratitude and hope?",
          "What would you tell your future self about why this ordinary day was actually extraordinary?",
        ],
        sampleOpening: "Dear Future Me, today I'm pausing to capture the moments of grace that filled this ordinary day. It's easy to rush past these small gifts without noticing, but I want to preserve them for you. Right now, I'm feeling grateful for...",
        howToSteps: [
          { name: "Choose your gratitude time", text: "Select a consistent time for your daily practice - morning to set intention, evening to reflect, or another time that fits your rhythm. Attach it to an existing habit to build consistency." },
          { name: "Start with what's present", text: "Before writing, take three breaths and notice what's good in this moment. Let gratitude arise naturally rather than forcing it." },
          { name: "Be specific and sensory", text: "Instead of general statements, describe specific moments with sensory details. What did you see, hear, feel, taste, or smell? Vivid details make memories stick." },
          { name: "Include both big and small", text: "Balance major blessings with small joys. Sometimes the most meaningful gratitude is for ordinary moments we usually overlook." },
          { name: "Write to your future self directly", text: "Address your future self as if speaking to a friend. Explain why these things matter and what you hope they'll remind future-you to appreciate." },
          { name: "Set varied delivery dates", text: "Schedule some letters for next week, others for next month, and some for next year. Create a stream of gratitude reminders arriving throughout your future." },
        ],
      },
      tr: {
        title: "Gunluk Sukran Mektup Sablonu",
        description: "Gunluk sukran uygulamasiyla bakis acinizi donusturun. Gelecekteki benliginizin hayatin bollugunun hatiratmalari olarak deger verecegi kucuk ve buyuk nimetleri belgeleyin.",
        seoTitle: "Gunluk Sukran Mektup Sablonu | Gelecekteki Kendinize Yazin",
        seoDescription: "Gelecekteki kendinize gunluk bir sukran mektubu yazin. Pozitif psikoloji arastirmalarina dayanan rehberli sablonumuzla nimetleri ve olumlu anlari yakalayin.",
        content: [
          "Gunluk sukran uygulamasi, kalici mutluluga ve refaha giden bilimsel olarak en gecerli yollardan biridir. Bu sablon, aksi takdirde hafizadan silinebilecek takdir anlarini yakalamada size rehberlik eder ve gelecekteki benliginizin zorlu zamanlarda acabilecegi olumlu deneyimlerle dolu bir hazine sandigi olusturur. Iyi olan seyleri fark etmenin basit eylemi hem mevcut deneyiminizi hem de gelecek perspektifinizi donusturur.",
          "UC Davis'te Dr. Robert Emmons'un arastirmalari, duzenli sukran uygulayan kisilerin yuzde yirmi bes daha fazla mutluluk yasadigini, daha iyi uyudugunu, daha fazla egzersiz yaptigini ve daha az fiziksel semptom bildirdigini gostermistir. Norobilim de ayni derecede ikna edicidir: sukran beynin odul devresini aktive eder ve mutluluk ve sakinlikle iliskili norotransmitterler olan dopamin ve serotonin salgilar.",
          "Sukrani bu kadar guclu kilan sey, dikkati eksik olandan mevcut olana kaydirma yetenegidir. Surekli cabalama ve karsilastirma kulturumuzde, hayatlarimizda zaten var olan bollugu siklikla gozden kaciririz. Bir sukran mektubu, sabah kahvesinin sicakligindan, sevdiklerimizin destegine, bu gunde hayatta olmanin basit mucizesine kadar bu hediyeleri kabul etmek icin bir duraklama yaratir.",
          "Gelecekteki kendinize sukran mektuplari yazmak bu uygulamaya benzersiz bir boyut ekler. Sadece neye minnettar oldugunuzu not etmiyorsunuz, bu olumlu anilari en cok ihtiyac duyabilecek gelecekteki bir versiyonunuza hediye ediyorsunuz. Calismalar, gecmis olumlu deneyimleri hatirlamanin zor zamanlarda onemli ruh hali artislari saglayabilecegini gostermektedir.",
          "Etkili sukran uygulamasinin anahtari ozgulluktur. 'Aileme minnettar hissediyorum' yazmak yerine belirli bir ani tanimlayin: 'Bu aksam yemekte kizimin bir fikra anlatmaya calisirken ve sonunu surekli unuturken kontrol edilemez bir sekilde gulmesine minnettar hissediyorum.' Bu canli detaylar sukran mektuplarini duygusal olarak daha yankilayici ve akilda kalici kilar.",
          "Gunluk sukran mektuplarini hayatinizda bir temel aliskanlik haline getirmeyi dusunun. Bircok uygulayici bunlari sabah gune olumlu bir ton vermek icin yazar, digerleriyse gunu takdirle kapatmak icin aksam dusuncesini tercih eder. Sizin icin ne ise yaradigini bulmak icin deney yapin ve tutarliligin zamanlamadan daha onemli oldugunu unutmayin.",
        ],
        guidingQuestions: [
          "Bugun gozden kacirmasi veya hafife alinmasi kolay olabilecek hangi basit zevk size sevinc getirdi?",
          "Kucuk bir sekilde bile olsa bugun gununuzde olumlu bir fark yaratan kim oldu ve naziklikleri sizi nasil etkiledi?",
          "Vucudunuz, sagliginiz veya fiziksel yetenekleriniz hakkinda bugun neyi takdir edebilirsiniz?",
          "Bugunden hangi guzellik, mizah veya baglanti anini hatirlamak istersiniz?",
          "Size ogrettigi veya sizi guclendirdigi icin hangi zorluk veya gucluge minnettar hissediyorsunuz?",
          "Evinizin, cevrenizin veya gunluk rutininizin hangi yonu size konfor veya mutluluk getiriyor?",
          "Su anda hayatinizdaki hangi firsat veya olasilik sizi sukran ve umutla dolduruyor?",
          "Gelecekteki kendinize bu siradan gunun aslinda neden olagustu oldugu hakkinda ne soylerdiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bugun bu siradan gunu dolduran lutuf anlarini yakalamak icin duruyorum. Bu kucuk hediyeleri fark etmeden gecmek kolay, ama onlari senin icin saklamak istiyorum. Su anda minnettar hissediyorum...",
        howToSteps: [
          { name: "Sukran zamaninizi secin", text: "Gunluk uygulamaniz icin tutarli bir zaman secin - niyet belirlemek icin sabah, dusunmek icin aksam veya ritminize uyan baska bir zaman. Tutarlilik insa etmek icin mevcut bir aliskaniliga baglayin." },
          { name: "Mevcut olanla baslayin", text: "Yazmadan once uc nefes alin ve bu anda neyin iyi oldugunu fark edin. Sukranin zorlamak yerine dogal olarak ortaya cikmasina izin verin." },
          { name: "Spesifik ve duyusal olun", text: "Genel ifadeler yerine duyusal detaylarla belirli anlari tanimlayin. Ne gordunuz, duydunuz, hissettiniz, tattiniz veya kokladiniz? Canli detaylar anilarin yapismasini saglar." },
          { name: "Hem buyuk hem kucuk ekleyin", text: "Buyuk nimetleri kucuk sevinclerle dengeleyin. Bazen en anlamli sukran genellikle gozden kacirdigimiz siradan anlar icindir." },
          { name: "Gelecekteki kendinize dogrudan yazin", text: "Gelecekteki kendinize bir arkadasa konusur gibi hitap edin. Bu seylerin neden onemli oldugunu ve gelecekteki size neyi takdir etmeyi hatirlatacaklarini umdugunuzu aciklayin." },
          { name: "Cesitli teslimat tarihleri belirleyin", text: "Bazi mektuplari gelecek hafta, digerlerini gelecek ay ve bazilarini gelecek yil icin planlayin. Geleceginiz boyunca gelen bir sukran hatiratmalari akisi olusturun." },
        ],
      },
      estimatedTime: "10-15 min",
      category: "gratitude",
    },
    "people-im-thankful-for": {
      en: {
        title: "People I'm Thankful For Letter Template",
        description: "Honor the people who have shaped your life with a letter of deep appreciation. Document their impact on who you've become and create a lasting tribute to meaningful relationships.",
        seoTitle: "People I'm Thankful For Letter Template | Express Gratitude",
        seoDescription: "Write a heartfelt letter about the people you're thankful for. Document their impact on your life and express deep gratitude with our guided template.",
        content: [
          "The people in our lives are our greatest gifts, yet we often fail to express how much they mean to us until it's too late. This template creates space for you to deeply acknowledge the humans who have shaped who you are, from family members who nurtured you to mentors who believed in your potential to friends who stood by you through life's storms. These words of gratitude, sent to your future self, become a sacred record of your most treasured relationships.",
          "Research on gratitude and relationships reveals profound benefits on both sides of appreciation. Studies show that expressing gratitude to others strengthens relationship bonds, increases relationship satisfaction by up to 25%, and creates positive feedback loops of mutual appreciation. When you write about the people you're thankful for, you're not just documenting, you're deepening those connections in your own heart.",
          "Psychologist Dr. Martin Seligman's research on happiness interventions found that the 'gratitude visit,' writing and delivering a letter of appreciation to someone important, produced the largest positive changes in wellbeing of any intervention studied, with effects lasting up to six months. Even without delivering the letter, the act of articulating your appreciation creates measurable psychological benefits.",
          "This template invites you to reflect on different categories of influential people: those who gave you life and raised you, those who taught and mentored you, those who challenged you to grow, and those who simply loved you as you are. Each relationship has contributed something unique to the person you've become, and naming that contribution is an act of honoring both them and yourself.",
          "Writing about the people you're grateful for also creates an invaluable record for your future self. Relationships change, people move on, and sadly, some will no longer be with us. Having written testimonies of their importance allows you to revisit these feelings of connection and appreciation even when circumstances have changed. Your future self will treasure these windows into your heart.",
          "Consider the power of sharing these letters. While they're addressed to your future self, you might also consider sharing parts with the people you've written about. Few things in life are more meaningful than learning you've made a genuine difference in someone's life. Your words could be the gift that someone treasures for a lifetime.",
          "Neuroscience research reveals that reflecting on meaningful relationships activates similar brain regions as the relationships themselves. When you recall and write about someone who has positively impacted your life, your brain releases oxytocin, the bonding hormone, creating feelings of connection even when that person isn't physically present. This means your gratitude letters serve a dual purpose: they honor the people who matter most while simultaneously reinforcing the neural pathways associated with social connection and belonging, two of the most powerful predictors of long-term wellbeing and life satisfaction.",
          "The practice of documenting gratitude for specific people also combats what psychologists call the 'negativity bias,' our tendency to remember negative experiences more vividly than positive ones. By deliberately recording the kindness, support, and love you've received, you create a counterbalance to this bias. Research from the Greater Good Science Center at UC Berkeley shows that regularly acknowledging the positive contributions of others shifts our overall perception of humanity, making us more trusting, optimistic, and socially engaged. Your future self will benefit not just from remembering these specific people, but from the more generous worldview this practice cultivates.",
        ],
        guidingQuestions: [
          "Who has believed in you when you struggled to believe in yourself, and how did their faith change your path?",
          "Which family member's influence do you see most clearly in who you've become, and what specifically did they give you?",
          "Who has taught you something that fundamentally changed how you see the world or live your life?",
          "Which friend has stood by you through difficult times, and what did their loyalty mean to you?",
          "Who has challenged you in ways that made you grow, even if it was uncomfortable at the time?",
          "Is there someone no longer living whose impact on your life you want to honor and preserve?",
          "Who in your current life are you grateful for that you may not have expressed appreciation to directly?",
          "What would you want your future self to remember about the love and support that surrounds you now?",
        ],
        sampleOpening: "Dear Future Me, today I want to write about the people who have made me who I am. It's so easy to take the incredible humans in our lives for granted, but today I'm pausing to truly acknowledge them. As I think about who I'm most grateful for, I'm filled with emotion about...",
        howToSteps: [
          { name: "Create a gratitude list", text: "Begin by listing all the people who have positively impacted your life, from family to friends to mentors to brief encounters that left a mark. Don't filter, just brainstorm freely." },
          { name: "Choose 3-5 people to focus on", text: "Select a few people to write about in depth. You might choose those who've had the greatest impact or those you haven't adequately thanked." },
          { name: "Reflect on specific contributions", text: "For each person, consider what specifically they gave you. Was it wisdom, love, challenge, opportunity, example, or presence? Name the gift concretely." },
          { name: "Write from your heart", text: "Let your genuine emotions flow onto the page. Don't worry about perfect words. Authenticity matters more than eloquence." },
          { name: "Include memorable moments", text: "Anchor your gratitude in specific memories. Describe scenes and conversations that capture the essence of what they mean to you." },
          { name: "Consider sharing", text: "While the letter is for your future self, consider whether sharing some of these words with the people described could deepen your relationships." },
        ],
      },
      tr: {
        title: "Minnettar Oldugum Insanlar Mektup Sablonu",
        description: "Hayatinizi sekillendiren insanlari derin bir takdir mektubuyla onurlandirin. Kim oldugunuz uzerindeki etkilerini belgeleyin ve anlamli iliskilere kalici bir saygi yaratin.",
        seoTitle: "Minnettar Oldugum Insanlar Mektup Sablonu | Sukran Ifade Edin",
        seoDescription: "Minnettar oldugunuz insanlar hakkinda icten bir mektup yazin. Rehberli sablonumuzla hayatinizdaki etkilerini belgeleyin ve derin sukran ifade edin.",
        content: [
          "Hayatimizdaki insanlar en buyuk hediyelerimizdir, ancak cok gec olana kadar bizim icin ne kadar onemli olduklarini ifade etmeyi genellikle basaramayiz. Bu sablon, kim oldugunuzu sekillendiren insanlari derinden kabul etmeniz icin alan yaratir: sizi besleyen aile uyelerinden, potansiyelinize inanan mentorlerden, yasamin firtinalari boyunca yaninizda duran arkadaslara kadar. Gelecekteki kendinize gonderilen bu sukran sozleri, en degerli iliskilerinizin kutsal bir kaydi haline gelir.",
          "Sukran ve iliskiler uzerine arastirmalar, takdirin her iki tarafinda da derin faydalar ortaya koymaktadir. Calismalar, baskalarina sukran ifade etmenin iliski baglarini guclendirdigini, iliski memnuniyetini yuzde yirmi bese kadar artirdigini ve karsilikli takdirin olumlu geri bildirim donguleri olusturdugunu gostermektedir. Minnettar oldugunuz insanlar hakkinda yazdiginizda, sadece belgeleme yapmiyorsunuz, kendi kalbinizde bu baglantilari derinlestiriyorsunuz.",
          "Psikolog Dr. Martin Seligman'in mutluluk mudahaleleri uzerine arastirmasi, 'sukran ziyareti' - onemli birine takdir mektubu yazip iletmenin - incelenen herhangi bir mudahalenin en buyuk olumlu degisikliklerini urettigini ve etkilerin alti aya kadar surdugunu bulmustur. Mektubu iletmeden bile, takdirinizi ifade etme eylemi olculebilir psikolojik faydalar yaratir.",
          "Bu sablon, farkli etkili insan kategorileri uzerine dusunmenizi davet eder: size hayat veren ve sizi yetistirenler, size ogretip mentorlik edenler, buyumeniz icin sizi zorlayanlar ve sizi oldugunuz gibi sevenler. Her iliski oldugunuz kisiye benzersiz bir katkida bulunmustur ve bu katkiyi adlandirmak hem onlari hem de kendinizi onurlandirma eylemidir.",
          "Minnettar oldugunuz insanlar hakkinda yazmak ayrica gelecekteki kendiniz icin paha bicilmez bir kayit olusturur. Iliskiler degisir, insanlar yollarina devam eder ve ne yazik ki bazilari artik aramizda olmayacak. Onemlerinin yazili taniklarina sahip olmak, kosullar degisse bile bu baglanti ve takdir duygularini yeniden ziyaret etmenizi saglar. Gelecekteki benliginiz kalbinize bu pencerelere deger verecektir.",
          "Bu mektuplari paylasmanin gucunu dusunun. Gelecekteki kendinize hitaben yazilmis olsalar da, hakkinda yazdiginiz kisilerle bolumlerini paylasmayi da dusunebilirsiniz. Hayatta birinin hayatinda gercek bir fark yarattiginizi ogrenmekten daha anlamli cok az sey vardir. Sozleriniz birinin omur boyu deger verecegi hediye olabilir.",
        ],
        guidingQuestions: [
          "Kendinize inanmakta zorlandiginizda size kim inandi ve inanci yolunuzu nasil degistirdi?",
          "Hangi aile uyesinin etkisini kim oldugunuzda en acik goruyorsunuz ve size ozellikle ne verdiler?",
          "Dunyayi nasil gordugunuzu veya hayatinizi nasil yasadiginizi temelden degistiren bir sey size kim ogretti?",
          "Zor zamanlarda hangi arkadas yaninizda durdu ve sadakatleri sizin icin ne anlama geldi?",
          "O an rahatsiz olsa bile sizi buyutucu sekillerde kim zorladi?",
          "Hayatinizdaki etkisini onurlandirmak ve korumak istediginiz artik yasamayan biri var mi?",
          "Mevcut hayatinizda dogrudan takdir ifade etmemis olabileceginiz kime minnettar hissediyorsunuz?",
          "Gelecekteki benliginizin sizi su anda cevreleyen sevgi ve destek hakkinda ne hatirlamasini isterdiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bugun beni ben yapan insanlar hakkinda yazmak istiyorum. Hayatimizdaki inanilmaz insanlari hafife almak cok kolay, ama bugun onlari gercekten kabul etmek icin duruyorum. En cok kime minnettar oldugumu dusundugumde duygularla doluyorum...",
        howToSteps: [
          { name: "Bir sukran listesi olusturun", text: "Hayatinizi olumlu etkileyen tum insanlari listeleyerek baslayin - aileden arkadaslara, mentorlerden iz birakan kisa karsilasmalara. Filtrelemeyin, sadece ozgurce beyin firtinasi yapin." },
          { name: "Odaklanmak icin uc bes kisi secin", text: "Derinlemesine yazmak icin birkac kisi secin. En buyuk etkiye sahip olanlari veya yeterince tesekkur etmediginiz kisileri secebilirsiniz." },
          { name: "Spesifik katkilar uzerine dusunun", text: "Her kisi icin size ozellikle ne verdiklerini dusunun. Bilgelik mi, sevgi mi, meydan okuma mi, firsat mi, ornek mi yoksa varlik mi? Hediyeyi somut olarak adlandirin." },
          { name: "Kalbinizden yazin", text: "Gercek duygularinizin sayfaya akmasina izin verin. Mukemmel kelimeler konusunda endiselemeyin. Ozgunluk belagattan daha onemlidir." },
          { name: "Akilda kalici anlar ekleyin", text: "Sukraninizi belirli anilarda sabitleyin. Sizin icin ne anlama geldiklerinin ozunu yakalayan sahneleri ve konusmalari tanimlayin." },
          { name: "Paylasmayi dusunun", text: "Mektup gelecekteki kendiniz icin olsa da, bu sozlerin bazilarini anlatilan kisilerle paylasmanin iliskilerinizi derinlestirip derinlestiremeyecegini dusunun." },
        ],
      },
      estimatedTime: "30-45 min",
      category: "gratitude",
    },
  },
  "relationships": {
    "love-letter": {
      en: {
        title: "Love Letter to Your Partner Template",
        description: "Express your deepest feelings to someone you love. Create a meaningful letter that captures your appreciation, shared memories, and hopes for your future together.",
        seoTitle: "Love Letter Template | Express Your Deepest Feelings",
        seoDescription: "Write a heartfelt love letter to your partner. Express appreciation, share memories, and strengthen your bond with our guided romantic letter template.",
        content: [
          "Love letters have been treasured across cultures and centuries as one of the most intimate forms of human expression. From the passionate correspondence between Napoleon and Josephine to the tender notes exchanged by ordinary couples, written expressions of love carry a power that spoken words alone cannot match. When you write a love letter, you create something tangible that your beloved can hold, reread, and treasure for years to come.",
          "Research in relationship psychology confirms what lovers have always known: expressing appreciation and affection strengthens romantic bonds. Dr. John Gottman's decades of research at the Love Lab found that couples who regularly express gratitude and admiration for each other are significantly more likely to have lasting, satisfying relationships. A love letter is a concentrated form of this appreciation that your partner can return to whenever they need reassurance of your devotion.",
          "The act of writing a love letter also benefits the writer. Studies show that articulating positive feelings about your partner activates reward centers in your brain and can actually increase your own feelings of love and commitment. The reflective process of gathering your thoughts and choosing words carefully helps you appreciate your partner more deeply and strengthens your own emotional investment in the relationship.",
          "Unlike text messages or quick verbal expressions, a love letter invites you to slow down and truly reflect on what makes your partner special and what your relationship means to you. This intentional reflection often reveals depths of feeling and appreciation that daily life rarely allows us to express. Many people discover they feel more than they realized when they take time to put their love into words.",
          "A love letter to be delivered in the future adds another dimension of meaning. You might write about your current dreams for your shared future, express hope for upcoming milestones, or simply capture how you feel right now for your partner to read on a special anniversary. This creates a time capsule of your love that gains significance as the relationship deepens over time.",
          "Consider making love letters a regular practice in your relationship. Whether for birthdays, anniversaries, or ordinary days, the habit of expressing your feelings in writing creates a treasury of shared memory and appreciation. Many long-married couples report that their collection of love letters becomes one of their most precious possessions, a tangible record of their journey together.",
          "Research by psychologist Sara Algoe at the University of North Carolina reveals that expressing gratitude and appreciation in romantic relationships creates what she calls 'thoughtfulness cycles' - patterns where one partner's expression of appreciation motivates the other to be more thoughtful and caring. Love letters serve as powerful initiators of these positive cycles. The permanence of written words also creates what psychologists call 'relational artifacts' that couples can return to during difficult times, reminding them of their bond's strength and helping them weather inevitable storms with greater resilience and perspective.",
        ],
        guidingQuestions: [
          "What first attracted you to your partner, and what do you love most about them today?",
          "What specific moments or memories with your partner do you treasure most?",
          "How has your partner made your life better? What would be missing without them?",
          "What qualities or habits of your partner do you admire and want them to know you notice?",
          "What challenges have you faced together, and how has your love grown through them?",
          "What dreams and hopes do you have for your future together?",
          "What do you want your partner to feel when they read this letter?",
          "What would you want to say if you could express your love without any self-consciousness?",
        ],
        sampleOpening: "My Dearest [Name], as I sit down to write this, I find myself overwhelmed by how much I want to express to you. Words feel inadequate for the depth of what I feel, but I want to try - because you deserve to know exactly how much you mean to me and how grateful I am that you're in my life...",
        howToSteps: [
          { name: "Choose a meaningful setting", text: "Find a quiet, comfortable place where you can reflect without distractions. Consider playing music that reminds you of your relationship or looking through photos together to inspire your writing." },
          { name: "Reflect on your journey together", text: "Think about how you met, early memories, challenges overcome, and moments of joy. Let specific memories and feelings arise naturally rather than trying to cover everything." },
          { name: "Write from vulnerability", text: "Allow yourself to express feelings you might not say aloud. A love letter is a safe space for emotional honesty and vulnerability that deepens intimacy." },
          { name: "Be specific and personal", text: "Rather than generic expressions, include details unique to your partner and relationship. Mention specific things they do, moments you've shared, and qualities only they possess." },
          { name: "Include hopes for the future", text: "Share your dreams and intentions for your relationship. Let your partner know what you're looking forward to experiencing together." },
          { name: "Select a meaningful delivery date", text: "Choose a significant date for delivery - perhaps your anniversary, their birthday, or a future milestone you're anticipating together." },
        ],
      },
      tr: {
        title: "Partnerinize Ask Mektubu Sablonu",
        description: "Sevdiginiz birine en derin duygularinizi ifade edin. Takdirinizi, paylasilan anilari ve birlikte gelecege dair umutlarinizi yakalayan anlamli bir mektup olusturun.",
        seoTitle: "Ask Mektubu Sablonu | En Derin Duygularinizi Ifade Edin",
        seoDescription: "Partnerinize ictengelme bir ask mektubu yazin. Rehberli romantik mektup sablonumuzla takdirinizi ifade edin ve baginizi guclendirin.",
        content: [
          "Ask mektuplari, yuzyillar boyunca kulturler arasinda insan ifadesinin en mahrem bicimlerinden biri olarak deger gormustur. Napoleon ile Josephine arasindaki tutkulu yazismalardan siradan ciftlerin degis tokusuna kadar, yazili ask ifadeleri sozlu kelimelerin tek basina eslesemeyecegi bir guc tasir. Bir ask mektubu yazdiginizda, sevdiginizin tutabilecegi, yeniden okuyabilecegi ve yillarca saklayabilecegi somut bir sey yaratirsiniz.",
          "Iliski psikolojisindeki arastirmalar, asiklarin her zaman bildiklerini dogrulamaktadir: takdir ve sevgi ifade etmek romantik baglari guclendirir. Dr. John Gottman'in Ask Laboratuvarindaki onlarca yillik arastirmasi, birbirlerine duzenli olarak minnetlerini ve hayranliklarini ifade eden ciftlerin kalici ve tatmin edici iliskilere sahip olma olasiliginin onemli olcude daha yuksek oldugunu bulmustur.",
          "Ask mektubu yazma eylemi ayni zamanda yazana da fayda saglar. Calismalar, partneriniz hakkindaki olumlu duygulari ifade etmenin beyninizdeki odul merkezlerini aktive ettigini ve aslinda kendi ask ve baglilik duygularinizi artirabilecegibi gostermektedir. Dusuncelerinizi toplama ve kelimeleri dikkatle secme surecinin dusundurucu sureci, partnerinizi daha derinden takdir etmenize yardimci olur.",
          "Metin mesajlarinin veya hizli sozlu ifadelerin aksine, bir ask mektubu sizi yavasllamaya ve partnerinizi ozel kilan seyin ne oldugunu ve iliskinizin sizin icin ne anlama geldigini gercekten dusunmeye davet eder. Bu kasitli dusunme, genellikle gunluk yasamin nadiren ifade etmemize izin verdigi duygu ve takdir derinliklerini ortaya cikarir.",
          "Gelecekte teslim edilecek bir ask mektubu baska bir anlam boyutu ekler. Paylasilan geleceginiz icin mevcut hayalleriniz hakkinda yazabilir, yaklasan kilometre taslari icin umut ifade edebilir veya partnerinizin ozel bir yildonumunde okumasi icin su anda nasil hissettiginizi yakalayabilirsiniz.",
          "Ask mektuplarini iliskinizde duzenli bir uygulama haline getirmeyi dusunun. Dogum gunleri, yildonumleri veya siradan gunler icin olsun, duygularinizi yazili olarak ifade etme aliskanligi, paylasilan bellek ve takdir hazinesi yaratir. Uzun suredir evli bircok cift, ask mektuplari koleksiyonlarinin en degerli varliklarindan biri haline geldigini bildirmektedir.",
        ],
        guidingQuestions: [
          "Partnerinizde sizi ilk ceken neydi ve bugun onlar hakkinda en cok neyi seviyorsunuz?",
          "Partnerinizle hangi ozel anlari veya anilari en cok deger veriyorsunuz?",
          "Partneriniz hayatinizi nasil daha iyi hale getirdi? Onlarsiz ne eksik olurdu?",
          "Partnerinizin hangi ozelliklerini veya aliskanliklarini takdir ediyorsunuz ve fark ettiginizi bilmelerini istiyorsunuz?",
          "Birlikte hangi zorluklarla karsilastiniz ve askiniz bunlar araciligiyla nasil buyudu?",
          "Birlikte geleceginiz icin hangi hayalleriniz ve umutlariniz var?",
          "Bu mektubu okudugunda partnerinizin ne hissetmesini istiyorsunuz?",
          "Askinizi hicbir cekingenlik olmadan ifade edebilseydiniz ne soylemek isterdiniz?",
        ],
        sampleOpening: "En Sevgili [Isim], bunu yazmak icin otururken, sana ne kadar cok sey ifade etmek istedigimden bunalimda hissediyorum. Kelimeler hissettiklerimin derinligi icin yetersiz geliyor, ama denemek istiyorum - cunku benim icin ne kadar cok sey ifade ettigini ve hayatimda oldugun icin ne kadar minnettar oldugumu bilmeyi hak ediyorsun...",
        howToSteps: [
          { name: "Anlamli bir ortam secin", text: "Dikkat dagitici olmadan dusunebileceginiz sessiz, rahat bir yer bulun. Iliskinizi animsatan muzik calmayi veya yaziminizi ilham vermek icin birlikte fotograflara bakmayi dusunun." },
          { name: "Birlikte yolculugunuzu dusunun", text: "Nasil tanistiginizi, erken anilari, asilan zorluklari ve sevinc anlarini dusunun. Her seyi kapsamaya calismak yerine belirli anilarin ve duygularin dogal olarak ortaya cikmasina izin verin." },
          { name: "Kirilganliktan yazin", text: "Yuksek sesle soyleyemeyeceginiz duygulari ifade etmenize izin verin. Bir ask mektubu, yakinligi derinlestiren duygusal durustluk ve kirilganlik icin guvenli bir alandir." },
          { name: "Spesifik ve kisisel olun", text: "Genel ifadeler yerine, partnerinize ve iliskinize ozgu ayrintilar ekleyin. Yaptiklari belirli seyleri, paylastiginiz anlari ve sadece onlarin sahip oldugu nitelikleri belirtin." },
          { name: "Gelecek icin umutlar ekleyin", text: "Iliskiniz icin hayallerinizi ve niyetlerinizi paylasin. Partnerinize birlikte deneyimlemeyi dort gozle beklediginiz seyleri bildirin." },
          { name: "Anlamli bir teslimat tarihi secin", text: "Teslimat icin anlamli bir tarih secin - belki yildonumunuz, dogum gunleri veya birlikte beklediginiz gelecekteki bir kilometre tasi." },
        ],
      },
      estimatedTime: "40-60 min",
      category: "relationships",
    },
    "friendship-appreciation": {
      en: {
        title: "Friendship Appreciation Letter Template",
        description: "Honor a special friendship by expressing your gratitude and appreciation. Create a meaningful letter that celebrates your bond and strengthens your connection.",
        seoTitle: "Friendship Letter Template | Celebrate Your Bond",
        seoDescription: "Write a heartfelt letter to a dear friend. Express appreciation, share memories, and strengthen your friendship with our guided appreciation template.",
        content: [
          "Friendships are among life's greatest treasures, yet we often take them for granted. We assume our friends know how much they mean to us, but rarely do we put those feelings into words. A friendship appreciation letter breaks through the everyday routine to say what deserves to be said: that your friend matters deeply to you, that their presence enriches your life, and that you're grateful for the bond you share.",
          "Research on social connection reveals the profound importance of close friendships for our well-being. Studies by psychologist Julianne Holt-Lunstad show that strong social connections are as important to health and longevity as exercise and nutrition. Yet beyond the health benefits, friendships provide something irreplaceable: they bear witness to our lives, share our joys and sorrows, and help us become who we're meant to be.",
          "Writing a letter to a friend creates a moment of intentional connection in our distracted world. Unlike a quick text or social media comment, a letter requires time and thought. This investment itself communicates value. When you sit down to write about what your friendship means, you're not just expressing gratitude - you're strengthening the friendship itself through the act of reflection.",
          "Expressing appreciation has been shown to benefit both the giver and receiver. Dr. Martin Seligman's research on gratitude reveals that expressing thanks to someone increases happiness for both parties and often exceeds expectations in its positive impact. Many people underestimate how much their expressions of appreciation mean to others, yet receiving such a letter can be genuinely life-changing for a friend who may be struggling with self-doubt.",
          "A letter delivered in the future adds a unique dimension to friendship appreciation. You might write to arrive on a friend's birthday, during a time when they'll need encouragement, or on the anniversary of when you met. This temporal gift shows extraordinary thoughtfulness and creates a surprise that demonstrates the depth of your caring.",
          "Consider what your friends have meant to you through different seasons of life. Perhaps a childhood friend who shaped your early identity, a college companion who expanded your worldview, or a recent friend who arrived at just the right time. Each friendship carries its own significance, and each deserves to be honored with words that match the importance of the bond.",
          "Neuroscience research by Dr. Naomi Eisenberger at UCLA reveals that strong friendships activate the same reward pathways in our brains as romantic love, releasing oxytocin and dopamine that enhance our sense of well-being and belonging. When we express appreciation for our friends, we're not just being polite - we're actively reinforcing neural pathways that support mutual connection and trust. Written expressions of friendship appreciation also create what researchers call 'social capital' that can be drawn upon during challenging times, serving as a protective factor against stress, anxiety, and depression throughout our lives.",
        ],
        guidingQuestions: [
          "How did your friendship begin, and what made you know this person was special?",
          "What qualities do you admire most in your friend, and how have they influenced you?",
          "What memories or moments stand out as defining your friendship?",
          "How has your friend supported you during difficult times, and how did that impact you?",
          "What would you want your friend to know about how much they matter to you?",
          "How has your friendship evolved over time, and what has remained constant?",
          "What do you hope for the future of your friendship?",
          "What would you regret not telling this friend if you never had the chance again?",
        ],
        sampleOpening: "Dear [Friend's Name], I've been thinking about our friendship lately, and I realized that I don't tell you often enough what you mean to me. In a world that moves so fast, I want to slow down and put into words something that deserves to be said: you are one of the most important people in my life, and I'm so grateful we found each other...",
        howToSteps: [
          { name: "Reflect on your friendship's history", text: "Think back to how you met, early memories, and how your friendship has evolved. Consider what drew you together and what has kept you close through the years." },
          { name: "Identify what makes this friend special", text: "Consider the unique qualities your friend brings to your life. What do they offer that no one else does? How have they shaped who you've become?" },
          { name: "Recall specific meaningful moments", text: "Think of particular times when your friend's presence made a difference. Specific stories and details make your appreciation feel genuine and personal." },
          { name: "Express gratitude for their support", text: "Acknowledge ways your friend has been there for you, especially during challenging times. Let them know their care didn't go unnoticed." },
          { name: "Share your hopes for the friendship", text: "Write about what you look forward to sharing in the future. Express your commitment to maintaining and nurturing this important bond." },
          { name: "Choose a thoughtful delivery time", text: "Select a date that will be meaningful - their birthday, the anniversary of your friendship, or simply a time when they might need a reminder of how valued they are." },
        ],
      },
      tr: {
        title: "Arkadaslik Takdir Mektubu Sablonu",
        description: "Minnetinizi ve takdirinizi ifade ederek ozel bir arkadasligi onurlandirin. Baginizi kutlayan ve baglantinizi guclendiren anlamli bir mektup olusturun.",
        seoTitle: "Arkadaslik Mektubu Sablonu | Baginizi Kutlayin",
        seoDescription: "Sevgili bir arkadasiniza ictengelme bir mektup yazin. Rehberli takdir sablonumuzla minnetinizi ifade edin ve arkadasliginizi guclendirin.",
        content: [
          "Arkadasliklar yasamin en buyuk hazineleri arasindadir, ancak onlari cogu zaman hafife aliriz. Arkadaslarimizin bizim icin ne kadar onemli olduklarini bildiklerini varsayariz, ancak bu duygulari nadiren soze dokeriz. Bir arkadaslik takdir mektubu, soylenmesi gerekeni soylemek icin gunluk rutini kirar: arkadasinizin sizin icin derinden onemli oldugunu, varliklarinin hayatinizi zenginlestirdigini ve paylastiginiz bag icin minnettar oldugunuzu.",
          "Sosyal baglanti uzerine arastirmalar, yakin arkadasliklarin refah icin derin onemini ortaya koymaktadir. Psikolog Julianne Holt-Lunstad'in calismalari, guclu sosyal baglantilarin saglik ve uzun omur icin egzersiz ve beslenme kadar onemli oldugunu gostermektedir. Ancak saglik yararlarinin otesinde, arkadasliklar degistirilemez bir sey saglar: hayatlarimiza taniklik ederler, sevinc ve uzuntumuzu paylasirlar ve olmamiz gereken kisi haline gelmemize yardimci olurlar.",
          "Bir arkadasiniza mektup yazmak, dikkat daginik dunyamizda kasitli baglanti ani yaratir. Hizli bir metin mesaji veya sosyal medya yorumunun aksine, bir mektup zaman ve dusunce gerektirir. Bu yatirim kendisi deger iletir. Arkadasliginizin ne anlama geldigini yazmak icin oturdugunda, sadece minnet ifade etmiyorsunuz - dusunme eylemi araciligiyla arkadasligin kendisini guclendiriyorsunuz.",
          "Takdir ifade etmenin hem verene hem de alana fayda sagladigi gosterilmistir. Dr. Martin Seligman'in sukran uzerine arastirmasi, birine tesekkur ifade etmenin her iki taraf icin de mutlulugu artirdigini ve olumlu etkisinde cogu zaman beklentileri astigini ortaya koymaktadir. Bircok insan takdir ifadelerinin baskalari icin ne kadar anlam ifade ettigini hafife alir, ancak boyle bir mektup almak oz-supheyle mucadele eden bir arkadas icin gercekten yasam degistirici olabilir.",
          "Gelecekte teslim edilen bir mektup, arkadaslik takdirine benzersiz bir boyut ekler. Bir arkadasinizin dogum gununde ulasmak, cesaretlendirmeye ihtiyac duyacaklari bir zamanda veya tanistiginiz yildonumunde yazmak isteyebilirsiniz. Bu zamansal hediye olaganustu dusuncelilik gosterir ve ilginizin derinligini gosteren bir surpriz yaratir.",
          "Arkadaslarinizin hayatinizin farkli mevsimlerinde sizin icin ne anlama geldigini dusunun. Belki erken kimliginizi sekillendiren bir cocukluk arkadasi, dunya gorusunuzu genisleten bir universite arkadasi veya tam dogru zamanda gelen yeni bir arkadas. Her arkadaslik kendi onemini tasir ve her biri, bagin onemine uygun kelimelerle onurlandirmayi hak eder.",
        ],
        guidingQuestions: [
          "Arkadasliginiz nasil basladi ve bu kisinin ozel oldugunu size ne bildirdi?",
          "Arkadasinizda en cok hangi niteliklere hayransiniz ve sizi nasil etkilediler?",
          "Arkadasliginizi tanimlayan hangi anilar veya anlar one cikiyor?",
          "Arkadasiniz zor zamanlarda sizi nasil destekledi ve bu sizi nasil etkiledi?",
          "Arkadasinizin sizin icin ne kadar onemli oldugu hakkinda ne bilmelerini isterdiniz?",
          "Arkadasliginiz zamanla nasil gelisti ve ne sabit kaldi?",
          "Arkadasliginizin gelecegi icin ne umut ediyorsunuz?",
          "Bir daha sans olmasaydi bu arkadasiniza soylemediginiz icin ne pisman olurdunuz?",
        ],
        sampleOpening: "Sevgili [Arkadasin Adi], son zamanlarda arkadasligimizi dusunuyordum ve benim icin ne kadar onemli oldugunuzu sana yeterince sik soylemedigimi fark ettim. Bu kadar hizli hareket eden bir dunyada, yavaslayip soylenmesi gereken bir seyi soze dokmek istiyorum: hayatimdaki en onemli insanlardan birisin ve birbirimizi buldugumuz icin cok minnettarim...",
        howToSteps: [
          { name: "Arkadasliginizin tarihini dusunun", text: "Nasil tanistiginizi, erken anilari ve arkadasliginizin nasil gelistigini dusunun. Sizi neyin bir araya getirdigini ve yillar boyunca sizi neyin yakin tuttugunu dusunun." },
          { name: "Bu arkadasinizi ozel yapan seyi belirleyin", text: "Arkadasinizin hayatiniza kattigi benzersiz nitelikleri dusunun. Baska kimsenin sunmadigi neyi sunuyorlar? Kim oldugunuzu nasil sekillendirdiler?" },
          { name: "Belirli anlamli anlari hatirlayin", text: "Arkadasinizin varliginin fark yarattigi belirli zamanlari dusunun. Belirli hikayeler ve detaylar takdirinizi gercek ve kisisel hissettirir." },
          { name: "Destekleri icin minnet ifade edin", text: "Arkadasinizin ozellikle zor zamanlarda sizin icin nasil orada oldugunu kabul edin. Onlara ilgilerinin gozden kacmadigini bildirin." },
          { name: "Arkadaslik icin umutlarinizi paylasin", text: "Gelecekte paylasmayi dort gozle beklediginiz seyler hakkinda yazin. Bu onemli bagi surdurmeve besleme taahhudunuzu ifade edin." },
          { name: "Dusunceli bir teslimat zamani secin", text: "Anlamli olacak bir tarih secin - dogum gunleri, arkadasliginizin yildonumu veya sadece ne kadar degerli olduklarinin bir hatiratmasina ihtiyac duyabilecekleri bir zaman." },
        ],
      },
      estimatedTime: "30-45 min",
      category: "relationships",
    },
  },
  "career": {
    "first-day-new-job": {
      en: {
        title: "First Day New Job Letter Template",
        description: "Capture your hopes, excitement, and intentions as you begin a new professional chapter. Document this pivotal moment to reflect on your growth and journey ahead.",
        seoTitle: "First Day New Job Letter Template | Career Transition Reflection",
        seoDescription: "Write a letter to your future self on your first day at a new job. Capture your hopes, fears, and goals to reflect on your professional growth journey.",
        content: [
          "Starting a new job is one of life's most significant professional transitions. Your first day is filled with a unique mixture of excitement, nervousness, hope, and determination that will never be replicated in quite the same way. This template helps you capture that pivotal moment before the newness fades and daily routines set in, creating a time capsule of your professional fresh start.",
          "Research in organizational psychology shows that the first 90 days in a new role are critical for long-term success and satisfaction. Studies by Dr. Michael Watkins reveal that the mindset and intentions you bring to a new position significantly influence your trajectory. By documenting your initial perspective, you create a baseline for measuring your growth and a reminder of the energy and vision you brought to this opportunity.",
          "Career transitions offer rare windows of clarity about what we want from our professional lives. The anticipation before starting a new job often crystallizes our hopes and values in ways that become obscured once we're deep in daily responsibilities. Writing this letter preserves that clarity and gives your future self access to the unfiltered aspirations you held at this turning point.",
          "The emotions you experience on your first day - whether confidence or imposter syndrome, excitement or anxiety - are valuable data about your relationship with work and change. Psychologists note that these transitions activate both our hopes and our fears, making them powerful moments for self-understanding. Your future self will gain profound insight from reading how you navigated this threshold.",
          "Many professionals report that reading letters written on their first day helps them appreciate how far they've come when facing later challenges. The nervous newcomer who wrote that letter has become someone with expertise, relationships, and accomplishments that seemed impossible at the start. This perspective is invaluable during difficult periods or when considering future transitions.",
          "Consider making this a practice for every major career transition - new jobs, promotions, role changes, or pivots to new industries. Over time, you'll build a remarkable archive of your professional evolution, capturing not just what you did but who you were becoming at each stage of your career journey.",
          "Research from Harvard Business School's Teresa Amabile reveals that progress - even small wins - is the most powerful motivator in professional life. Yet we often fail to notice our own progress because we're living through it incrementally. A first-day letter creates a fixed point of reference that makes your growth visible and measurable. When you read it months or years later, the contrast between who you were and who you've become provides concrete evidence of your development, reinforcing your sense of professional efficacy and growth trajectory.",
          "The practice of writing on transition thresholds also builds what psychologists call 'narrative identity' - the ongoing story we tell ourselves about who we are and where we're headed. By documenting these pivotal moments, you're actively shaping the narrative of your professional life rather than letting it be constructed retrospectively. This intentional approach to career storytelling helps you maintain agency and purpose even as circumstances change, creating coherence and meaning across different roles and organizations throughout your working life.",
        ],
        guidingQuestions: [
          "What hopes and dreams are you bringing to this new role, and what would success look like in one year?",
          "What specific skills or qualities do you want to develop in this position?",
          "What fears or concerns do you have, and what would help address them?",
          "Why did you choose this opportunity, and what excited you most during the interview process?",
          "What do you want to remember about how you felt walking in on your first day?",
          "What relationships do you hope to build, and what kind of colleague do you want to be?",
          "What lessons from previous roles do you want to carry forward, and what patterns do you want to break?",
          "What would you tell your future self if this job turns out to be challenging or disappointing?",
        ],
        sampleOpening: "Dear Future Me, today is my first day at [company name], and I'm writing this while the experience is still fresh - before I know how things will unfold. Right now, I'm feeling a mixture of excitement and nervousness that I want to capture honestly...",
        howToSteps: [
          { name: "Write on your actual first day", text: "Capture your thoughts and feelings while they're vivid and unfiltered. Don't wait - the unique perspective of day one fades quickly as you acclimate to your new environment." },
          { name: "Document your current state honestly", text: "Include both your excitement and your fears. Note your confidence levels, any imposter syndrome feelings, and the specific emotions you're experiencing. Authenticity matters more than positivity." },
          { name: "Record concrete details and context", text: "Note your job title, team, manager, company size, industry, and why you chose this opportunity. Include sensory details about your workspace and first impressions of the culture." },
          { name: "Articulate your professional aspirations", text: "Write about what you hope to learn, accomplish, and become in this role. Be specific about skills you want to develop and contributions you want to make." },
          { name: "Address potential challenges", text: "Acknowledge concerns or potential difficulties you anticipate. Write advice to your future self for navigating tough times or considering whether to stay." },
          { name: "Choose a meaningful delivery date", text: "Schedule delivery for your one-year work anniversary, when you'll have enough experience to appreciate how far you've come while the letter is still relevant to your current role." },
        ],
      },
      tr: {
        title: "Yeni Is Ilk Gun Mektup Sablonu",
        description: "Yeni bir profesyonel bolume baslarken umutlarinizi, heyecaninizi ve niyetlerinizi yakalay in. Buyumenizi ve onunuzdeki yolculugu dusunmek icin bu kritik ani belgeleyin.",
        seoTitle: "Yeni Is Ilk Gun Mektup Sablonu | Kariyer Gecis Dusuncesi",
        seoDescription: "Yeni isinizdeki ilk gununuzde gelecekteki kendinize bir mektup yazin. Profesyonel gelisim yolculugunuzu dusunmek icin umutlarinizi ve hedeflerinizi yakalay in.",
        content: [
          "Yeni bir ise baslamak, hayatin en onemli profesyonel gecislerinden biridir. Ilk gununuz, tam olarak ayni sekilde asla tekrarlanmayacak benzersiz bir heyecan, gerginlik, umut ve kararlilik karisimi ile doludur. Bu sablon, yenilik solmadan ve gunluk rutinler yerlesmeden once bu kritik ani yakalamaniza yardimci olur ve profesyonel yeni baslangicинizin bir zaman kapsulu olusturur.",
          "Orgutsel psikoloji arastirmalari, yeni bir roldeki ilk 90 gunun uzun vadeli basari ve memnuniyet icin kritik oldugunu gostermektedir. Dr. Michael Watkins'in calismalari, yeni bir pozisyona getirdiginiz zihniyet ve niyetlerin yorinenizi onemli olcude etkiledigini ortaya koymaktadir. Baslangic bakis acinizi belgeleyerek, buyumenizi olcmek icin bir temel ve bu firsata getirdiginiz enerji ve vizyonun bir hatiratmasi olusturursunuz.",
          "Kariyer gecisleri, profesyonel yaslarimizdan ne istedigimiz hakkinda nadir netlik pencereleri sunar. Yeni bir ise baslamadan onceki beklenti, gunluk sorumluluklarin derinliklerinde bir kez bulaniklasan sekillerde umutlarimizi ve degerlerimizi kristallestir. Bu mektubu yazmak, bu netligi korur ve gelecekteki kendinize bu donum noktasinda tuttugнuz filtresiz ozlemlere erisim saglar.",
          "Ilk gununuzde yasadiginiz duygular - ister guven ister sahtekar sendromu, ister heyecan ister kaygi olsun - is ve degisimle iliskiniz hakkinda degerli verilerdir. Psikologlar, bu gecislerin hem umutlarimizi hem de korkularimizi harekete gecirdigini ve onlari oz-anlayis icin guclu anlar yaptigini belirtmektedirler.",
          "Bircok profesyonel, ilk gunlerinde yazilan mektuplari okumanin, daha sonraki zorluklarla karsilastiklarinda ne kadar ilerledigini takdir etmelerine yardimci oldugunu bildirmektedir. O mektubu yazan gergin yeni gelen, baslangicta imkansiz gorunen uzmanlik, iliskiler ve basarilara sahip biri haline gelmistir.",
          "Bunu her buyuk kariyer gecisi icin bir uygulama haline getirmeyi dusunun - yeni isler, terfiler, rol degisiklikleri veya yeni sektorlere yonelisler. Zamanla, profesyonel evriminizin dikkate deger bir arsivini olusturacaksiniz, sadece ne yaptiginizi degil, kariyer yolculugunuzun her asamasinda kim oldugunuzu yakalayarak.",
        ],
        guidingQuestions: [
          "Bu yeni role hangi umutlari ve hayalleri getiriyorsunuz ve bir yil icinde basari nasil gorunurdu?",
          "Bu pozisyonda hangi spesifik becerileri veya nitelikleri gelistirmek istiyorsunuz?",
          "Hangi korkulariniz veya endiseleriniz var ve bunlari ele almaya ne yardimci olurdu?",
          "Bu firsati neden sectiniz ve mulakat surecinde sizi en cok ne heyecanlandirdi?",
          "Ilk gununuzde iceri girerken nasil hissettiginizi ne hatirlamak istersiniz?",
          "Hangi iliskileri kurmayi umuyorsunuz ve nasil bir meslektas olmak istiyorsunuz?",
          "Onceki rollerden hangi dersleri ileriye tasimak istiyorsunuz ve hangi kaliplari kirmak istiyorsunuz?",
          "Bu is zorlu veya hayal kirikligi yaratici cikarsa gelecekteki kendinize ne soylerdiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bugun [sirket adi]'ndaki ilk gunum ve deneyim hala tazeyken bunu yaziyorum - islerin nasil gelisecegini bilmeden once. Su anda, durustce yakalamak istedigim bir heyecan ve gerginlik karisimi hissediyorum...",
        howToSteps: [
          { name: "Gercek ilk gununuzde yazin", text: "Dusuncelerinizi ve duygularinizi canli ve filtresizken yakalyin. Beklemeyin - ilk gunun benzersiz bakis acisi yeni ortaminiza alistikca hizla solar." },
          { name: "Mevcut durumunuzu durustce belgeleyin", text: "Hem heyecaninizi hem de korkularinizi ekleyin. Guven seviyelerinizi, herhangi bir sahtekar sendromu hissini ve yasadiginiz spesifik duygulari not edin." },
          { name: "Somut detaylari ve baglami kaydedin", text: "Is unvaninizi, ekibinizi, yoneticinizi, sirket buyuklugunu, sektoru ve bu firsati neden sectiginizi not edin. Calisma alaniniz ve kultur hakkinda duyusal detaylar ekleyin." },
          { name: "Profesyonel ozlemlerinizi ifade edin", text: "Bu rolde ne ogrenmeyi, basarmayi ve olmayi umdugunuzu yazin. Gelistirmek istediginiz beceriler ve yapmak istediginiz katkilar hakkinda spesifik olun." },
          { name: "Potansiyel zorluklari ele alin", text: "Beklediginiz endiseleri veya potansiyel zorluklari kabul edin. Zor zamanlarda gezinmek veya kalip kalmamayi dusunmek icin gelecekteki kendinize tavsiye yazin." },
          { name: "Anlamli bir teslimat tarihi secin", text: "Bir yillik is yildonumunuz icin teslimat planlayin, mektup hala mevcut rolunuzle ilgiliyken ne kadar ilerlediginizi takdir etmek icin yeterli deneyime sahip olacaksiniz." },
        ],
      },
      estimatedTime: "30-45 min",
      category: "career",
    },
    "career-milestone": {
      en: {
        title: "Career Milestone Letter Template",
        description: "Celebrate and document significant professional achievements. Create a lasting record of your accomplishments, the journey to reach them, and wisdom gained along the way.",
        seoTitle: "Career Milestone Letter Template | Professional Achievement Reflection",
        seoDescription: "Write a letter celebrating your career milestone. Document your professional achievements, lessons learned, and growth to inspire your future self.",
        content: [
          "Career milestones - promotions, major projects completed, awards received, years of service - mark significant chapters in your professional story. Yet in the rush to the next challenge, we often fail to pause and truly acknowledge what we've accomplished. This template creates space to celebrate your achievement and extract lasting wisdom from the journey that brought you here.",
          "Psychological research on achievement and well-being shows that the way we process our successes matters as much as the successes themselves. Dr. Martin Seligman's work on positive psychology reveals that savoring achievements - really taking time to appreciate them - builds resilience and motivation for future challenges. Writing about your milestone is a powerful form of savoring.",
          "Documenting your career milestones serves multiple purposes beyond personal satisfaction. It creates evidence of your capabilities for future reference, captures lessons learned while they're fresh, and builds a narrative of professional growth you can draw upon during challenging times or career transitions. Many professionals find that reviewing past milestone letters helps them recognize patterns in their success.",
          "The story of how you reached this milestone is as valuable as the achievement itself. What obstacles did you overcome? Who helped you along the way? What skills did you develop? What sacrifices did you make? These details fade from memory quickly, but writing preserves them for your future self and potentially for others who might benefit from your experience.",
          "Career milestones are also moments to recalibrate. Having reached a significant goal, you have the opportunity to reflect on whether your professional path still aligns with your values and life vision. Sometimes achieving what we thought we wanted reveals new priorities. This letter creates space for that honest assessment alongside the celebration.",
          "Consider writing milestone letters not just for major achievements but for quieter victories as well - completing a difficult project, building an important relationship, mastering a new skill, or surviving a challenging period. Your career narrative is built from these accumulated moments, and documenting them creates a rich tapestry of your professional life.",
          "The act of writing about achievements activates what psychologists call 'self-distancing' - the ability to view our experiences from a broader perspective. Research by Ethan Kross at the University of Michigan shows that reflecting on accomplishments in written form helps us extract transferable lessons and patterns rather than dismissing successes as flukes or external circumstances. This documented self-knowledge becomes a resource you can draw upon when facing imposter syndrome or doubt about your capabilities in future roles.",
          "Beyond personal benefits, milestone letters serve an important archival function for the broader professional narrative. The story of how you achieved this success - including the failures, pivots, and persistence along the way - contains valuable knowledge that might benefit others facing similar challenges. Whether you eventually share these insights through mentoring, thought leadership, or simply passing wisdom to colleagues, the act of capturing them preserves professional knowledge that might otherwise be lost to the passage of time and fading memory.",
        ],
        guidingQuestions: [
          "What milestone are you celebrating, and why is it significant to you beyond the external recognition?",
          "What was the journey to this achievement like, including the challenges and setbacks you overcame?",
          "Who contributed to your success, and how do you want to acknowledge their support?",
          "What skills, habits, or mindsets were most crucial in reaching this milestone?",
          "What sacrifices or trade-offs did you make, and how do you feel about them now?",
          "What would you tell your past self who was struggling on the way to this achievement?",
          "How has reaching this milestone changed your view of what's possible for your career?",
          "What new goals or aspirations has this achievement revealed or inspired?",
        ],
        sampleOpening: "Dear Future Me, I'm writing this to mark a significant moment in my career - [describe milestone]. As I pause to appreciate this achievement, I want to capture not just what happened, but the full journey that brought me here and what it means for my path forward...",
        howToSteps: [
          { name: "Choose the right moment to reflect", text: "Write shortly after achieving the milestone while emotions and details are fresh, but not so immediately that you haven't had time to process the significance. A few days to a week after is often ideal." },
          { name: "Document the achievement thoroughly", text: "Record the specific milestone, when it occurred, and the official recognition or confirmation. Include context about what made this achievement challenging or significant in your industry or organization." },
          { name: "Tell the complete journey story", text: "Write about the path to this milestone - the timeline, key turning points, obstacles overcome, and moments of doubt or breakthrough. This narrative context makes the achievement meaningful." },
          { name: "Acknowledge your support system", text: "Name the people who contributed to your success - mentors, sponsors, teammates, family members, or friends. Describe their specific contributions and what their support meant to you." },
          { name: "Extract actionable lessons", text: "Identify the specific skills, habits, mindsets, or strategies that were most crucial to your success. Write these as advice you'd give to someone pursuing a similar goal." },
          { name: "Set intentions for the next chapter", text: "Reflect on what this milestone reveals about your future direction. Write about new goals, changed priorities, or fresh perspectives that have emerged from this achievement." },
        ],
      },
      tr: {
        title: "Kariyer Kilometre Tasi Mektup Sablonu",
        description: "Onemli profesyonel basarilari kutlayin ve belgeleyin. Basarilarinizin, onlara ulasma yolculugunuzun ve yol boyunca kazanilan bilgeligin kalici bir kaydini olusturun.",
        seoTitle: "Kariyer Kilometre Tasi Mektup Sablonu | Profesyonel Basari Dusuncesi",
        seoDescription: "Kariyer kilometre tasinizi kutlayan bir mektup yazin. Gelecekteki kendinize ilham vermek icin profesyonel basarilarinizi ve ogrenilen dersleri belgeleyin.",
        content: [
          "Kariyer kilometre taslari - terfiler, tamamlanan buyuk projeler, alinan oduller, hizmet yillari - profesyonel hikayenizde onemli bolumleri isretler. Ancak bir sonraki zorluga kosusturmada, genellikle durup basardiklarimizi gercekten kabul etmekte basarisiz oluruz. Bu sablon, basarinizi kutlamak ve sizi buraya getiren yolculuktan kalici bilgelik cikarmak icin alan yaratir.",
          "Basari ve refah uzerine psikolojik arastirmalar, basarilarimizi isleme sekimimizin basarilarin kendileri kadar onemli oldugunu gostermektedir. Dr. Martin Seligman'in pozitif psikoloji uzerindeki calismasi, basarilarin tadini cikarmanin - onlari takdir etmek icin gercekten zaman ayirmanin - gelecekteki zorluklar icin dayaniklilik ve motivasyon olusturdugunu ortaya koymaktadir.",
          "Kariyer kilometre taslarinizi belgelemek, kisisel tatminin otesinde bircok amaca hizmet eder. Gelecekte basvurmak icin yeteneklerinizin kanitini olusturur, taze iken ogrenilen dersleri yakalar ve zorlu zamanlarda veya kariyer gecislerinde basvurabilеceginiz bir profesyonel buyume anlatisi olusturur.",
          "Bu kilometre tasina nasil ulastiginizin hikayesi, basarinin kendisi kadar degerlidir. Hangi engelleri astiniz? Yol boyunca size kim yardimci oldu? Hangi becerileri gelistirdiniz? Hangi fedakarliklari yaptiniz? Bu detaylar hafizadan hizla solar, ancak yazmak onlari gelecekteki kendiniz ve deneyiminizden faydalanabilecek baskalan icin korur.",
          "Kariyer kilometre taslari ayni zamanda yeniden kalibrasyon anlaridir. Onemli bir hedefe ulastiktan sonra, profesyonel yolunuzun hala degerleriniz ve yasam vizyonunuzla uyumlu olup olmadigini dusunme firsatiniz vardir. Bazen istedigimizi dusundugumuz seyi basarmak yeni oncelikleri ortaya cikarir.",
          "Kilometre tasi mektuplarini sadece buyuk basarilar icin degil, daha sessiz zaferler icin de yazmayi dusunun - zor bir projeyi tamamlamak, onemli bir iliski kurmak, yeni bir beceride ustalasmak veya zorlu bir donemden sag cikmak. Kariyer anlatiniz bu biriktirilmis anlardan olusur ve onlari belgelemek profesyonel yasaminizin zengin bir dokusunu olusturur.",
        ],
        guidingQuestions: [
          "Hangi kilometre tasini kutluyorsunuz ve disaridan taninmanin otesinde sizin icin neden onemli?",
          "Bu basariya yolculuk nasil bir seydi, ustesinden geldiginiz zorluklar ve gerilemeler dahil?",
          "Basariniza kim katkida bulundu ve onlarin destegini nasil kabul etmek istiyorsunuz?",
          "Bu kilometre tasina ulasmada hangi beceriler, aliskanliklar veya zihniyetler en onemli oldu?",
          "Hangi fedakarliklari veya takaslari yaptiniz ve simdi onlar hakkinda nasil hissediyorsunuz?",
          "Bu basariya giden yolda mucadele eden gecmisteki kendinize ne soylerdiniz?",
          "Bu kilometre tasina ulasmak, kariyeriniz icin neyin mumkun olduguna dair gorusunuzu nasil degistirdi?",
          "Bu basari hangi yeni hedefleri veya ozlemleri ortaya cikardi veya ilham verdi?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bunu kariyerimdeki onemli bir ani isaretlemek icin yaziyorum - [kilometre tasini tanimlayin]. Bu basariyi takdir etmek icin dururken, sadece ne oldugunu degil, beni buraya getiren tam yolculugu ve ileriye donuk yolum icin ne anlama geldigini yakalamak istiyorum...",
        howToSteps: [
          { name: "Dusunmek icin dogru ani secin", text: "Duygular ve detaylar tazeyken kilometre tasina ulastiktan kisa bir sure sonra yazin, ancak onemini islemek icin zamaniniz olmadigi kadar hemen degil. Birkac gun ile bir hafta arasi genellikle idealdir." },
          { name: "Basariyi kapsamli bir sekilde belgeleyin", text: "Spesifik kilometre tasini, ne zaman gerceklestigini ve resmi taninma veya onayi kaydedin. Sektorunuzde veya organizasyonunuzda bu basariyi zorlu veya onemli kilan baglam ekleyin." },
          { name: "Tam yolculuk hikayesini anlatin", text: "Bu kilometre tasina giden yol hakkinda yazin - zaman cizelgesi, anahtar donum noktalari, asilan engeller ve suphe veya atilim anlari. Bu anlati baglami basariyi anlamli kilar." },
          { name: "Destek sisteminizi kabul edin", text: "Basariniza katkida bulunan kisileri adlandirin - mentorlar, sponsorlar, takim arkadaslari, aile uyeleri veya arkadaslar. Onlarin spesifik katkilarini ve desteklerinin sizin icin ne anlam ifade ettigini tanimlayin." },
          { name: "Eyleme gecirilebilir dersler cikarin", text: "Basariniz icin en onemli olan spesifik becerileri, aliskanliklari, zihniyetleri veya stratejileri belirleyin. Bunlari benzer bir hedef pesinde kosan birine vereceginiz tavsiye olarak yazin." },
          { name: "Sonraki bolum icin niyetler belirleyin", text: "Bu kilometre tasinin gelecek yonunuz hakkinda ne ortaya koydugunu dusunun. Bu basaridan ortaya cikan yeni hedefler, degisen oncelikler veya taze bakis acilari hakkinda yazin." },
        ],
      },
      estimatedTime: "40-60 min",
      category: "career",
    },
  },
  "life-transitions": {
    "moving-to-new-city": {
      en: {
        title: "Moving to a New City Letter Template",
        description: "Document your hopes, fears, and expectations as you embark on a major geographic transition. Create a time capsule of this pivotal moment for your future self to revisit.",
        seoTitle: "Moving to a New City Letter Template | Life Transition Guide",
        seoDescription: "Write a letter to your future self before moving to a new city. Capture your expectations, hopes, and fears with our guided transition template.",
        content: [
          "Moving to a new city represents one of life's most significant transitions - a decision that reshapes your daily existence, relationships, and sense of identity. Whether you're relocating for work, love, adventure, or a fresh start, this moment deserves documentation. Research by psychologist William Bridges identifies three phases in any transition: ending, neutral zone, and new beginning. Writing a letter now captures you in the liminal space between worlds.",
          "Studies in environmental psychology reveal that geographic moves rank among the top ten most stressful life events, yet they also offer unparalleled opportunities for personal reinvention. Dr. Shigehiro Oishi's research at the University of Virginia found that people who move frequently develop greater adaptability and openness to new experiences. Your letter can serve as an anchor during the inevitable adjustment period ahead.",
          "The anticipation of a move activates both excitement and anxiety in our nervous system - what psychologists call 'emotional ambivalence.' By writing about both your hopes and fears now, you create a nuanced record of this complex emotional landscape. Your future self, settled into the new city, may have forgotten the intensity of these feelings or the specific dreams that motivated the move.",
          "Place attachment research shows that it takes approximately 12-18 months to develop genuine connection to a new location. During this period, nostalgia for your previous home is natural and healthy. Your letter becomes a bridge between your past and present selves, honoring where you've been while embracing where you're going.",
          "Consider what you want to preserve from your current life and what you hope to leave behind. Transitions offer rare opportunities for intentional identity crafting - the chance to emphasize certain aspects of yourself while allowing others to fade. This template guides you through capturing not just the logistics of your move, but its deeper significance in your life story.",
          "Many people report that reading letters written before major moves provides profound perspective years later. You may discover that concerns that loomed large at the time resolved naturally, or that unexpected challenges arose that you couldn't have anticipated. This record of your pre-move mindset becomes invaluable wisdom for understanding your own patterns in future transitions.",
          "Neuroscience research on autobiographical memory reveals that emotionally significant events - like major relocations - are encoded with richer contextual detail than routine experiences. However, these memories still fade and distort over time. Dr. Elizabeth Loftus's work on memory reconstruction shows that our recollections of past emotions and motivations are heavily influenced by present circumstances. By writing now, you preserve an authentic snapshot that your brain cannot later revise. This temporal artifact serves as a psychological anchor, allowing your future self to genuinely understand who you were at this pivotal threshold rather than who memory later suggests you might have been.",
        ],
        guidingQuestions: [
          "What are your primary reasons for making this move, and what do you hope it will bring to your life?",
          "What fears or anxieties do you have about leaving your current home and community?",
          "What aspects of your current life do you want to carry with you, and what would you like to leave behind?",
          "How do you imagine your daily life will change in the new city?",
          "What relationships are you concerned about maintaining across the distance?",
          "What kind of person do you hope to become through this transition?",
          "What will success look like six months, one year, and five years after the move?",
          "What advice would you give yourself for the difficult moments of adjustment ahead?",
        ],
        sampleOpening: "Dear Future Me, as I write this, boxes surround me and my life is in transition. In just [time until move], I'll be starting over in [new city]. Right now, I'm feeling a mix of excitement and terror that I want to capture before it fades. Here's what I'm thinking and feeling on the cusp of this major change...",
        howToSteps: [
          { name: "Write during the transition period", text: "Don't wait until everything is settled - capture this moment while you're still between places. The uncertainty and anticipation are part of what makes this letter valuable." },
          { name: "Document your current environment", text: "Describe your current home, neighborhood, and daily routines in detail. Include sensory memories - the sounds, smells, and feeling of your space. These details fade faster than you expect." },
          { name: "Be honest about mixed emotions", text: "Acknowledge both excitement and fear without judgment. Transitions naturally evoke ambivalence. Recording the full emotional spectrum honors the complexity of major life changes." },
          { name: "Set intentions rather than rigid expectations", text: "Write about what you hope for without demanding specific outcomes. Flexibility is key to successful transitions. Frame goals as intentions you're committed to exploring." },
          { name: "Include practical predictions to compare later", text: "Note what you expect your life to look like - where you'll live, work, spend time, and who you'll befriend. Your future self will find these predictions fascinating to compare with reality." },
          { name: "Schedule delivery for the adjustment period", text: "Choose a date 6-12 months after your move, when you'll likely be through the most intense adjustment phase but still remember the anticipation of moving." },
        ],
      },
      tr: {
        title: "Yeni Sehire Tasima Mektup Sablonu",
        description: "Buyuk bir cografi gecis baslatirken umutlarinizi, korkularinizi ve beklentilerinizi belgeleyin. Gelecekteki benliginizin yeniden ziyaret edebilecegi bu kritik anin bir zaman kapsulu olusturun.",
        seoTitle: "Yeni Sehire Tasima Mektup Sablonu | Yasam Gecisi Rehberi",
        seoDescription: "Yeni bir sehire tasinmadan once gelecekteki kendinize bir mektup yazin. Rehberli gecis sablonumuzla beklentilerinizi, umutlarinizi ve korkularinizi yakalyin.",
        content: [
          "Yeni bir sehire tasinmak, yasamin en onemli gecislerinden birini temsil eder - gunluk varliginizi, iliskilerinizi ve kimlik duygunuzu yeniden sekillendiren bir karar. Is, ask, macera veya taze bir baslangic icin yer degistiriyor olsaniz da, bu an belgelemeyi hak ediyor. Psikolog William Bridges, herhangi bir geciste uc asamayi tanimlar: bitis, notr bolge ve yeni baslangic.",
          "Cevre psikolojisindeki calismalar, cografi tasinmalarin en stresli on yasam olayi arasinda yer aldigini ortaya koymaktadir, ancak ayni zamanda kisisel yeniden icat icin essiz firsatlar sunmaktadir. Dr. Shigehiro Oishi'nin Virginia Universitesi'ndeki arastirmasi, sik sik tasinan kisilerin daha buyuk uyum yetenegi ve yeni deneyimlere aciklik gelistirdigini bulmustur.",
          "Tasima beklentisi sinir sistemimizde hem heyecani hem de kaygiyi aktive eder - psikologlarin 'duygusal cift degerlilik' dedigi sey. Simdi hem umutlariniz hem de korkulariniz hakkinda yazarak, bu karmasik duygusal manzaranin nüansli bir kaydini olusturursunuz.",
          "Yer bagliligi arastirmasi, yeni bir konuma gercek baglanti gelistirmenin yaklasik 12-18 ay surdugunu gostermektedir. Bu donemde, onceki evinize nostalji dogal ve sagliklidir. Mektubunuz, gecmis ve simdiki benlikleriniz arasinda bir kopru olur.",
          "Mevcut yasaminizdan ne korumak istediginizi ve geride ne birakmak umdugunuzu dusunun. Gecisler, kasitli kimlik olusturma icin nadir firsatlar sunar - kendinizin belirli yonlerini vurgulama ve digerlerinin solmasina izin verme sansi.",
          "Bircok insan, buyuk tasinmalar oncesinde yazilan mektuplari yillar sonra okumanin derin bir bakis acisi sagladigini bildirmektedir. O zamanlarda buyuk gorunen kaygilarin dogal olarak cozuldugunu veya ongoremedikleri beklenmedik zorluklarin ortaya ciktigini kesfedebilirsiniz.",
        ],
        guidingQuestions: [
          "Bu hareketi yapmanizin temel nedenleri nelerdir ve yasaminiza ne getirmesini umuyorsunuz?",
          "Mevcut evinizi ve toplulugunuzu birakmakla ilgili hangi korkulariniz veya kaygilariniz var?",
          "Mevcut yasaminizin hangi yonlerini yanizda tasimak istiyorsunuz ve neyi geride birakmak istersiniz?",
          "Gunluk yasaminizin yeni sehirde nasil degisecegini hayal ediyorsunuz?",
          "Mesafe boyunca hangi iliskileri surdurmek konusunda endiseleniyorsunuz?",
          "Bu gecis sayesinde nasil bir insan olmayi umuyorsunuz?",
          "Tasinmadan alti ay, bir yil ve bes yil sonra basari nasil gorunecek?",
          "Ileriki zor uyum anlari icin kendinize ne tavsiye verirsiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bunu yazarken kutular etrafimi cevreliyor ve hayatim gecis halinde. Sadece [tasinmaya kalan sure] sonra [yeni sehir]'de yeniden baslayacagim. Su anda solmadan once yakalamak istedigim bir heyecan ve korku karisimi hissediyorum...",
        howToSteps: [
          { name: "Gecis doneminde yazin", text: "Her sey yerlesene kadar beklemeyin - henuz yerler arasindayken bu ani yakalayin. Belirsizlik ve beklenti bu mektubu degerli kilan seyin bir parcasidir." },
          { name: "Mevcut cevreniyi belgeleyin", text: "Mevcut evinizi, mahallenizi ve gunluk rutinlerinizi ayrintili olarak tanimlayin. Duyusal anilari dahil edin - mekaninizin sesleri, kokulari ve hissi." },
          { name: "Karisik duygular hakkinda durust olun", text: "Hem heyecani hem de korkuyu yargilamadan kabul edin. Gecisler dogal olarak cift degerlilik uyandirir. Tum duygusal yelpazeyi kaydetmek buyuk yasam degisikliklerinin karmasikligini onurlandirir." },
          { name: "Kati beklentiler yerine niyetler belirleyin", text: "Belirli sonuclar talep etmeden ne umdugunuz hakkinda yazin. Esneklik basarili gecislerin anahtaridir." },
          { name: "Daha sonra karsilastirmak icin pratik tahminler ekleyin", text: "Yasaminizin nasil gorunecegini beklediginizi not edin - nerede yasayacaginizi, calisacaginizi, vakit gecirecegini ve kiminle arkadas olacaginizi." },
          { name: "Teslimat tarihini uyum donemi icin planlayin", text: "Tasinmanizdan 6-12 ay sonra bir tarih secin, en yogun uyum asamasini gecmis ama tasinma beklentisini hala hatirlayacaginiz zaman." },
        ],
      },
      estimatedTime: "40-50 min",
      category: "life-transitions",
    },
    "starting-fresh": {
      en: {
        title: "Starting Fresh Letter Template",
        description: "Capture the hope and determination of a new chapter in your life. Document your intentions for reinvention and create a touchstone for your journey of personal transformation.",
        seoTitle: "Starting Fresh Letter Template | New Chapter in Life Guide",
        seoDescription: "Write a letter to your future self when starting fresh. Capture your intentions for change and personal reinvention with our transformative template.",
        content: [
          "Starting fresh is one of humanity's most powerful experiences - the moment when you decide to close one chapter and begin another with intention and hope. Whether prompted by a significant life event, a personal realization, or simply the recognition that change is needed, these turning points deserve to be honored and documented. This template helps you capture the energy and clarity of a fresh start.",
          "Psychology research on 'temporal landmarks' by Dr. Hengchen Dai at UCLA shows that perceived fresh starts - whether New Year's Day, a birthday, or any personally meaningful moment - create natural motivation for change. These temporal landmarks help us psychologically separate from our past selves and commit more fully to new behaviors. Writing a letter amplifies this effect by creating a concrete record of your intentions.",
          "The desire to start fresh often emerges from a complex mix of dissatisfaction with the present and hope for the future. Dr. Timothy Wilson's research on 'affective forecasting' reveals that we often struggle to predict how we'll feel after major changes. Your letter becomes a fascinating record of your expectations that you can compare with the reality your future self experiences.",
          "Fresh starts require courage - the willingness to acknowledge that something needs to change and the determination to do something about it. They also require self-compassion, as the path from intention to lasting change is rarely linear. Your letter can serve as a source of encouragement during the inevitable setbacks and plateaus of transformation.",
          "Consider what has brought you to this moment of wanting to start fresh. Is it an external circumstance that has changed, or an internal shift in values and priorities? Understanding the 'why' behind your fresh start will help sustain your motivation when the initial enthusiasm fades and the hard work of change begins.",
          "Many transformational journeys lose momentum because we forget the intensity of our original motivation. By documenting your current mindset - the frustrations with the old way, the vision for the new - you create a resource to reconnect with your 'why' during challenging moments. Your future self will thank you for this gift of perspective and encouragement.",
          "Research in behavioral psychology shows that the initial phase of change - what Dr. James Prochaska calls the 'action stage' in his Transtheoretical Model - is often fueled by strong emotional energy and clarity of purpose. However, maintaining change requires different psychological resources as initial motivation inevitably wanes. Dr. Gabriele Oettingen's work on mental contrasting demonstrates that sustainable change requires both positive visualization and realistic obstacle planning. Your letter captures both your aspirational vision and your awareness of challenges, creating a blueprint for persistence. When you read this letter months into your journey, it will reconnect you with the emotional intensity and clear reasoning that initiated your fresh start, providing the motivational renewal often needed to sustain transformation through its difficult middle phases.",
        ],
        guidingQuestions: [
          "What has brought you to this moment of wanting to start fresh? What was the catalyst for change?",
          "What aspects of your life or yourself are you seeking to transform, and why?",
          "What patterns, habits, or ways of being are you consciously choosing to leave behind?",
          "Who do you want to become through this fresh start? What qualities do you want to cultivate?",
          "What support systems or resources will you need to sustain this change?",
          "What obstacles do you anticipate, and how do you plan to navigate them?",
          "How will you measure progress and success in this new chapter?",
          "What words of encouragement would you offer your future self during difficult moments?",
        ],
        sampleOpening: "Dear Future Me, I'm writing this on what feels like Day One of a new life. Something has shifted inside me, and I'm ready to make real changes. I know the road ahead won't be easy, but right now I feel clear and determined. Here's what I want you to remember about this moment and why it matters...",
        howToSteps: [
          { name: "Capture the catalyst clearly", text: "Write about what brought you to this decision to start fresh. Whether it was a specific event, a gradual realization, or a sudden insight, document it in detail. This 'origin story' will be meaningful later." },
          { name: "Define what you're leaving behind", text: "Be specific about the patterns, behaviors, relationships, or circumstances you're choosing to change. Naming what you're releasing gives power to your intention to move forward." },
          { name: "Articulate your vision for the future", text: "Describe in detail who you want to become and what you want your life to look like. Use present tense as if you're already living this new reality - 'I am someone who...' This technique is backed by research on identity-based behavior change." },
          { name: "Acknowledge the challenges ahead", text: "Write honestly about the obstacles you expect to face. Research shows that mental contrasting - holding both positive goals and realistic obstacles in mind - increases goal attainment compared to pure positive thinking." },
          { name: "Include self-compassion for setbacks", text: "Write kind words to your future self for when they inevitably struggle. Remind them that transformation is not linear and that each setback is information, not failure." },
          { name: "Choose a strategic delivery date", text: "Schedule the letter for 3-6 months out - long enough to see real change, but not so far that the connection to this moment has faded. You can write multiple letters for different milestones." },
        ],
      },
      tr: {
        title: "Yeni Baslangic Mektup Sablonu",
        description: "Yasaminizda yeni bir bolumin umudunu ve kararlilgini yakalayin. Yeniden icat niyetlerinizi belgeleyin ve kisisel donusum yolculugunuz icin bir denektasi olusturun.",
        seoTitle: "Yeni Baslangic Mektup Sablonu | Yasamin Yeni Bolum Rehberi",
        seoDescription: "Yeni bir baslangic yaparken gelecekteki kendinize bir mektup yazin. Donusturucu sablonumuzla degisim ve kisisel yeniden icat niyetlerinizi yakalayin.",
        content: [
          "Yeni bir baslangic yapmak, insanligin en guclu deneyimlerinden biridir - bir bolumu kapatmaya ve niyet ve umutla baska bir bolumu acmaya karar verdiginiz an. Onemli bir yasam olayinin, kisisel bir farkindaligin veya sadece degisiklik gerektigi farkindaliginin tetikledigi bu donum noktalari onurlandirilmayi ve belgelenmeyi hak eder.",
          "Dr. Hengchen Dai'nin UCLA'daki 'zamansal simge isaretler' arastirmasi, algilanan taze baslangıclarin - Yilbasi Gunu, dogum gunu veya kisisel olarak anlamli herhangi bir an - degisiklik icin dogal motivasyon yarattigini gostermektedir. Bu zamansal simge isaretler, psikolojik olarak gecmis benliklerimizden ayrilmamiza ve yeni davranislara daha tam olarak baglanmamiza yardimci olur.",
          "Yeni bir baslangic arzusu genellikle su anla memnuniyetsizlik ve gelecege umutun karmasik bir karisimindan ortaya cikar. Dr. Timothy Wilson'in 'duygusal tahmin' arastirmasi, buyuk degisikliklerden sonra nasil hissedecegimizi tahmin etmekte zorlandigimizi ortaya koymaktadir.",
          "Yeni baslangiclar cesaret gerektirir - bir seyin degismesi gerektigini kabul etme istekliligi ve bu konuda bir seyler yapma kararliligi. Ayrica oz-sefkat gerektirir, cunku niyetten kalici degisime giden yol nadiren dogrusaldir.",
          "Sizi yeni bir baslangic isteme anina neyin getirdigini dusunun. Degismis bir dis kosul mu yoksa degerler ve onceli klerde ic bir kayma mi? Taze baslanginicinizin arkasindaki 'neden'i anlamak, ilk cosku soldugundan ve degisimin zor isi basladiginda motivasyonunuzu surdurmey e yardimci olacaktir.",
          "Bircok donusumsel yolculuk, orijinal motivasyonumuzun yogunlugunu unuttuğumuz icin ivme kaybeder. Mevcut zihniyetinizi belgeleyerek - eski yoldan hayal kirikliklari, yeniye yonelik vizyon - zorlu anlarda 'neden'inizle yeniden baglanti kurmaniz icin bir kaynak olusturursunuz.",
        ],
        guidingQuestions: [
          "Sizi yeni bir baslangic isteme anina ne getirdi? Degisimin katalizoru neydi?",
          "Yasaminizin veya kendinizin hangi yonlerini donusturmeye calisiyorsunuz ve neden?",
          "Bilinçli olarak hangi kaliplari, aliskanliklari veya var olma yollarini geride birakmay i seciyorsunuz?",
          "Bu taze baslangic sayesinde kim olmak istiyorsunuz? Hangi nitelikleri gelistirmek istiyorsunuz?",
          "Bu degisikligi surdurmek icin hangi destek sistemlerine veya kaynaklara ihtiyaciniz olacak?",
          "Hangi engelleri ongoruyorsunuz ve bunlarla nasil basa cikmayi planliyorsunuz?",
          "Bu yeni bolumde ilerlemeyi ve basariyi nasil olceceksiniz?",
          "Zor anlarda gelecekteki kendinize hangi cesaret sozleri sunarsınız?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, bunu yeni bir yasamin Birinci Gunu gibi hissettiren bir anda yaziyorum. Icimde bir seyler degisti ve gercek degisiklikler yapmaya hazirim. Ilerideki yolun kolay olmayacagini biliyorum, ama su anda net ve kararli hissediyorum...",
        howToSteps: [
          { name: "Katalizoru acikca yakalayin", text: "Sizi yeni bir baslangic kararına neyin getirdigini yazin. Belirli bir olay, kademeli bir farkindalilik veya ani bir icgoru olsun, ayrintili olarak belgeleyin." },
          { name: "Geride biraktiklarinizi tanimlayin", text: "Degistirmeyi sectiginiz kaliplar, davranislar, iliskiler veya kosullar hakkinda spesifik olun. Biraktiklarinizi adlandirmak ileri gitme niyetinize guc verir." },
          { name: "Gelecek vizyonunuzu ifade edin", text: "Kim olmak istediginizi ve yasaminizin nasil gorunmesini istediginizi ayrintili olarak tanimlayin. Bu yeni gercekligi zaten yasiyormusunuz gibi simdiki zaman kullanin - 'Ben ...olan birisiyim'." },
          { name: "Ileriki zorluklari kabul edin", text: "Karsilasmay i beklediginiz engeller hakkinda durustce yazin. Arastirmalar, zihinsel karsitlastirmanin - hem olumlu hedefleri hem de gercekci engelleri akilda tutmanin - saf pozitif dusunceye kiyasla hedef elde etmeyi artirdigini gostermektedir." },
          { name: "Gerilemeler icin oz-sefkat ekleyin", text: "Gelecekteki benliginiz kacinilmaz olarak mucadele ettiginde nazik sozler yazin. Onlara donusumun dogrusal olmadigini ve her gerilemenin basarisizlik degil bilgi oldugunu hatirlatin." },
          { name: "Stratejik bir teslimat tarihi secin", text: "Mektubu 3-6 ay sonrasina planlayin - gercek degisikligi gormek icin yeterince uzun, ancak bu ana baglantinin solmasina yetecek kadar uzak degil." },
        ],
      },
      estimatedTime: "35-45 min",
      category: "life-transitions",
    },
  },
  "milestones": {
    "birthday-letter": {
      en: {
        title: "Birthday Letter to Your Future Self Template",
        description: "Mark another year of life with a meaningful letter to your future self. Capture your birthday reflections, wisdom gained, and hopes for the year ahead.",
        seoTitle: "Birthday Letter Template | Write to Your Future Self",
        seoDescription: "Write a birthday letter to your future self. Document your reflections, celebrate growth, and set intentions for the year ahead with our guided template.",
        content: [
          "Birthdays offer a natural moment for reflection and renewal - a personal new year that invites us to take stock of our journey and look ahead with intention. Writing a birthday letter to your future self transforms this annual milestone into a powerful practice of self-connection and growth. Unlike resolutions that fade by February, a birthday letter creates an intimate conversation between your present and future self.",
          "Research in developmental psychology shows that marking life transitions strengthens our sense of identity continuity. Dr. Dan McAdams' work on narrative identity reveals that how we story our lives - including how we frame milestones like birthdays - shapes our psychological well-being and sense of purpose. A birthday letter becomes a chapter in your ongoing life narrative.",
          "The practice of birthday reflection has deep cultural roots. Many traditions include rituals of taking stock at one's birthday - from the Jewish practice of personal accounting during one's birthday month to secular birthday journaling. These practices recognize that the anniversary of our birth is not just a celebration but an opportunity for meaningful pause.",
          "When you receive your birthday letter on your next birthday, you'll have a gift from your past self waiting alongside any presents from loved ones. This letter becomes a bridge connecting birthdays, allowing you to see your growth over time and maintain continuity with who you were. Many practitioners find this to be their most anticipated birthday tradition.",
          "Writing on your birthday also captures you at a unique emotional moment. Birthdays often bring a complex mix of gratitude, reflection, sometimes melancholy about time passing, and hope for what's ahead. Documenting these authentic feelings creates an emotional snapshot that pure memory cannot preserve.",
          "Consider making the birthday letter a ritual: write it at the same time each year - perhaps the morning of your birthday or the evening before. Create a comfortable setting, perhaps with a birthday treat, and give yourself the gift of unhurried reflection. This annual practice compounds in value as the years pass.",
          "Psychological research on temporal self-continuity reveals that connecting with our future self improves decision-making and well-being. Studies by Dr. Hal Hershfield at UCLA show that people who feel connected to their future self make better long-term choices and report greater life satisfaction. A birthday letter strengthens this connection by creating a tangible dialogue between your present and future self, making your future self feel more real and worthy of consideration in today's decisions.",
          "The act of writing itself offers therapeutic benefits beyond the content captured. James Pennebaker's decades of research on expressive writing demonstrates that putting experiences and emotions into words activates different neural pathways than simply thinking about them. Writing about your birthday reflections helps you process the passage of time, integrate experiences into your life story, and find meaning in both achievements and struggles. This cognitive and emotional processing contributes to better mental health and increased psychological resilience.",
        ],
        guidingQuestions: [
          "What are you most proud of accomplishing in the past year of your life?",
          "What challenges have you faced, and what have they taught you about yourself?",
          "How have you grown as a person since your last birthday?",
          "What are you grateful for right now in your life - people, experiences, opportunities?",
          "What do you hope your next year will bring? What intentions are you setting?",
          "What wisdom have you gained this year that you want to carry forward?",
          "What small joys and everyday pleasures are making your life rich right now?",
          "What would you tell yourself one year from now about who you are today?",
        ],
        sampleOpening: "Dear Future Me, Happy Birthday to you! As I sit here on my [age] birthday, I'm taking a moment to reflect on this past year and to send you a message across time. One year from now, when you read this, I hope you'll remember how far you've come and appreciate the journey that brought you there...",
        howToSteps: [
          { name: "Create a birthday ritual space", text: "Set aside time on or near your birthday in a comfortable, meaningful setting. Consider having a birthday treat and creating an atmosphere that feels celebratory yet reflective." },
          { name: "Review your year of life", text: "Look back at photos, calendar entries, and memories from the past year. Notice the major events but also the small moments that made up your days." },
          { name: "Reflect on growth and learning", text: "Consider how you've changed since your last birthday. What new skills, insights, or strengths have you developed? What challenges shaped you?" },
          { name: "Express gratitude authentically", text: "Write about the people, experiences, and circumstances you're grateful for. Be specific - future you will appreciate these details when memory fades." },
          { name: "Set intentions for your new year", text: "Share your hopes, dreams, and intentions for the year ahead. What do you want to cultivate, achieve, or become by your next birthday?" },
          { name: "Schedule delivery for next birthday", text: "Set the delivery date for exactly one year from now - your next birthday. This creates a beautiful tradition of receiving a birthday letter from your past self." },
        ],
      },
      tr: {
        title: "Gelecekteki Kendine Dogum Gunu Mektubu Sablonu",
        description: "Hayatinizin bir yilini daha gelecekteki kendinize anlamli bir mektupla isretleyin. Dogum gunu dusuncelerinizi, kazandiginiz bilgeligi ve onumuzdeki yil icin umutlarinizi yakalay in.",
        seoTitle: "Dogum Gunu Mektubu Sablonu | Gelecekteki Kendine Yaz",
        seoDescription: "Gelecekteki kendinize bir dogum gunu mektubu yazin. Rehberli sablonumuzla dusuncelerinizi belgeleyin ve buyumenizi kutlayin.",
        content: [
          "Dogum gunleri, dusunce ve yenilenme icin dogal bir an sunar - yolculugumuzun muhasebesini yapmaya ve niyetle ileriye bakmaya davet eden kisisel bir yeni yil. Gelecekteki kendinize bir dogum gunu mektubu yazmak, bu yillik kilometre tasini oz-baglanti ve buyumenin guclu bir uygulamasina donusturur.",
          "Gelisimsel psikoloji arastirmalari, yasam gecislerini isrretlemenin kimlik surekliligimizi guclendigini gostermektedir. Dr. Dan McAdams'in anlatı kimliği uzerine calısması, yaslarımızı nasil hikaye haline getirdigimizin - dogum gunleri gibi kilometre taslarini nasil cerceveledigimiz dahil - psikolojik iyiligimizi ve amac duygumuzu sekillendirdigini ortaya koymaktadir.",
          "Dogum gunu dusuncesi pratiğinin derin kulturel kokleri vardir. Bircok gelenek, dogum gununde muhasebe rituelleri icerir - dogum gunu ayinda kisisel muhasebe yapma Yahudi pratiğinden laik dogum gunu gunlugu tutmaya kadar. Bu pratikler, dogumumuzun yildonumunun sadece bir kutlama degil, anlamli bir duraklama firsati oldugunu kabul eder.",
          "Bir sonraki dogum gununuzde dogum gunu mektubunuzu aldiginizda, sevdiklerinizden gelen hedyelerin yaninda gecmiş benliginizden bir hediye bekliyor olacak. Bu mektup, dogum gunlerini birbirine baglayan bir kopru haline gelir ve zaman icinde buyumenizi gormenizi ve kim oldugunuzla sureklilik saglamanizi saglar.",
          "Dogum gununuzde yazmak sizi benzersiz bir duygusal anda da yakalar. Dogum gunleri genellikle karmasik bir sukran, dusunce, bazen zamanin gecmesiyle ilgili huzun ve ileride ne olduguna dair umut karisimi getirir. Bu otantik duyguları belgelemek, saf hafizanin koruyamayacagi bir duygusal anlık goruntu olusturur.",
          "Dogum gunu mektubunu bir rituel haline getirmeyi dusunun: her yil ayni zamanda yazin - belki dogum gununuzun sabahi veya bir onceki aksam. Belki bir dogum gunu ikramiyla rahat bir ortam olusturun ve kendinize acelese olmayan dusunce hediyesi verin.",
        ],
        guidingQuestions: [
          "Gecen yil hayatinizda basardiginiz seylerden en cok neyle gurur duyuyorsunuz?",
          "Hangi zorluklarla karsilastiniz ve size kendiniz hakkinda ne ogrettiler?",
          "Son dogum gununuzden bu yana bir birey olarak nasil buyudunuz?",
          "Su anda hayatinizda neye minnettar hissediyorsunuz - insanlar, deneyimler, firsatlar?",
          "Gelecek yilinizin ne getirmesini umuyorsunuz? Hangi niyetleri belirliyorsunuz?",
          "Bu yil ileri tasimak istediginiz hangi bilgeligi kazandiniz?",
          "Su anda hayatinizi zenginlestiren hangi kucuk sevinc ve gunluk zevkler var?",
          "Bugun kim oldugunuz hakkinda bir yil sonra kendinize ne soylerdiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, Dogum Gunun Kutlu Olsun! [yas] yasima girerken, gecen yili dusunmek ve zaman boyunca sana bir mesaj gondermek icin bir an duruyorum. Bundan bir yil sonra bunu okuduğunda, ne kadar ilerledigini hatirlamanı ve seni oraya getiren yolculuğu takdir etmeni umuyorum...",
        howToSteps: [
          { name: "Dogum gunu ritueli alani yaratin", text: "Dogum gununuzde veya yakininda rahat, anlamli bir ortamda zaman ayirin. Bir dogum gunu ikrami dusunun ve kutlayici ama dusunceli hissettiren bir atmosfer yaratin." },
          { name: "Yasam yilinizi gozden gecirin", text: "Gecen yildan fotograflara, takvim girislerine ve anilara bakin. Buyuk olaylari fark edin ama ayni zamanda gunlerinizi olusturan kucuk anlari da." },
          { name: "Buyume ve ogrenme uzerine dusunun", text: "Son dogum gununuzden bu yana nasil degistiginizi dusunun. Hangi yeni beceriler, icgoruler veya gucler gelistirdiniz? Hangi zorluklar sizi sekillendirdi?" },
          { name: "Sukrani otantik bir sekilde ifade edin", text: "Minnettar oldugunuz insanlar, deneyimler ve kosullar hakkinda yazin. Spesifik olun - gelecekteki siz hafiza solduğunda bu detaylari takdir edecektir." },
          { name: "Yeni yiliniz icin niyetler belirleyin", text: "Onumuzdeki yil icin umutlarinizi, hayallerinizi ve niyetlerinizi paylasin. Bir sonraki dogum gununuze kadar ne gelistirmek, basarmak veya olmak istiyorsunuz?" },
          { name: "Bir sonraki dogum gunu icin teslimat planlyin", text: "Teslimat tarihini tam olarak bir yil sonraya - bir sonraki dogum gununuze ayarlayin. Bu, gecmis benliginizden bir dogum gunu mektubu alma gelenegi olusturur." },
        ],
      },
      estimatedTime: "30-45 min",
      category: "milestones",
    },
    "anniversary": {
      en: {
        title: "Anniversary Letter to Your Future Self Template",
        description: "Commemorate meaningful anniversaries by writing to your future self. Capture the significance of this milestone and preserve precious memories for years to come.",
        seoTitle: "Anniversary Letter Template | Preserve Your Milestone Memories",
        seoDescription: "Write an anniversary letter to your future self. Document the meaning of this milestone and preserve memories for the future with our guided template.",
        content: [
          "Anniversaries mark the passage of meaningful time - whether celebrating a relationship, career milestone, personal achievement, or the memory of a significant event. Writing an anniversary letter to your future self transforms this recurring date into an ongoing conversation with yourself across time. Each anniversary becomes a waypoint in your life's journey, documented and preserved.",
          "Research in autobiographical memory shows that anniversary reactions are a real psychological phenomenon. Our minds naturally return to significant dates, bringing back emotions and memories associated with those times. By writing on anniversaries, you harness this natural tendency and create intentional markers that your future self can revisit.",
          "The practice of anniversary reflection is found across cultures and throughout history. From wedding anniversaries to commemorating the founding of organizations, humans have always recognized the power of returning to significant dates. This template helps you create your own personal anniversary tradition, whatever the occasion you're marking.",
          "Anniversary letters serve multiple purposes: they preserve the feelings and perspectives of the present moment, they create a continuous record that shows evolution over time, and they give your future self a gift of connection to past versions of yourself. Reading anniversary letters from previous years can be profoundly moving and insightful.",
          "Whether you're marking a joyful anniversary like a wedding or the founding of a business, or a bittersweet one like the anniversary of a loss, writing creates space for authentic processing. The act of putting feelings into words helps us make meaning of our experiences, which psychologists identify as essential to psychological well-being.",
          "Consider starting an anniversary letter tradition for any date that holds meaning for you. The beauty of this practice is that it grows richer each year as your collection of letters expands. Future you will have access to a personal archive of how you've grown, changed, and remained constant through the years.",
          "Neuroscience research on memory consolidation shows that writing about significant events strengthens our ability to recall and make sense of them. When we write about anniversaries, we engage in active memory reconstruction that helps preserve important details while also allowing us to reframe experiences with new understanding. This process is particularly valuable for relationship anniversaries, where documenting your evolving perspective year after year creates a rich tapestry of how love and commitment deepen over time.",
          "The ritual of anniversary reflection also serves as a powerful anchor point during life's inevitable changes and challenges. Clinical psychologist Dr. Susan David's research on emotional agility demonstrates that regular reflection practices help people navigate difficult transitions with greater resilience. An anniversary letter tradition creates structured moments for processing change, celebrating continuity, and reconnecting with your core values. Whether marking joyful milestones or commemorating losses, the practice helps you metabolize experience and maintain psychological equilibrium across the years.",
          "The compound benefit of anniversary letter writing becomes apparent over time. Each year's letter adds another layer to your understanding of how the original event has shaped you. After five or ten years, reading through your collection offers insights that no single reflection could provide - you'll see themes you couldn't have noticed in isolation, growth you might have underestimated, and continuities that reveal your deepest values.",
        ],
        guidingQuestions: [
          "What does this anniversary mean to you, and why is it significant in your life?",
          "How have you changed since the event this anniversary commemorates?",
          "What memories from the original event or from intervening years do you want to preserve?",
          "What gratitude do you feel when you reflect on what this anniversary represents?",
          "What have you learned or gained since the original event that you want to acknowledge?",
          "What hopes do you have for the next year or the next milestone anniversary?",
          "Who are the people connected to this anniversary, and what do they mean to you?",
          "What would you want your future self to remember about how you feel right now?",
        ],
        sampleOpening: "Dear Future Me, Today marks [number] year(s) since [event], and I wanted to capture this moment in time for you. As I reflect on what this anniversary means to me, I'm filled with [emotions]. So much has happened since then, and yet some things remain beautifully unchanged...",
        howToSteps: [
          { name: "Choose your anniversary intentionally", text: "Identify the anniversary you're marking - a relationship, achievement, memorial, or other significant date. Acknowledge why this date matters to you." },
          { name: "Create a reflective atmosphere", text: "Find a quiet space where you can reflect deeply. You might look at photos, mementos, or other items connected to what you're commemorating." },
          { name: "Recall the original event", text: "Write about the event this anniversary marks - what happened, how you felt, who was there. Preserve details that memory might blur over time." },
          { name: "Reflect on the journey since", text: "Consider how you've grown, what you've learned, and how your relationship to this event has evolved since it occurred." },
          { name: "Express current emotions authentically", text: "Document how you feel right now about this anniversary - whether joyful, grateful, bittersweet, or complex. Authenticity creates the most valuable letters." },
          { name: "Set delivery for next anniversary", text: "Schedule your letter to arrive on the next anniversary - whether next year or at a future milestone. Create an ongoing tradition of anniversary reflection." },
        ],
      },
      tr: {
        title: "Gelecekteki Kendine Yildonumu Mektubu Sablonu",
        description: "Gelecekteki kendinize yazarak anlamli yildonumlerini kutlayin. Bu kilometre tasinin onemini yakalay in ve degerli anilari gelecek yillar icin koruyun.",
        seoTitle: "Yildonumu Mektubu Sablonu | Kilometre Tasi Anilarinizi Koruyun",
        seoDescription: "Gelecekteki kendinize bir yildonumu mektubu yazin. Rehberli sablonumuzla bu kilometre tasinin anlamini belgeleyin ve anilari gelecek icin koruyun.",
        content: [
          "Yildonumleri anlamli zamanin gecisini isretler - bir iliski, kariyer kilometre tasi, kisisel basari veya onemli bir olayin anisini kutluyor olun. Gelecekteki kendinize bir yildonumu mektubu yazmak, bu yinelenen tarihi zaman boyunca kendinizle devam eden bir konusmaya donusturur. Her yildonumu, yasam yolculugunuzda belgelenmis ve korunmus bir ara nokta haline gelir.",
          "Otobiyografik hafiza arastirmalari, yildonumu tepkilerinin gercek bir psikolojik fenomen oldugunu gostermektedir. Zihinlerimiz dogal olarak onemli tarihlere doner, o zamanlarla iliskili duyguları ve anilari geri getirir. Yildonumlerinde yazarak, bu dogal egilimden yararlanir ve gelecekteki benliginizin yeniden ziyaret edebilecegi kasitli isaretler yaratirsiniz.",
          "Yildonumu dusuncesi pratiği kulturler arasi ve tarih boyunca bulunur. Evlilik yildonumlerinden kuruluslarin kurulusunu anmaya kadar, insanlar her zaman onemli tarihlere donmenin gucunu kabul etmistir. Bu sablon, isretlediginiz vesile ne olursa olsun kendi kisisel yildonumu geleneginizi olusturmaniza yardimci olur.",
          "Yildonumu mektuplari birden fazla amaca hizmet eder: su anki duyguları ve bakis acilarini korurlar, zamanla evrimi gosteren surekli bir kayit olustururlar ve gelecekteki benliginize gecmis versiyonlariniza baglanti hediyesi verirler. Onceki yillardan yildonumu mektuplarini okumak derinden etkileyici ve aydınlatıcı olabilir.",
          "Evlilik veya bir isletmenin kurulusu gibi mutlu bir yildonumunu veya bir kaybin yildonumu gibi buruk bir yildonumunu isretliyor olun, yazmak otantik isleme icin alan yaratir. Duyguları kelimelere dokme eylemi, deneyimlerimizden anlam cikarmamiza yardimci olur, bu da psikologların psikolojik refah icin temel olarak tanimladigi bir seydir.",
          "Sizin icin anlam tasiyan herhangi bir tarih icin bir yildonumu mektubu gelenegi baslatmayi dusunun. Bu pratiğin guzelliği, mektup koleksiyonunuz genisladikce her yil daha zengin buyumesidir. Gelecekteki siz, yillar boyunca nasil buyudugunuzun, degistiginizin ve sabit kaldiginizin kisisel arsivine erisebilecektir.",
        ],
        guidingQuestions: [
          "Bu yildonumu sizin icin ne anlama geliyor ve hayatinizda neden onemli?",
          "Bu yildonumunun anisina oldugu olaydan bu yana nasil degistiniz?",
          "Orijinal olaydan veya aradan gecen yillardan hangi anilari korumak istiyorsunuz?",
          "Bu yildonumunun temsil ettigini dusunduguzde nasil bir sukran hissediyorsunuz?",
          "Orijinal olaydan bu yana kabul etmek istediginiz ne ogrendiniz veya kazandiniz?",
          "Gelecek yil veya bir sonraki kilometre tasi yildonumu icin ne umutlariniz var?",
          "Bu yildonumuyle baglantili insanlar kimler ve sizin icin ne anlam ifade ediyorlar?",
          "Gelecekteki benliginizin su anda nasil hissettiginizi hatirlamasini istersiniz?",
        ],
        sampleOpening: "Sevgili Gelecekteki Ben, Bugun [olay]dan bu yana [sayi] yil(lar)i isretliyor ve bu ani zaman icinde senin icin yakalamak istedim. Bu yildonumunun benim icin ne anlama geldigini dusundugumde, [duygular] ile doluyum. O zamandan beri cok sey oldu, ama yine de bazi seyler guzel bir sekilde degismeden kaldi...",
        howToSteps: [
          { name: "Yildonumunuzu kasitli secin", text: "Isretlediginiz yildonumunu belirleyin - bir iliski, basari, anma veya diger onemli bir tarih. Bu tarihin sizin icin neden onemli oldugunu kabul edin." },
          { name: "Dusunceli bir atmosfer yaratin", text: "Derinden dusunebileceginiz sessiz bir alan bulun. Andiginiz seyle baglantili fotograflara, hatiralara veya diger esyalara bakabilirsiniz." },
          { name: "Orijinal olayi hatirlyin", text: "Bu yildonumunun isretledigi olay hakkinda yazin - ne oldu, nasil hissettiniz, kim oradaydi. Hafizanin zamanla bulaniklastirabileceği detaylari koruyun." },
          { name: "O zamandan beri yolculuğu dusunun", text: "Nasil buyudugunuzu, ne ogrendiginizi ve bu olayla iliskinizin meydana geldiginden bu yana nasil gelisdigini dusunun." },
          { name: "Mevcut duyguları otantik olarak ifade edin", text: "Bu yildonumu hakkinda su anda nasil hissettiginizi belgeleyin - mutlu, minnettar, buruk veya karmasik. Otantiklik en degerli mektuplari olusturur." },
          { name: "Bir sonraki yildonumu icin teslimat ayarlayin", text: "Mektubunuzu bir sonraki yildonumune - ister gelecek yil ister gelecekteki bir kilometre tasina ulasmasi icin planlayin. Devam eden bir yildonumu dusuncesi gelenegi olusturun." },
        ],
      },
      estimatedTime: "30-45 min",
      category: "milestones",
    },
  },
  "legacy": {
    "letter-to-future-child": {
      en: {
        title: "Letter to Your Future Child Template",
        description: "Write a heartfelt letter to your future or growing child. Share wisdom, hopes, and love that will become a treasured keepsake as they journey through life.",
        seoTitle: "Letter to Your Future Child Template | Legacy Letters",
        seoDescription: "Write a meaningful letter to your future child. Share your wisdom, hopes, and unconditional love with our guided template for creating lasting family treasures.",
        content: [
          "Writing a letter to your future child is one of the most profound acts of love and legacy you can perform. Whether your child is not yet born, still young, or preparing to reach a milestone, these letters become time capsules of your heart. Research in developmental psychology shows that children who receive written expressions of parental love develop stronger attachment security and higher self-esteem throughout their lives.",
          "The tradition of parents writing letters to their children spans cultures and centuries. From ancient letters discovered in archaeological sites to the famous letters of historical figures to their descendants, this practice connects us to a timeless human impulse: the desire to transmit wisdom, values, and love across time. Modern studies on intergenerational communication confirm that written messages carry unique emotional weight that verbal communication cannot replicate.",
          "Unlike spoken words that fade from memory, a letter becomes a permanent artifact your child can return to throughout their life. During moments of doubt, they can read your words of encouragement. During life transitions, they can access your wisdom. During times of grief, they can feel your presence through your handwriting or carefully chosen words. This permanence transforms a simple letter into a lifelong companion.",
          "Psychologist Dr. Dan Siegel's research on narrative integration shows that when children understand their family story and their place in it, they develop stronger identity formation and emotional resilience. Your letter contributes to this narrative, helping your child understand who they are, where they came from, and the love that surrounds their existence. These letters become threads in the fabric of family history.",
          "The process of writing this letter also benefits you as the parent. It requires you to articulate your deepest hopes, distill your life lessons, and express love that might otherwise remain unspoken. Many parents report that writing these letters helps them clarify their own values and parenting intentions. The act of putting these thoughts on paper creates clarity and purpose that enhances your daily parenting.",
          "Consider writing letters at different stages of your child's life or your own journey. A letter written when they are a newborn captures different wisdom than one written as they graduate high school. Building a collection of these letters over time creates a rich tapestry of your relationship, documenting not just your love but its evolution through the seasons of life together.",
          "Research from the field of positive psychology demonstrates that expressing love in written form creates neurological benefits for both writer and reader. When you articulate your deepest feelings on paper, you engage different brain regions than during verbal expression, leading to deeper emotional processing and memory consolidation. For your child, receiving and re-reading these letters activates neural pathways associated with security and belonging, reinforcing their sense of being valued. This neurological foundation becomes particularly protective during adolescence and young adulthood when identity formation challenges can create self-doubt. Your written words become an anchor point they can return to whenever they need reminding of their inherent worth.",
        ],
        guidingQuestions: [
          "What do you want your child to know about the love you felt when you first held them or imagined them?",
          "What life lessons have you learned that you most want to pass on to them?",
          "What hopes and dreams do you hold for their future, while honoring their autonomy to choose their own path?",
          "What family history, traditions, or values do you want them to understand and carry forward?",
          "What challenges have you overcome that might help them when they face their own struggles?",
          "What do you want them to know about their other family members and their place in the family story?",
          "What brings you joy about who they are, and what do you see as their unique gifts?",
          "What would you want them to remember if you could not be there to tell them in person?",
        ],
        sampleOpening: "My dearest child, as I write this letter, my heart overflows with more love than I ever knew was possible. Whether you are reading this as a young person or many years from now as an adult, I want you to know that from the moment I knew you would be part of my life, everything changed for the better...",
        howToSteps: [
          { name: "Choose a meaningful moment", text: "Select a time when you can write without interruption - perhaps their birthday, a holiday, or a quiet evening. Let yourself be fully present with your love for your child as you write." },
          { name: "Begin with your heart", text: "Start by expressing the love you feel. Don't worry about being eloquent - authenticity matters more than perfect prose. Write as if you are speaking directly to your child's heart." },
          { name: "Share your wisdom gently", text: "Offer life lessons you have learned, but frame them as gifts rather than commands. Your child will be more receptive to wisdom shared with humility and openness." },
          { name: "Include specific memories and details", text: "Reference particular moments, characteristics, or stories that make this letter uniquely theirs. Generic advice is less powerful than personalized observations and memories." },
          { name: "Express unconditional acceptance", text: "Make clear that your love is not contingent on achievements, choices, or outcomes. Let them know they are loved simply for existing, exactly as they are." },
          { name: "Choose the right delivery moment", text: "Decide when your child should receive this letter - a specific birthday, graduation, wedding, or life milestone. Schedule delivery accordingly to maximize its emotional impact." },
        ],
      },
      tr: {
        title: "Gelecekteki Cocugunuza Mektup Sablonu",
        description: "Gelecekteki veya buyuyen cocugunuza icten bir mektup yazin. Yasam yolculugunda degerli bir hatira olacak bilgelik, umutlar ve sevgi paylasin.",
        seoTitle: "Gelecekteki Cocugunuza Mektup Sablonu | Miras Mektuplari",
        seoDescription: "Gelecekteki cocugunuza anlamli bir mektup yazin. Rehberli sablonumuzla kalici aile hazineleri olusturmak icin bilgeliginizi ve sevginizi paylasin.",
        content: [
          "Gelecekteki cocugunuza mektup yazmak, gerceklestirebileceginiz en derin sevgi ve miras eylemlerinden biridir. Cocugunuz henuz dogmamis olsun, hala kucuk olsun veya bir kilometre tasina ulasmaya hazirlaniyor olsun, bu mektuplar kalbinizin zaman kapsulleri haline gelir. Gelisim psikolojisi arastirmalari, ebeveyn sevgisinin yazili ifadelerini alan cocuklarin yasam boyu daha guclu baglanma guvenligi ve daha yuksek oz-saygi gelistirdigini gostermektedir.",
          "Ebeveynlerin cocuklarina mektup yazma gelenegi kulturleri ve yuzyillari kapsar. Arkeolojik alanlarda bulunan antik mektuplardan tarihi sahsiyetlerin torunlarina yazdigi unlu mektuplara kadar, bu uygulama bizi zamansiz bir insani durtuge baglar: bilgeligi, degerleri ve sevgiyi zaman boyunca iletme arzusu. Kusaklararasi iletisim uzerine modern calismalar, yazili mesajlarin sozlu iletisimin tekrarlayamayacagi benzersiz duygusal agirlik tasidigini dogrulamaktadir.",
          "Hafizadan silinip giden konusma sozcuklerinin aksine, bir mektup cocugunuzun yasami boyunca geri donebilecegi kalici bir eser haline gelir. Suphe anlarinda cesaretlendirici sozlerinizi okuyabilirler. Yasam gecislerinde bilgeliginize ulasabilirler. Yas zamanlarinda el yaziniz veya ozenle secilmis sozleriniz araciligiyla varliginizi hissedebilirler.",
          "Psikolog Dr. Dan Siegel'in anlatim entegrasyonu uzerine arastirmasi, aile hikayelerini ve icindeki yerlerini anlayan cocuklarin daha guclu kimlik olusumu ve duygusal dayaniklilik gelistirdigini gostermektedir. Mektubunuz bu anlatiya katki saglar, cocugunuzun kim olduklarini, nereden geldiklerini ve varliklarini cevreleyen sevgiyi anlamalarina yardimci olur.",
          "Bu mektubu yazma sureci ayni zamanda ebeveyn olarak size de fayda saglar. En derin umutlarinizi ifade etmenizi, yasam derslerinizi damitmanizi ve aksi takdirde soylenmeden kalabilecek sevgiyi ifade etmenizi gerektirir. Bircok ebeveyn, bu mektuplari yazmanin kendi degerlerini ve ebeveynlik niyetlerini netlestirmelerine yardimci oldugunu bildirmektedir.",
          "Cocugunuzun yasamininin farkli asamalarinda veya kendi yolculugunuzda mektuplar yazmayi dusunun. Yeni dogan olduklarinda yazilan bir mektup, liseyi bitirirken yazilandan farkli bilgelik yakalar. Zamanla bu mektuplardan bir koleksiyon olusturmak, sadece sevginizi degil, birlikte gecirilen yasam mevsimlerindeki evrimini de belgeleyen zengin bir hali dokur.",
        ],
        guidingQuestions: [
          "Onlari ilk kucakladiginizda veya hayal ettiginizde hissettiginiz sevgi hakkinda cocugunuzun ne bilmesini istiyorsunuz?",
          "Onlara en cok aktarmak istediginiz hangi yasam derslerini ogrendiniz?",
          "Kendi yollarini secme ozerkliklerini onurlandirirken, gelecekleri icin hangi umutlari ve hayalleri tasiyorsunuz?",
          "Hangi aile tarihini, geleneklerini veya degerlerini anlamalari ve ileriye tasimalari gerektigini dusunuyorsunuz?",
          "Kendi mucadeleleriyle karsilastiklarinda onlara yardimci olabilecek hangi zorluklarin ustesinden geldiniz?",
          "Diger aile uyeleri ve aile hikayesindeki yerleri hakkinda ne bilmelerini istiyorsunuz?",
          "Kim olduklari hakkinda sizi ne mutlu ediyor ve benzersiz yetenekleri olarak ne goruyorsunuz?",
          "Onlara bizzat soyleyemeyeceginiz durumda ne hatirlamalarini isterdiniz?",
        ],
        sampleOpening: "En sevgili cocugum, bu mektubu yazarken, kalbim daha once mumkun oldugunu bilmedigim kadar cok sevgiyle tasiyor. Bunu genc bir kisi olarak okurken veya bundan yillar sonra yetiskin olarak okurken, hayatimin bir parcasi olacaginizi bildigim andan itibaren her seyin daha iyiye dogru degistigini bilmeni istiyorum...",
        howToSteps: [
          { name: "Anlamli bir an secin", text: "Kesintisiz yazabileceginiz bir zaman secin - belki dogum gunleri, bir tatil veya sessiz bir aksam. Yazarken cocugunuza olan sevginizle tam olarak mevcut olun." },
          { name: "Kalbinizle baslayin", text: "Hissettiginiz sevgiyi ifade ederek baslayin. Belagat konusunda endiselenmeyin - ozgunluk mukemmel nesirden daha onemlidir. Dogrudan cocugunuzun kalbine konusuyormus gibi yazin." },
          { name: "Bilgeliginizi nazikce paylasin", text: "Ogrendiginiz yasam derslerini sunun, ancak bunlari emirler yerine hediyeler olarak cerceveleyin. Cocugunuz alcakgonulluluk ve aciklikla paylasilan bilgelige daha acik olacaktir." },
          { name: "Belirli anilar ve detaylar ekleyin", text: "Bu mektubu benzersiz bir sekilde onlara ait kilan belirli anlara, ozelliklere veya hikayelere atifta bulunun. Genel tavsiyeler, kisisellestirilmis gozlemler ve anilardan daha az gucludur." },
          { name: "Kosulsuz kabul ifade edin", text: "Sevginizin basarilara, secimlere veya sonuclara bagli olmadigini netlestirin. Sadece var olduklari icin, tam olarak olduklari gibi sevildiklerini bilmelerini saglayin." },
          { name: "Dogru teslimat anini secin", text: "Cocugunuzun bu mektubu ne zaman almasi gerektigine karar verin - belirli bir dogum gunu, mezuniyet, dugun veya yasam kilometre tasi. Duygusal etkisini en ust duzeye cikarmak icin teslimati buna gore planlayin." },
        ],
      },
      estimatedTime: "45-60 min",
      category: "legacy",
    },
    "ethical-will": {
      en: {
        title: "Ethical Will Letter Template Guide",
        description: "Create a lasting document of your values, beliefs, and life wisdom. Pass on your moral and spiritual legacy to future generations through this meaningful tradition.",
        seoTitle: "Ethical Will Letter Template | Share Your Values & Wisdom",
        seoDescription: "Write an ethical will to pass on your values, beliefs, and life wisdom to future generations. Create a meaningful legacy document with our guided template.",
        content: [
          "An ethical will is a written document that passes on your values, beliefs, life lessons, and blessings to future generations. Unlike a legal will that distributes material possessions, an ethical will distributes your intangible wealth: the wisdom you have accumulated, the values you hold dear, and the legacy of meaning you wish to leave behind. This ancient tradition, dating back thousands of years in various cultures, remains profoundly relevant today.",
          "The Jewish tradition of 'tzavaah' (ethical will) has been practiced for millennia, with examples found in the Hebrew Bible and throughout religious literature. Similar traditions exist across cultures - from the Native American practice of passing stories between generations to the Confucian emphasis on transmitting moral wisdom. Modern psychology recognizes this practice as a form of 'generativity' - Erikson's concept describing the human need to nurture and guide future generations.",
          "Research on legacy and meaning-making shows that people who engage in legacy work experience significant psychological benefits. Dr. Karl Pillemer's research at Cornell University found that reflecting on and sharing life wisdom increases life satisfaction and sense of purpose in those who write such documents. The process of distilling your life into lessons worth passing on creates clarity about what has truly mattered.",
          "Your ethical will can address multiple generations - your children, grandchildren, and descendants you may never meet. It becomes a thread connecting past, present, and future, helping your family understand not just what you believed, but why you believed it. Many families treat ethical wills as treasured heirlooms, reading them at gatherings and passing them down through generations alongside traditional wills.",
          "Unlike a legal will, which is typically written once and updated periodically, an ethical will can be a living document that evolves as you grow. Some people write them at major life transitions - becoming a parent, facing serious illness, reaching milestone ages, or experiencing profound life changes. Each version captures your wisdom at that moment, creating a record of your moral and spiritual evolution over time.",
          "The process of writing an ethical will often brings profound clarity about priorities and helps resolve unfinished emotional business. Many find themselves expressing gratitude, offering forgiveness, or finally articulating beliefs they had never put into words. This document becomes not just a gift for others, but a clarifying mirror for yourself, revealing what you truly value when you strip away the superficial.",
          "Studies in narrative therapy and life review interventions show that the act of constructing a coherent life narrative significantly improves psychological well-being and reduces end-of-life anxiety. Dr. James Pennebaker's extensive research on expressive writing demonstrates that putting meaningful life experiences into words helps people make sense of their journey, find patterns in seemingly random events, and extract wisdom from both triumphs and struggles. For older adults especially, writing an ethical will serves as a form of 'reminiscence therapy' - a evidence-based practice shown to enhance life satisfaction, reduce depression, and strengthen sense of identity. The recipients benefit from your wisdom, while you benefit from the profound self-knowledge that emerges when you distill a lifetime into its essential truths.",
        ],
        guidingQuestions: [
          "What are the core values and principles that have guided your life, and why did they become important to you?",
          "What life lessons have you learned through experience that you want to preserve for future generations?",
          "What beliefs about life, faith, relationships, or purpose do you want to transmit to those who follow?",
          "What are you most grateful for, and what role has gratitude played in your happiness?",
          "What mistakes have you made that taught you valuable lessons worth sharing?",
          "What hopes do you hold for your family and community in the generations to come?",
          "What traditions, stories, or family history do you want to ensure are not forgotten?",
          "What blessings or wishes do you want to offer to those who will read this after you are gone?",
        ],
        sampleOpening: "To my beloved family and all who come after me, I write this not to distribute my possessions, but to share something far more valuable: the wisdom, values, and beliefs that have shaped who I am. As I reflect on my life, I realize that the most important things I have to give cannot be counted or measured...",
        howToSteps: [
          { name: "Reflect on your life journey", text: "Before writing, spend time in quiet reflection about the arc of your life. Consider the defining moments, relationships, challenges, and insights that have shaped who you have become." },
          { name: "Identify your core values", text: "List the principles that have been most important to you. For each value, consider not just what it is, but why it matters and how you came to embrace it. Stories and examples make values memorable." },
          { name: "Distill your wisdom", text: "Consider what you have learned about love, work, relationships, faith, suffering, joy, and meaning. What would you tell a younger version of yourself? What do you wish you had known earlier?" },
          { name: "Express gratitude and forgiveness", text: "Include acknowledgment of those who have blessed your life. If appropriate, extend forgiveness or ask for it. These expressions often become the most treasured parts of ethical wills." },
          { name: "Write with authenticity", text: "Use your natural voice rather than trying to sound formal or philosophical. Your descendants want to hear you, not a polished performance. Include personal stories and specific examples." },
          { name: "Plan for sharing", text: "Decide how and when this document should be shared. Some families read ethical wills together, others share them after death. Consider writing multiple versions for different recipients or occasions." },
        ],
      },
      tr: {
        title: "Etik Vasiyet Mektup Sablonu",
        description: "Degerlerinizin, inanclarinizin ve yasam bilgeliginizin kalici bir belgesini olusturun. Bu anlamli gelenek araciligiyla ahlaki ve manevi mirasinizi gelecek nesillere aktarin.",
        seoTitle: "Etik Vasiyet Mektup Sablonu | Degerlerinizi ve Bilgeliginizi Paylasin",
        seoDescription: "Degerlerinizi, inanclarinizi ve yasam bilgeliginizi gelecek nesillere aktarmak icin etik bir vasiyet yazin. Rehberli sablonumuzla anlamli bir miras belgesi olusturun.",
        content: [
          "Etik vasiyet, degerlerinizi, inanclarinizi, yasam derslerinizi ve bereketlerinizi gelecek nesillere aktaran yazili bir belgedir. Maddi mallari dagitan yasal bir vasiyetten farkli olarak, etik vasiyet somut olmayan servetinizi dagitir: biriktirdiginiz bilgelik, deger verdiginiz degerler ve geride birakmak istediginiz anlam mirasi. Cesitli kulturlerde binlerce yil oncesine dayanan bu kadim gelenek, bugun de derinden gecerliligini korumaktadir.",
          "Yahudi 'tzavaah' (etik vasiyet) gelenegi binlerce yildir uygulanmaktadir ve ornekler Ibrani Incili'nde ve dini literatur boyunca bulunmaktadir. Benzer gelenekler kulturler arasinda mevcuttur - yerli Amerikan nesiller arasi hikaye aktarma uygulamasindan Konfucyuscu ahlaki bilgeligi iletme vurgusuna kadar. Modern psikoloji bu uygulamayi 'uretkenlilk' bicimi olarak tanir - Erikson'un gelecek nesilleri besleme ve yonlendirme insani ihtiyacini tanimlayan kavrami.",
          "Miras ve anlam yaratma uzerine arastirmalar, miras calismasi yapan kisilerin onemli psikolojik faydalar yasadigini gostermektedir. Dr. Karl Pillemer'in Cornell Universitesi'ndeki arastirmasi, yasam bilgeligini yansitma ve paylasmanin bu tur belgeler yazanlarda yasam memnuniyetini ve amac duygusunu artirdigini bulmaktadir.",
          "Etik vasiyetiniz birden fazla nesle hitap edebilir - cocuklariniz, torunlariniz ve hic tanisamayabileceginiz torunlar. Gecmisi, simdiyi ve gelecegi baglayan bir iplik haline gelir, ailenizin sadece neye indiginizi degil, neden indiginizi anlamasina yardimci olur. Bircok aile etik vasiyetleri degerli miras esyalari olarak gorur.",
          "Tipik olarak bir kez yazilip periyodik olarak guncellenen yasal vasiyetin aksine, etik vasiyet buyudukce gelisen yasayan bir belge olabilir. Bazi insanlar bunlari buyuk yasam gecislerinde yazarlar - ebeveyn olmak, ciddi hastalikla karsilasmak, kilometre tasi yaslarina ulasmak veya derin yasam degisiklikleri yasamak.",
          "Etik vasiyet yazma sureci genellikle oncelikler hakkinda derin netlik getirir ve bitmemis duygusal isleri cozmeye yardimci olur. Bircok kisi kendini minnettar ifade ederken, affetme sunarken veya sonunda hic kelimelerle ifade etmedikleri inanclari ifade ederken bulur. Bu belge sadece baskalari icin bir hediye degil, kendiniz icin de aydinlatici bir ayna haline gelir.",
        ],
        guidingQuestions: [
          "Yasaminiza rehberlik eden temel degerler ve ilkeler nelerdir ve neden sizin icin onemli hale geldiler?",
          "Gelecek nesiller icin korumak istediginiz deneyim yoluyla hangi yasam derslerini ogrendiniz?",
          "Yasam, inanc, iliskiler veya amac hakkinda takip edenlere iletmek istediginiz inanclar nelerdir?",
          "En cok neye minnettar hissediyorsunuz ve sukranin mutlulugunuzdaki rolu neydi?",
          "Paylasilmaya deger degerli dersler ogreten hangi hatalari yaptiniz?",
          "Gelecek nesillerde aileniz ve toplumunuz icin hangi umutlari tasiyorsunuz?",
          "Unutulmamasini saglamak istediginiz hangi gelenekler, hikayeler veya aile tarihi var?",
          "Siz gittikten sonra bunu okuyacaklara hangi bereketleri veya dilekleri sunmak istiyorsunuz?",
        ],
        sampleOpening: "Sevgili aileme ve benden sonra gelecek herkese, bunu mallarimi dagitmak icin degil, cok daha degerli bir seyi paylasmak icin yaziyorum: kim oldugumu sekillendiren bilgelik, degerler ve inanclar. Hayatimi dusundugumde, vermem gereken en onemli seylerin sayilamayacagini veya olculemeyecegini fark ediyorum...",
        howToSteps: [
          { name: "Yasam yolculugunuzu dusunun", text: "Yazmadan once, yasam yayiniz hakkinda sessiz dusuncede zaman gecirin. Kim oldugunuzu sekillendiren tanimlayici anlari, iliskileri, zorluklari ve icgoruleri dusunun." },
          { name: "Temel degerlerinizi belirleyin", text: "Sizin icin en onemli olan ilkeleri listeleyin. Her deger icin, sadece ne oldugunu degil, neden onemli oldugunu ve onu nasil benimsediginizi dusunun." },
          { name: "Bilgeliginizi damitin", text: "Sevgi, is, iliskiler, inanc, aci, sevinc ve anlam hakkinda ne ogrendiginizi dusunun. Kendinizin daha genc bir versiyonuna ne soylesiniz?" },
          { name: "Sukran ve affetme ifade edin", text: "Yasaminizi bereketleyenlerin kabul edilmesini ekleyin. Uygunsa, af verin veya isteyin. Bu ifadeler genellikle etik vasiyetlerin en degerli kisimlari haline gelir." },
          { name: "Ozgunlukle yazin", text: "Resmi veya felsefi gorunmeye calismak yerine dogal sesinizi kullanin. Torunlariniz cilali bir performans degil, sizi duymak ister. Kisisel hikayeler ve spesifik ornekler ekleyin." },
          { name: "Paylasim icin plan yapin", text: "Bu belgenin nasil ve ne zaman paylasilmasi gerektigine karar verin. Bazi aileler etik vasiyetleri birlikte okur, digerleri olumden sonra paylasir." },
        ],
      },
      estimatedTime: "60-90 min",
      category: "legacy",
    },
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all templates across all categories
 */
export function getAllTemplates(): Array<{
  category: TemplateCategory
  slug: string
  data: TemplateContent
}> {
  const templates: Array<{ category: TemplateCategory; slug: string; data: TemplateContent }> = []

  for (const category of templateCategories) {
    const categoryTemplates = templateContent[category]
    if (categoryTemplates) {
      for (const [slug, data] of Object.entries(categoryTemplates)) {
        templates.push({ category, slug, data })
      }
    }
  }

  return templates
}

/**
 * Get a single template by category and slug
 */
export function getTemplate(
  category: TemplateCategory,
  slug: string
): TemplateContent | undefined {
  return templateContent[category]?.[slug]
}

/**
 * Get all templates in a specific category
 */
export function getTemplatesByCategory(
  category: TemplateCategory
): Array<{ slug: string; data: TemplateContent }> {
  const categoryTemplates = templateContent[category]
  if (!categoryTemplates) return []

  return Object.entries(categoryTemplates).map(([slug, data]) => ({
    slug,
    data,
  }))
}

/**
 * Calculate word count for a template
 * Includes: content paragraphs + guiding questions + how-to steps
 */
export function getTemplateWordCount(
  category: TemplateCategory,
  slug: string,
  locale: "en" | "tr" = "en"
): number {
  const template = getTemplate(category, slug)
  if (!template) return 0

  const localeContent = template[locale]

  // Join all content sources
  const allContent = [
    ...localeContent.content,
    ...localeContent.guidingQuestions,
    localeContent.sampleOpening,
    ...localeContent.howToSteps.map((step) => `${step.name} ${step.text}`),
  ].join(" ")

  // Count words
  return allContent.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Get featured templates (one from each category)
 */
export function getFeaturedTemplates(): Array<{
  category: TemplateCategory
  slug: string
  data: TemplateContent
}> {
  const featured: Array<{ category: TemplateCategory; slug: string; data: TemplateContent }> = []

  for (const category of templateCategories) {
    const categoryTemplates = templateContent[category]
    if (categoryTemplates) {
      const firstSlug = Object.keys(categoryTemplates)[0]
      if (firstSlug && categoryTemplates[firstSlug]) {
        featured.push({
          category,
          slug: firstSlug,
          data: categoryTemplates[firstSlug],
        })
      }
    }
  }

  return featured
}
