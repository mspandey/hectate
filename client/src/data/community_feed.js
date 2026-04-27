// ============================================================
// hectate — Community Feed Database (Twitter/X-style posts)
// Each post: id, author_id, author_name, author_handle,
//            content, timestamp, likes, reposts, replies,
//            tags, replies_data[]
// ============================================================

export const COMMUNITY_FEED = [
  {
    id:"P001", author_id:"W095", author_name:"Bhavani Devi", author_handle:"@bhavani.devi",
    content:"Just finished a 6-hour training session. My wrist hurts, my back hurts, everything hurts — but I would do it again tomorrow. Paris is calling and I am answering. 🤺 #HECATEWomen #Fencing #Olympics",
    timestamp:"2025-04-24T06:15:00", likes:342, reposts:89, reply_count:41, tags:["fencing","Olympics","sport"],
    replies:[
      { id:"R001a", author_id:"W059", author_handle:"@jyoti.rani", content:"This energy is everything!! We sport women have to push 10x harder. You are inspiring an entire generation!", timestamp:"2025-04-24T06:32:00", likes:87 },
      { id:"R001b", author_id:"W075", author_handle:"@keerthana.g", content:"Sister! I feel this in my bones. Commonwealth trials are brutal too. We do it for the flag. Come on Bhavani! 🇮🇳", timestamp:"2025-04-24T07:01:00", likes:63 }
    ]
  },
  {
    id:"P002", author_id:"W043", author_name:"Girija Nair", author_handle:"@girija.nair",
    content:"Successful telemetry lock on the latest satellite. The control room erupted. There is nothing — NOTHING — like watching something you built touch the sky. Women belong in space. End of debate. 🚀 #ISRO #STEM #HECATEWomen",
    timestamp:"2025-04-24T08:30:00", likes:891, reposts:312, reply_count:78, tags:["ISRO","space","STEM"],
    replies:[
      { id:"R002a", author_id:"W052", author_handle:"@jayanti.k", content:"Dr. Girija you are literally the reason I chose AI over going abroad. Watching ISRO women like you changed my trajectory. Thank you.", timestamp:"2025-04-24T08:45:00", likes:201 },
      { id:"R002b", author_id:"W005", author_handle:"@riya.kapoor", content:"I literally cried reading this. The data team says women in STEM are underrepresented but the data forgets to mention they are the ones making the data happen 😭", timestamp:"2025-04-24T09:10:00", likes:155 }
    ]
  },
  {
    id:"P003", author_id:"W008", author_name:"Tanvi Singh", author_handle:"@tanvi.singh",
    content:"My report on sanitation workers' rights was killed by my editor because it was 'too political'. The women I interviewed clean your city before dawn and get no health cover. What exactly is not political about that? I will publish it myself. #JournalismMatters #HECATEWomen",
    timestamp:"2025-04-24T09:00:00", likes:1204, reposts:567, reply_count:143, tags:["journalism","rights","sanitation"],
    replies:[
      { id:"R003a", author_id:"W060", author_handle:"@sundaramma.p", content:"Please publish it. We need people to SEE us. I have worked sanitation for 18 years with no gloves for the first 5. This is real.", timestamp:"2025-04-24T09:20:00", likes:892 },
      { id:"R003b", author_id:"W001", author_handle:"@ananya.sharma", content:"Tanvi send it to me. I will file a PIL if there is legal ground. We need your voice OUT THERE.", timestamp:"2025-04-24T09:35:00", likes:340 },
      { id:"R003c", author_id:"W048", author_handle:"@ruchika.m", content:"This is exactly what I mean when I say mainstream media gatekeeps stories of working-class women. We see you. Post it.", timestamp:"2025-04-24T09:50:00", likes:278 }
    ]
  },
  {
    id:"P004", author_id:"W039", author_name:"Ishita Basu", author_handle:"@ishita.basu",
    content:"We just crossed 10,000 girls enrolled on our EdTech platform from rural Bengal and Bihar. Started with 40 girls in a shed 2 years ago. If you told me then I would have laughed. I am not laughing now, I am ugly crying. 😭 #EdTech #GirlsEducation #HECATEWomen",
    timestamp:"2025-04-24T10:15:00", likes:2340, reposts:1100, reply_count:211, tags:["edtech","girls","education"],
    replies:[
      { id:"R004a", author_id:"W064", author_handle:"@tripti.jha", content:"10,000! I remember when you dm'd me last year asking how to get girls to stay enrolled past month 2. Look at you NOW.", timestamp:"2025-04-24T10:30:00", likes:567 },
      { id:"R004b", author_id:"W040", author_handle:"@lata.kumari", content:"I want to fund the next 10,000. Reaching out to your DM right now.", timestamp:"2025-04-24T10:45:00", likes:389 }
    ]
  },
  {
    id:"P005", author_id:"W021", author_name:"Divya Krishnan", author_handle:"@divya.krishnan",
    content:"A patient today told me she did not tell her husband she was seeing a psychiatrist because he would call her 'pagal'. She has been carrying clinical depression for 3 years silently. This is why destigmatisation is life or death work. Not trend. Not aesthetic. Life. #MentalHealth #HECATEWomen",
    timestamp:"2025-04-24T11:00:00", likes:3100, reposts:1890, reply_count:302, tags:["mentalhealth","stigma","women"],
    replies:[
      { id:"R005a", author_id:"W006", author_handle:"@sonal.gupta", content:"As a cardiologist I see women with untreated anxiety presenting with 'heart attacks'. The overlap is staggering. Mental health IS physical health.", timestamp:"2025-04-24T11:20:00", likes:782 },
      { id:"R005b", author_id:"W036", author_handle:"@vandana.patil", content:"In rural areas the word psychiatrist is not even understood. I have seen women given stone amulets for what is clearly postpartum psychosis. We need more of you everywhere.", timestamp:"2025-04-24T11:45:00", likes:540 }
    ]
  },
  {
    id:"P006", author_id:"W022", author_name:"Shweta Agarwal", author_handle:"@shweta.ag",
    content:"Hot take: The gender pay gap in finance is not because women are less qualified. It is because negotiations are coded as 'aggression' when women do them. I negotiated my CTC up by 40% last month and three men called me 'difficult' before I even left the room. #Finance #PayGap #HECATEWomen",
    timestamp:"2025-04-24T11:30:00", likes:4500, reposts:2300, reply_count:445, tags:["finance","paygap","negotiation"],
    replies:[
      { id:"R006a", author_id:"W067", author_handle:"@monika.bhasin", content:"40%!! Queen behavior. I always coach women lawyers to anchor high. The discomfort of asking is ALWAYS less than the regret of not asking.", timestamp:"2025-04-24T11:50:00", likes:910 },
      { id:"R006b", author_id:"W081", author_handle:"@prerna.d", content:"There is actually research on this — women who negotiate are penalized in 'likeability' scores by both male AND female raters. The bias is systemic not individual.", timestamp:"2025-04-24T12:10:00", likes:654 }
    ]
  },
  {
    id:"P007", author_id:"W025", author_name:"Komal Rawat", author_handle:"@komal.rawat",
    content:"Summit! Trishul Peak. 7,120 meters. First woman from Pithoragarh district to stand here. My mother said girls don't climb mountains. I just sent her a photo from the top. 🏔️ #Mountains #NCC #Uttarakhand #HECATEWomen",
    timestamp:"2025-04-22T14:00:00", likes:6700, reposts:3400, reply_count:512, tags:["mountaineering","summit","uttarakhand"],
    replies:[
      { id:"R007a", author_id:"W077", author_handle:"@tarini.bhatt", content:"I SCREAMED. Komal I guided your base camp prep trek last November and I knew you would make it. You were born for altitude.", timestamp:"2025-04-22T14:30:00", likes:1200 },
      { id:"R007b", author_id:"W058", author_handle:"@padma.reddy", content:"Colonel salute to you, soldier. The mountain does not know your gender. And neither does your nation when it is proud of you.", timestamp:"2025-04-22T15:00:00", likes:890 }
    ]
  },
  {
    id:"P008", author_id:"W032", author_name:"Bhavana Reddy", author_handle:"@bhavana.r",
    content:"Our cancer diagnostic kit just got cleared for use in 3 state governments. Cost: ₹200. Commercial alternative: ₹8,000. This is what science for India looks like. Not imported, not elite — ours. 🧬 #Biotech #Cancer #HECATEWomen",
    timestamp:"2025-04-23T09:00:00", likes:5200, reposts:2800, reply_count:390, tags:["biotech","cancer","science"],
    replies:[
      { id:"R008a", author_id:"W078", author_handle:"@malvika.rao", content:"THIS IS WHAT I HAVE BEEN WAITING FOR. Can we talk about a pilot in rural Telangana hospitals? Sending you a formal collaboration request.", timestamp:"2025-04-23T09:25:00", likes:1100 },
      { id:"R008b", author_id:"W049", author_handle:"@varsha.kulkarni", content:"From pharma side — the regulatory path must have been brutal. Congratulations on the clearance. This will save lives that expensive kits never reached.", timestamp:"2025-04-23T09:50:00", likes:743 }
    ]
  },
  {
    id:"P009", author_id:"W045", author_name:"Harpreet Kaur", author_handle:"@harpreet.kaur",
    content:"Langar today at the Golden Temple. 80,000 people fed. I kneaded dough for 4 hours. My hands are done. My heart is full. Seva has no status, no gender. It just has love. 🙏 #Langar #Sikh #Seva #HECATEWomen",
    timestamp:"2025-04-23T18:00:00", likes:3800, reposts:1700, reply_count:287, tags:["seva","langar","sikh","community"],
    replies:[
      { id:"R009a", author_id:"W084", author_handle:"@geeta.rawat", content:"This made me emotional. Seva across traditions is the same pulse. You at langar, me at the Ganga aarti — different rivers, same ocean.", timestamp:"2025-04-23T18:30:00", likes:672 },
      { id:"R009b", author_id:"W013", author_handle:"@nandita.bose", content:"80,000 people fed. Every single day. No newspaper covers this. Some of the most important work in India happens invisibly.", timestamp:"2025-04-23T18:50:00", likes:521 }
    ]
  },
  {
    id:"P010", author_id:"W053", author_name:"Champa Devi", author_handle:"@champa.devi",
    content:"My first resolution as sarpanch: street lights in every lane of the village because women should not have to carry fear when they walk home after dark. Passed unanimously. Simple. #Panchayat #VillageLeader #HECATEWomen",
    timestamp:"2025-04-23T12:00:00", likes:8900, reposts:4500, reply_count:623, tags:["panchayat","village","safety","leadership"],
    replies:[
      { id:"R010a", author_id:"W034", author_handle:"@kiran.b", content:"This is governance. THIS. Not grand schemes — safe streets so women can live their lives. Respect.", timestamp:"2025-04-23T12:20:00", likes:2100 },
      { id:"R010b", author_id:"W028", author_handle:"@aarti.pandey", content:"I am putting this in my governance notes. Future IAS aspirants need to learn from ground-up leaders like you Champa ji. This is real public service.", timestamp:"2025-04-23T12:45:00", likes:1540 },
      { id:"R010c", author_id:"W064", author_handle:"@tripti.jha", content:"And once the lights are on, the girls will come to school. It is always connected. Safety unlocks everything.", timestamp:"2025-04-23T13:10:00", likes:1230 }
    ]
  },
  {
    id:"P011", author_id:"W003", author_name:"Kavya Nair", author_handle:"@kavya.nair",
    content:"We launched our end-to-end encrypted women's safety app last night. 12,000 downloads in 9 hours. Not bad for a startup founded in a 1BHK in Bengaluru. DMs are open for enterprise partnerships. 💜 #Tech #WomenSafety #Startup #HECATEWomen",
    timestamp:"2025-04-24T07:00:00", likes:4100, reposts:2200, reply_count:334, tags:["tech","startup","safety","app"],
    replies:[
      { id:"R011a", author_id:"W061", author_handle:"@drishti.m", content:"12K in 9 hours?! The market has been WAITING for this. Kavya let us talk — our fintech rails could integrate for emergency fund disbursement in crisis situations.", timestamp:"2025-04-24T07:20:00", likes:890 },
      { id:"R011b", author_id:"W091", author_handle:"@meghna.s", content:"Can we talk about the UX? I want to audit the flow for women with disabilities — screen reader compatibility, one-handed use in panic situations. Pro bono.", timestamp:"2025-04-24T07:45:00", likes:673 }
    ]
  },
  {
    id:"P012", author_id:"W014", author_name:"Fatima Siddiqui", author_handle:"@fatima.sid",
    content:"My biryani video just hit 10 million views. My mother used to say cooking is not a career. Ten million people disagree with her, and so do I. Awadhi cuisine deserves the world stage. 🍚 #Food #Cooking #Lucknow #HECATEWomen",
    timestamp:"2025-04-22T20:00:00", likes:12000, reposts:6700, reply_count:890, tags:["food","cooking","viral","lucknow"],
    replies:[
      { id:"R012a", author_id:"W041", author_handle:"@monisha.shetty", content:"From hospitality — the food industry needs more women at the top. Not just cooking but directing kitchens, owning restaurants. You are showing the path.", timestamp:"2025-04-22T20:30:00", likes:2300 },
      { id:"R012b", author_id:"W087", author_handle:"@vasanta.bai", content:"Fatima ji I sell incense but I would give everything to smell your kitchen right now 😂 Congratulations, your mother must secretly be proud.", timestamp:"2025-04-22T21:00:00", likes:3400 }
    ]
  },
  {
    id:"P013", author_id:"W007", author_name:"Meena Pillai", author_handle:"@meena.pillai",
    content:"Filed a PIL today against a corporation dumping effluents in the Adyar river. The hearing date is in 6 months. Justice is slow but plants die faster. We cannot afford slow. #Environment #Law #Chennai #HECATEWomen",
    timestamp:"2025-04-24T13:00:00", likes:2700, reposts:1400, reply_count:198, tags:["environment","law","PIL","river"],
    replies:[
      { id:"R013a", author_id:"W057", author_handle:"@anita.sahu", content:"I am filing a similar one for a river in Chhattisgarh. Let us compare notes — same corporate family of defendants I suspect.", timestamp:"2025-04-24T13:20:00", likes:456 },
      { id:"R013b", author_id:"W048", author_handle:"@ruchika.m", content:"The 6-month wait is the real violence. I will amplify this. Every media outlet I know is getting a ping today.", timestamp:"2025-04-24T13:45:00", likes:389 }
    ]
  },
  {
    id:"P014", author_id:"W015", author_name:"Rekha Iyer", author_handle:"@rekha.iyer",
    content:"Cleared 12 files that had been pending for 8 years in my district. The system is not broken, it is just blocked by people who benefit from the blockage. Move them out of the way and it flows. #IAS #Governance #HECATEWomen",
    timestamp:"2025-04-23T17:00:00", likes:5600, reposts:3100, reply_count:412, tags:["IAS","governance","bureaucracy"],
    replies:[
      { id:"R014a", author_id:"W028", author_handle:"@aarti.pandey", content:"Saving this for my UPSC interview. 'The system is not broken, it is blocked.' That is the most concise and correct analysis I have read in years.", timestamp:"2025-04-23T17:25:00", likes:1890 },
      { id:"R014b", author_id:"W053", author_handle:"@champa.devi", content:"From a sarpanch — those 8-year pending files affect real villages. Real crops. Real women. Thank you Madam.", timestamp:"2025-04-23T17:50:00", likes:1340 }
    ]
  },
  {
    id:"P015", author_id:"W026", author_name:"Seema Bhatt", author_handle:"@seema.bhatt",
    content:"Morning yoga at 5am. Surya Namaskar as the sky turns pink. 15 years of this practice and it still feels like the first time. If you want one thing that will change your life — this is it. 🌅 #Yoga #Wellness #HECATEWomen",
    timestamp:"2025-04-24T05:30:00", likes:2100, reposts:980, reply_count:156, tags:["yoga","wellness","morning","health"],
    replies:[
      { id:"R015a", author_id:"W012", author_handle:"@shruti.desai", content:"And pair it with the right breakfast! After surya namaskar your body is primed for protein absorption. I will post the optimal post-yoga meal plan today.", timestamp:"2025-04-24T05:50:00", likes:678 },
      { id:"R015b", author_id:"W038", author_handle:"@mamta.rawat", content:"Ayurveda and yoga together — this is the original wellness protocol. No supplement brand required 🙏", timestamp:"2025-04-24T06:05:00", likes:512 }
    ]
  },
  {
    id:"P016", author_id:"W031", author_name:"Tara Devi", author_handle:"@tara.devi",
    content:"Spoke at the UN Indigenous Rights session in Geneva yesterday. Flew back to Ranchi tonight. Tomorrow I will be sitting in the same community hall where I first heard a woman speak truth to power as a child. Everything is full circle. #Adivasi #TribalRights #HECATEWomen",
    timestamp:"2025-04-23T23:00:00", likes:7800, reposts:4200, reply_count:545, tags:["tribal","rights","UN","Adivasi"],
    replies:[
      { id:"R016a", author_id:"W057", author_handle:"@anita.sahu", content:"Geneva to a community hall in Jharkhand. That trajectory IS the point. The halls of power and the ground. You move between both and that is why you are effective.", timestamp:"2025-04-24T00:10:00", likes:2100 },
      { id:"R016b", author_id:"W068", author_handle:"@rani.meena", content:"Tara didi you spoke for all of us. Banjara, Adivasi, Meena — we all heard you from here.", timestamp:"2025-04-24T00:30:00", likes:1670 }
    ]
  },
  {
    id:"P017", author_id:"W047", author_name:"Sangeetha Pillai", author_handle:"@sangeetha.p",
    content:"6 months to weave one Kanjivaram saree. 6 months of my life in every thread. And people haggle over the price. The next time you touch a handloom, understand what you are holding. #Kanjivaram #Handloom #Artisan #HECATEWomen",
    timestamp:"2025-04-22T15:00:00", likes:9300, reposts:5100, reply_count:678, tags:["kanjivaram","handloom","craft","artisan"],
    replies:[
      { id:"R017a", author_id:"W073", author_handle:"@savita.h", content:"Maheshwari weaver here. 2 weeks for mine and people still argue. 6 months. I cannot imagine the discipline. Your hands hold lifetimes of knowledge.", timestamp:"2025-04-22T15:30:00", likes:2340 },
      { id:"R017b", author_id:"W096", author_handle:"@hema.yadav", content:"Banarasi silk here. We are all sisters in thread. The day we stop, something irreplaceable dies. Customers need to understand: buy handloom = keep a woman employed.", timestamp:"2025-04-22T16:00:00", likes:3100 },
      { id:"R017c", author_id:"W088", author_handle:"@shriya.kap", content:"This is why I only feature handloom on my channel. I am resharing this post with all 500K of my followers right now. WORTH EVERY RUPEE.", timestamp:"2025-04-22T16:30:00", likes:4200 }
    ]
  },
  {
    id:"P018", author_id:"W002", author_name:"Priya Mehra", author_handle:"@priya.mehra",
    content:"My photo series 'She Works Before Dawn' — women working night shifts, early morning markets, hospital wards — just got selected for the World Press Photo shortlist. I did not expect this. I am shaking. 📷 #Photography #WomenWorkers #HECATEWomen",
    timestamp:"2025-04-24T14:00:00", likes:11000, reposts:6800, reply_count:734, tags:["photography","worldpress","art","women"],
    replies:[
      { id:"R018a", author_id:"W060", author_handle:"@sundaramma.p", content:"You photographed me at 4am outside Majestic station last October. I never thought anyone would care. This is for all of us in those photos. Thank you.", timestamp:"2025-04-24T14:30:00", likes:5600 },
      { id:"R018b", author_id:"W009", author_handle:"@aisha.khan", content:"PRIYA!!! I have followed this series from the first frame. Well-deserved. The image of the fisherwoman selling at 3am broke my heart in the best way.", timestamp:"2025-04-24T14:45:00", likes:1890 }
    ]
  },
  {
    id:"P019", author_id:"W016", author_name:"Sunita Yadav", author_handle:"@sunita.yadav",
    content:"Our collective of women farmers in Bihar grew 40% more yield this season using natural fertilisers only. No input cost from MNCs. The land knows what it needs — we just had to listen. 🌾 #Farming #Bihar #WomenFarmers #HECATEWomen",
    timestamp:"2025-04-23T10:00:00", likes:4700, reposts:2600, reply_count:318, tags:["farming","Bihar","collective","agriculture"],
    replies:[
      { id:"R019a", author_id:"W063", author_handle:"@lekha.pillai", content:"This is what the organic movement looks like when it is BY farmers not FOR influencers. 40% yield increase! Can we study your collective model?", timestamp:"2025-04-23T10:30:00", likes:1230 },
      { id:"R019b", author_id:"W089", author_handle:"@nalini.k", content:"From Auroville permaculture — this is exactly what we practice. The land gives back what you respect. Your collective is the blueprint.", timestamp:"2025-04-23T10:55:00", likes:893 }
    ]
  },
  {
    id:"P020", author_id:"W004", author_name:"Deepika Joshi", author_handle:"@deepika.j",
    content:"First year law student asked me today: 'Is it worth it?' I told her: the day you stand up and argue for someone who has no one else, you will know why. That day makes everything worth it. 💜 #Law #Jaipur #HECATEWomen",
    timestamp:"2025-04-24T16:00:00", likes:6200, reposts:3400, reply_count:487, tags:["law","mentorship","inspiration"],
    replies:[
      { id:"R020a", author_id:"W001", author_handle:"@ananya.sharma", content:"I needed to read this today of all days. After a brutal week in court where we lost a case we should have won — this reminded me why I started.", timestamp:"2025-04-24T16:20:00", likes:1560 },
      { id:"R020b", author_id:"W035", author_handle:"@anjali.mishra", content:"The best legal advice is always the simplest: remember the person, not the precedent. This is it right here.", timestamp:"2025-04-24T16:45:00", likes:1120 }
    ]
  },
  {
    id:"P021", author_id:"W072", author_name:"Pragya Tomar", author_handle:"@pragya.tomar",
    content:"Beat the state champion (a boy, three years my senior) in 38 moves. Everyone was silent. I stood up and said thank you with a smile. I have been training for that silence. ♟ #Chess #WomenInSport #HECATEWomen",
    timestamp:"2025-04-21T19:00:00", likes:15000, reposts:8900, reply_count:1120, tags:["chess","sport","champion","girl"],
    replies:[
      { id:"R021a", author_id:"W059", author_handle:"@jyoti.rani", content:"'Training for the silence.' That line is going in my training room on a poster. Absolute champion energy.", timestamp:"2025-04-21T19:30:00", likes:4500 },
      { id:"R021b", author_id:"W095", author_handle:"@bhavani.devi", content:"One warrior to another — the silence after the win is louder than any trophy. They will be noisy when they cheer for you too. Mark my words.", timestamp:"2025-04-21T20:00:00", likes:3800 }
    ]
  },
  {
    id:"P022", author_id:"W050", author_name:"Aditi Ghosh", author_handle:"@aditi.ghosh",
    content:"New paper out: Women in India's informal economy contribute ₹19 lakh crore annually — unaccounted in GDP. They are not invisible. The measurement tool is broken. Sharing the link in replies. #Economics #WomenWork #Research #HECATEWomen",
    timestamp:"2025-04-23T11:00:00", likes:7100, reposts:4800, reply_count:512, tags:["economics","research","GDP","invisiblelabour"],
    replies:[
      { id:"R022a", author_id:"W081", author_handle:"@prerna.d", content:"Citing this in my PhD chapter on political representation and economic recognition. The correlation between who gets counted and who gets represented is direct.", timestamp:"2025-04-23T11:30:00", likes:1670 },
      { id:"R022b", author_id:"W040", author_handle:"@lata.kumari", content:"This is why microfinance works — because we have always known this value existed, even when the GDP calculator refused to see it.", timestamp:"2025-04-23T11:55:00", likes:1230 }
    ]
  },
  {
    id:"P023", author_id:"W080", author_name:"Kavitha Menon", author_handle:"@kavitha.m",
    content:"Performed Kathakali in Kerala Kalamandalam's main stage tonight. For 300 years this form had no women. I wore the chutti and stood under the lights and I felt all of them — the ones who were told no. I performed for them. 💚 #Kathakali #Kerala #HECATEWomen",
    timestamp:"2025-04-22T22:00:00", likes:9800, reposts:5600, reply_count:645, tags:["kathakali","dance","kerala","revolution"],
    replies:[
      { id:"R023a", author_id:"W033", author_handle:"@preethi.sub", content:"From Bharatanatyam to Kathakali — classical forms belong to whoever has the dedication and the devotion. You are rewriting a 300-year footnote.", timestamp:"2025-04-22T22:30:00", likes:2340 },
      { id:"R023b", author_id:"W044", author_handle:"@sneha.acharya", content:"Odissi dancer watching Kathakali in tears. We are all breaking the same walls with different mudras. 🙏", timestamp:"2025-04-22T23:00:00", likes:1890 }
    ]
  },
  {
    id:"P024", author_id:"W018", author_name:"Archana Tiwari", author_handle:"@archana.tiwari",
    content:"Found a palm leaf manuscript in Varanasi that predates the standard Sanskrit grammar texts by 200 years. It contains a text attributed to a woman scholar named Gargi Mishra. She existed. She wrote. History buried her. We are unburying. 📜 #Sanskrit #WomenScholars #HECATEWomen",
    timestamp:"2025-04-23T16:00:00", likes:13000, reposts:8100, reply_count:892, tags:["sanskrit","history","scholar","discovery"],
    replies:[
      { id:"R024a", author_id:"W037", author_handle:"@swetha.n", content:"Archana this is extraordinary. Linguist here — the implications for the oral-written tradition timeline are enormous. Publishing anything formally? I want to collaborate.", timestamp:"2025-04-23T16:30:00", likes:2890 },
      { id:"R024b", author_id:"W083", author_handle:"@aparna.pillai", content:"Gargi Mishra. I am writing that name down and keeping it. Women's intellectual history is a graveyard of erasures. You just found one of them alive.", timestamp:"2025-04-23T17:00:00", likes:3400 }
    ]
  },
  {
    id:"P025", author_id:"W011", author_name:"Lalitha Reddy", author_handle:"@lalitha.reddy",
    content:"After 10 years as the only woman in my FAANG team I finally have 3 junior women engineers reporting to me. Mentoring them is the most important thing I do. Not the code I ship. The pipeline matters. 💻 #Tech #WomenInSTEM #Mentorship #HECATEWomen",
    timestamp:"2025-04-24T12:00:00", likes:8400, reposts:5100, reply_count:623, tags:["tech","STEM","mentorship","engineering"],
    replies:[
      { id:"R025a", author_id:"W003", author_handle:"@kavya.nair", content:"I was where your juniors are 6 years ago. The women above me who opened doors — I model myself on them every day. You are that woman now.", timestamp:"2025-04-24T12:20:00", likes:2100 },
      { id:"R025b", author_id:"W052", author_handle:"@jayanti.k", content:"Pipeline IS product. Build enough women engineers and the tech itself changes — becomes more inclusive by default. This is systems thinking.", timestamp:"2025-04-24T12:45:00", likes:1780 }
    ]
  },
  {
    id:"P026", author_id:"W085", author_name:"Sunanda Ghosh", author_handle:"@sunanda.g",
    content:"First flush Darjeeling this season. Managed the harvest, directed 400 pluckers, negotiated with London buyers directly — no middlemen. My grandfather managed this estate. His granddaughter now sets the price. ☕ #Tea #Darjeeling #HECATEWomen",
    timestamp:"2025-04-20T08:00:00", likes:6100, reposts:3400, reply_count:412, tags:["tea","darjeeling","business","inheritance"],
    replies:[
      { id:"R026a", author_id:"W099", author_handle:"@kaveri.sh", content:"Coorg coffee here. Same world, same fight. The estates were built by our families, it is time we led them. No middlemen. Exactly right.", timestamp:"2025-04-20T08:30:00", likes:1890 },
      { id:"R026b", author_id:"W024", author_handle:"@usha.patel", content:"Direct-to-buyer is the future for all artisan products. You are setting the model. Gujarat textiles are doing the same.", timestamp:"2025-04-20T09:00:00", likes:1340 }
    ]
  },
  {
    id:"P027", author_id:"W056", author_name:"Shraddha Kelkar", author_handle:"@shraddha.k",
    content:"Water ATM arrived in our village today. 5 years of petitioning. 5 years. Women used to walk 4km at 4am for water. Tonight no one walks 4km at 4am. That is the work. #Water #Marathwada #WomenRights #HECATEWomen",
    timestamp:"2025-04-22T19:00:00", likes:14000, reposts:9200, reply_count:1040, tags:["water","Marathwada","rights","village"],
    replies:[
      { id:"R027a", author_id:"W036", author_handle:"@vandana.patil", content:"ASHA worker tears reading this. The number of women I have seen with back injuries from water carrying. 5 years of your fight is 5 years of their pain finally ending.", timestamp:"2025-04-22T19:30:00", likes:4500 },
      { id:"R027b", author_id:"W064", author_handle:"@tripti.jha", content:"Water = girls in school. I have data for this. The moment water access is secured, attendance by girls goes up. Share the petition process — I need it for 3 Bihar villages.", timestamp:"2025-04-22T20:00:00", likes:3100 }
    ]
  },
  {
    id:"P028", author_id:"W023", author_name:"Nisha Malhotra", author_handle:"@nisha.malhotra",
    content:"My new urban housing project has zero steps at entrances, tactile paths, wide corridors for wheelchairs, and a women-only garden courtyard lit until midnight. This is what inclusive design means. Not a ramp slapped on at the end. #Architecture #InclusiveDesign #HECATEWomen",
    timestamp:"2025-04-23T14:00:00", likes:5400, reposts:3200, reply_count:367, tags:["architecture","inclusive","design","urban"],
    replies:[
      { id:"R028a", author_id:"W091", author_handle:"@meghna.s", content:"This is exactly what UX theory says about designing for edge cases — when you design for disability you design better for everyone. Please write this up as a case study.", timestamp:"2025-04-23T14:30:00", likes:1340 },
      { id:"R028b", author_id:"W027", author_handle:"@rohini.d", content:"Civil engineer here. The women-only courtyard lit until midnight detail is something we literally never think to spec. Noting this for every project going forward.", timestamp:"2025-04-23T15:00:00", likes:1120 }
    ]
  },
  {
    id:"P029", author_id:"W046", author_name:"Devyani Kulkarni", author_handle:"@devyani.k",
    content:"Opening night of my new play: 'The Witness'. Full house. Standing ovation. One woman in the front row was crying silently at the end. She found me afterward and said 'I thought I was alone.' That is the only review that matters. 🎭 #Theatre #Feminism #HECATEWomen",
    timestamp:"2025-04-21T23:00:00", likes:7200, reposts:4300, reply_count:521, tags:["theatre","feminism","arts","healing"],
    replies:[
      { id:"R029a", author_id:"W035", author_handle:"@anjali.mishra", content:"Art that makes someone feel less alone is the highest form of art. The standing ovation is lovely. That woman in the front row is the point.", timestamp:"2025-04-21T23:30:00", likes:2100 },
      { id:"R029b", author_id:"W013", author_handle:"@nandita.bose", content:"Music does the same thing. When I perform Rabindra Sangeet and see someone in the audience mouths moving with the words — knowing they carried that song silently for years. Art is community.", timestamp:"2025-04-22T00:00:00", likes:1780 }
    ]
  },
  {
    id:"P030", author_id:"W010", author_name:"Pooja Verma", author_handle:"@pooja.verma",
    content:"Policy update from the Ministry finally criminalises the practice we have fought for 7 years to end. 7 years. Some of the children we fought for are adults now. Late — yes. But done. Never give up. #ChildRights #NGO #Policy #HECATEWomen",
    timestamp:"2025-04-24T15:00:00", likes:18000, reposts:11000, reply_count:1340, tags:["childrights","policy","NGO","victory"],
    replies:[
      { id:"R030a", author_id:"W031", author_handle:"@tara.devi", content:"Seven years. I know this exhaustion. I know this victory. Both live in the body differently than anything else. Rest now, then keep going. 🙏", timestamp:"2025-04-24T15:20:00", likes:5600 },
      { id:"R030b", author_id:"W034", author_handle:"@kiran.b", content:"From law enforcement — policies like this change how we investigate, how we prosecute, how we protect. Your 7 years made our job possible. Thank you.", timestamp:"2025-04-24T15:45:00", likes:4100 },
      { id:"R030c", author_id:"W007", author_handle:"@meena.pillai", content:"Filing a follow-up PIL to ensure implementation guidelines are strong. Policy without enforcement is theatre. Let us make sure it sticks.", timestamp:"2025-04-24T16:00:00", likes:3200 }
    ]
  }
];

export default COMMUNITY_FEED;
