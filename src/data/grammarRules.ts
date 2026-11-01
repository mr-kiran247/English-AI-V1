export interface GrammarClinicRule {
  id: string;
  category: 'daily' | 'professional';
  title: string;
  titleHindi: string;
  titleMarathi: string;
  commonIndianMistake: string;
  correctEnglish: string;
  whyThisHappens: string;
  hindiExplanation: string;
  marathiExplanation: string;
  practiceExamples: Array<{
    incorrect: string;
    correct: string;
    hindi: string;
    marathi: string;
  }>;
}

export const GRAMMAR_CLINIC_RULES: GrammarClinicRule[] = [
  {
    id: 'myself-introduction',
    category: 'professional',
    title: 'Self Introductions: Avoid "Myself [Name]"',
    titleHindi: 'परिचय: "Myself..." की जगह "I am..." कहें',
    titleMarathi: 'स्वतःची ओळख: "Myself..." ऐवजी "I am..." वापरा',
    commonIndianMistake: 'Myself Rahul Sharma from Mumbai.',
    correctEnglish: 'My name is Rahul Sharma, or I am Rahul Sharma.',
    whyThisHappens: 'In Hindi/Marathi, we say "माझे नाव राहुल आहे / मेरा नाम राहुल है" or reflexive "मैं खुद". In English, "Myself" is a reflexive pronoun and cannot be the subject of a sentence.',
    hindiExplanation: '"Myself" व्याकरण के अनुसार गलत है। इंटरव्यू और पेशेवर बातचीत में हमेशा "I am [Name]" या "My name is [Name]" का उपयोग करें।',
    marathiExplanation: '"Myself" हे व्याकरणाच्या दृष्टीने अयोग्य आहे. मुलाखतीत किंवा कामाच्या ठिकाणी नेहमी "I am [नाव]" किंवा "My name is [नाव]" वापरावे.',
    practiceExamples: [
      {
        incorrect: 'Myself Priya, working as designer.',
        correct: 'I am Priya, and I work as a designer.',
        hindi: 'मैं प्रिया हूँ और मैं डिज़ाइनर के रूप में काम करती हूँ।',
        marathi: 'मी प्रिया आहे आणि मी डिझायनर म्हणून काम करते.',
      },
      {
        incorrect: 'Myself having 5 years experience.',
        correct: 'I have five years of experience.',
        hindi: 'मुझे 5 साल का अनुभव है।',
        marathi: 'मला ५ वर्षांचा अनुभव आहे.',
      },
    ],
  },
  {
    id: 'stative-verbs-continuous',
    category: 'daily',
    title: 'Stative Verbs: "I am knowing" vs "I know"',
    titleHindi: 'Stative Verbs: "I am knowing" नहीं, "I know" बोलें',
    titleMarathi: 'क्रियापद नियम: "I am knowing" ऐवजी "I know" बोला',
    commonIndianMistake: 'I am knowing him very well / I am having a headache.',
    correctEnglish: 'I know him very well / I have a headache.',
    whyThisHappens: 'In Hindi ("मुझे पता है / मैं जान रहा हूँ") and Marathi ("मला माहीत आहे"), mental state verbs are treated like ongoing states. In English, verbs like know, understand, have (possession), like, believe are not used in continuous (-ing) forms.',
    hindiExplanation: 'know, understand, have (स्वामित्व) जैसे शब्दों में सामान्यतः "-ing" नहीं लगाया जाता। सीधे Simple Present का प्रयोग करें।',
    marathiExplanation: 'know, understand, want, like या शब्दांना "-ing" लावले जात नाही. नेहमी साध्या वर्तमानकाळात "I know" किंवा "I have" म्हणावे.',
    practiceExamples: [
      {
        incorrect: 'I am understanding your problem.',
        correct: 'I understand your problem.',
        hindi: 'मैं आपकी समस्या समझता हूँ।',
        marathi: 'मला तुमची अडचण समजते.',
      },
      {
        incorrect: 'He is having two cars.',
        correct: 'He has two cars.',
        hindi: 'उसके पास दो गाड़ियाँ हैं।',
        marathi: 'त्याच्याकडे दोन गाड्या आहेत.',
      },
    ],
  },
  {
    id: 'since-vs-for',
    category: 'professional',
    title: 'Time Duration: "Since" vs "For"',
    titleHindi: 'समय की अवधि: "Since" और "For" का सही उपयोग',
    titleMarathi: 'वेळेचा कालावधी: "Since" आणि "For" चा योग्य वापर',
    commonIndianMistake: 'I am working in this company since 3 years.',
    correctEnglish: 'I have been working in this company for 3 years.',
    whyThisHappens: 'Both Hindi ("३ साल से") and Marathi ("३ वर्षांपासून") use the same postposition ("से" / "पासून") for both duration and starting point. English differentiates: "Since" is for a starting point (Since 2021, Since Monday), while "For" is for a duration of time (For 3 years, For 2 hours). Also requires Present Perfect Continuous.',
    hindiExplanation: 'समय की अवधि (Duration: 3 years, 5 hours) के लिए "FOR" लगाएं, और निश्चित शुरुआत (Point in time: 2020, 9 AM) के लिए "SINCE" लगाएं।',
    marathiExplanation: 'एकूण कालावधी (३ वर्षे, २ तास) सांगण्यासाठी "FOR" वापरा, आणि नेमकी सुरुवात (२०२१ पासून, सकाळपासून) सांगण्यासाठी "SINCE" वापरा.',
    practiceExamples: [
      {
        incorrect: 'I am staying in Pune since 5 years.',
        correct: 'I have been living in Pune for 5 years.',
        hindi: 'मैं 5 साल से पुणे में रह रहा हूँ।',
        marathi: 'मी ५ वर्षांपासून पुण्यात राहत आहे.',
      },
      {
        incorrect: 'I am waiting since 1 hour.',
        correct: 'I have been waiting for an hour.',
        hindi: 'मैं एक घंटे से इंतज़ार कर रहा हूँ।',
        marathi: 'मी एका तासापासून वाट पाहत आहे.',
      },
    ],
  },
  {
    id: 'revert-back-prepone',
    category: 'professional',
    title: 'Corporate Indianisms: "Revert back" & "Prepone"',
    titleHindi: 'कॉर्पोरेट ईमेल: "Revert back" की जगह "Reply" कहें',
    titleMarathi: 'ऑफिसमधील भाषा: "Revert back" ऐवजी "Reply" म्हणा',
    commonIndianMistake: 'Please revert back to me at the earliest / Can we prepone the call?',
    correctEnglish: 'Please reply or get back to me / Can we move the call earlier?',
    whyThisHappens: '"Revert" already means to return to a previous state, so adding "back" is redundant. "Prepone" was coined in India as the opposite of postpone, but international colleagues use "reschedule earlier" or "move forward".',
    hindiExplanation: '"Revert back" दोहराव है। सीधे "reply" या "get back to me" कहें। मीटिंग पहले करने के लिए "advance the meeting" या "move it earlier" कहें।',
    marathiExplanation: '"Revert back" ऐवजी "reply" किंवा "respond" वापरा. मिटिंग वेळेआधी घेण्यासाठी "move the meeting earlier" म्हणावे.',
    practiceExamples: [
      {
        incorrect: 'Kindly revert back on this email.',
        correct: 'Please reply to this email when you have a moment.',
        hindi: 'कृपया समय मिलने पर इस ईमेल का उत्तर दें।',
        marathi: 'कृपया सवड मिळाल्यास या ईमेलला उत्तर द्या.',
      },
      {
        incorrect: 'We need to prepone tomorrow\'s standup.',
        correct: 'We need to reschedule tomorrow\'s standup to an earlier time.',
        hindi: 'हमें कल के स्टैंडअप का समय पहले करना होगा।',
        marathi: 'आपल्याला उद्याच्या मीटिंगची वेळ आधी घ्यावी लागेल.',
      },
    ],
  },
  {
    id: 'preposition-superfluous',
    category: 'daily',
    title: 'Superfluous Prepositions: "Order for" & "Discuss about"',
    titleHindi: 'फालतू Prepositions: "Discuss about" नहीं, केवल "Discuss"',
    titleMarathi: 'अनावश्यक Prepositions: "Order for" ऐवजी फक्त "Order"',
    commonIndianMistake: 'Let us discuss about the project / I will order for biryani.',
    correctEnglish: 'Let us discuss the project / I will order biryani.',
    whyThisHappens: 'In Hindi ("प्रोजेक्ट के बारे में चर्चा") and Marathi ("प्रकल्पाबद्दल चर्चा"), we explicitly say "के बारे में" / "बद्दल". In English, transitive verbs like discuss, order, consider, explain do not take "about" or "for".',
    hindiExplanation: 'Discuss, order, describe जैसी क्रियाओं के बाद "about" या "for" नहीं आता। सीधे ऑब्जेक्ट बोलें: "Discuss the project".',
    marathiExplanation: 'Discuss, order या शब्दांनंतर "about" किंवा "for" ची गरज नसते. थेट "I ordered pizza" किंवा "Let\'s discuss the issue" म्हणा.',
    practiceExamples: [
      {
        incorrect: 'We should discuss about our weekend plan.',
        correct: 'We should discuss our weekend plans.',
        hindi: 'हमें अपनी सप्ताहांत की योजना पर चर्चा करनी चाहिए।',
        marathi: 'आपण आपल्या वीकेंडच्या नियोजनावर चर्चा केली पाहिजे.',
      },
      {
        incorrect: 'Did you order for tea?',
        correct: 'Did you order tea?',
        hindi: 'क्या आपने चाय मंगवाई?',
        marathi: 'तुम्ही चहा मागवला का?',
      },
    ],
  },
];
