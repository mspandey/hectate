// ============================================================
// hectate — Female Criminal Lawyers Database (30 entries)
// Fields: id, name, title, college, quals[], specs[],
//         rating (1-5), total_reviews, experience_years,
//         location, reviews[]
// Ratings spread: 5★ x8, 4★ x7, 3★ x5, 2★ x5, 1★ x5
// ============================================================

export const LAWYERS_DATABASE = [

  // ── 5-STAR LAWYERS ──────────────────────────────────────────

  {
    id:"L001", name:"Adv. Rohini Deshmukh", title:"Senior Criminal Advocate & Former Additional Sessions Judge",
    college:"National Law School of India University, Bengaluru",
    quals:["LLB (Gold Medalist)","LLM Criminal Law","PhD in Evidence Law","Bar Council of Karnataka"],
    specs:["Cyber Crime","Domestic Violence","POCSO","Sexual Assault"],
    rating:5, total_reviews:234, experience_years:18, location:"Bengaluru, Karnataka",
    reviews:[
      { reviewer:"Riya K.", stars:5, date:"Apr 2025", text:"Exceptional command of courtroom procedure. Won my cyber harassment case in record time. She made me feel safe throughout." },
      { reviewer:"Smita L.", stars:5, date:"Mar 2025", text:"Most thorough legal mind I have encountered. Her cross-examination in the POCSO case was masterful. Unconditional recommendation." },
      { reviewer:"Kavitha S.", stars:5, date:"Feb 2025", text:"She fought for three years without giving up. Final verdict in our favour. I owe her everything." }
    ]
  },
  {
    id:"L002", name:"Adv. Meenakshi Iyer", title:"Criminal Defense Specialist & Supreme Court Advocate",
    college:"Faculty of Law, University of Delhi",
    quals:["LLB","LLM","PhD Law (Criminal Jurisprudence)","Enrolled Supreme Court of India"],
    specs:["Bail & Custody","Homicide Defense","White Collar Crime","Organised Crime"],
    rating:5, total_reviews:178, experience_years:21, location:"Delhi",
    reviews:[
      { reviewer:"Kavya N.", stars:5, date:"Apr 2025", text:"Secured bail for my sister within 48 hours of arrest in what everyone said was impossible. Professional, empathetic, and brilliant." },
      { reviewer:"Pooja V.", stars:5, date:"Mar 2025", text:"Handled a very complex homicide defense with intellectual grace and strategic precision. Acquittal secured." },
      { reviewer:"Radhika M.", stars:5, date:"Jan 2025", text:"Supreme Court appeal won. She is the best I have seen in 10 years of working adjacent to the legal field." }
    ]
  },
  {
    id:"L003", name:"Adv. Nirmala Bansal", title:"Criminal Defense Attorney & High Court Advocate",
    college:"Panjab University, Chandigarh",
    quals:["LLB","LLM","Certificate in Forensic Evidence","Certificate in Digital Crime"],
    specs:["Homicide","Domestic Violence","POCSO","Gang Crime"],
    rating:5, total_reviews:312, experience_years:24, location:"Chandigarh, Punjab",
    reviews:[
      { reviewer:"Lalitha R.", stars:5, date:"Apr 2025", text:"Absolute powerhouse in court. Cross-examined prosecution witnesses so effectively they contradicted themselves. Case dismissed." },
      { reviewer:"Shruti D.", stars:5, date:"Mar 2025", text:"Has a gift for reading judges. Her strategic instincts are extraordinary. Thirty-year-old case precedent cited and distinguished. Won." },
      { reviewer:"Ananya S.", stars:5, date:"Feb 2025", text:"She stayed in court until 11pm on a Friday to finish arguments. Her dedication is unlike anything I have seen." }
    ]
  },
  {
    id:"L004", name:"Adv. Parveen Sultana", title:"Criminal Rights Advocate & Human Rights Commissioner",
    college:"Jamia Millia Islamia, New Delhi",
    quals:["LLB","LLM Human Rights Law","Diploma in International Law","UNHRC Certified Trainer"],
    specs:["Cyber Crime","White Collar Crime","Homicide","Custodial Torture"],
    rating:5, total_reviews:156, experience_years:16, location:"Delhi",
    reviews:[
      { reviewer:"Meena P.", stars:5, date:"Mar 2025", text:"Fought a white collar fraud case for 2 years on contingency and won. She never stopped believing in the truth of my case." },
      { reviewer:"Tanvi S.", stars:5, date:"Feb 2025", text:"Her knowledge of international human rights law applied to domestic cases is unmatched. Multi-jurisdiction expertise." },
      { reviewer:"Riya K.", stars:5, date:"Dec 2024", text:"The way she dismantled the forensic expert testimony was clinical and devastating. Prosecution had no answer." }
    ]
  },
  {
    id:"L005", name:"Adv. Chameli Saxena", title:"High Court Criminal Advocate & Legal Aid Director",
    college:"Banaras Hindu University, Varanasi",
    quals:["LLB","LLM","PhD Criminology","Visiting Faculty — NLU Delhi"],
    specs:["Cyber Crime","Bail & Custody","White Collar Crime","Financial Fraud"],
    rating:5, total_reviews:267, experience_years:19, location:"Allahabad, Uttar Pradesh",
    reviews:[
      { reviewer:"Deepika J.", stars:5, date:"Mar 2025", text:"Secured bail in what the prison superintendent called a 'no bail' case. Her bail application was a work of legal art." },
      { reviewer:"Sonal G.", stars:5, date:"Feb 2025", text:"Thorough, responsive, strategic. Understanding of cyber crime provisions under IT Act and BNS is current and precise." },
      { reviewer:"Shraddha K.", stars:5, date:"Jan 2025", text:"She does free legal aid on Saturdays for rural women. The quality is the same as her paid work. Integrity personified." }
    ]
  },
  {
    id:"L006", name:"Adv. Vasundhara Krishnamurthy", title:"Criminal Advocate & POCSO Specialist",
    college:"Symbiosis Law School, Pune",
    quals:["LLB","LLM Child Rights","Diploma in Criminology","UNICEF Certified Child Rights Trainer"],
    specs:["POCSO","Domestic Violence","Bail & Custody","Child Trafficking"],
    rating:5, total_reviews:198, experience_years:14, location:"Pune, Maharashtra",
    reviews:[
      { reviewer:"Priya M.", stars:5, date:"Apr 2025", text:"She represented a trafficking survivor pro bono and secured conviction of all four accused. A fighter of the rarest kind." },
      { reviewer:"Vandana P.", stars:5, date:"Mar 2025", text:"Handled the case with the child's trauma as the central concern. Her approach to victim testimony protocol is a model for others." },
      { reviewer:"Pooja V.", stars:5, date:"Feb 2025", text:"Won a POCSO appeal that three other lawyers said was unwinnable. She found the evidentiary gap that everyone missed." }
    ]
  },
  {
    id:"L007", name:"Adv. Rekha Sundaram", title:"Supreme Court Advocate & Criminal Law Professor",
    college:"Government Law College, Mumbai",
    quals:["LLB (First Rank)","LLM","PhD Criminal Law","Adjunct Professor — ILS Law College Pune"],
    specs:["Homicide","Sexual Assault","Organised Crime","Death Penalty Defense"],
    rating:5, total_reviews:143, experience_years:27, location:"Mumbai, Maharashtra",
    reviews:[
      { reviewer:"Anjali M.", stars:5, date:"Apr 2025", text:"27 years in court and she still fights as if every case is her first. A living legend of the criminal bar." },
      { reviewer:"Ruchika M.", stars:5, date:"Mar 2025", text:"Argued a death penalty commutation at the Supreme Court and won. Her brief writing is published in legal journals." },
      { reviewer:"Meena P.", stars:5, date:"Jan 2025", text:"She mentors young women lawyers for free on weekends. A great lawyer AND a great human being." }
    ]
  },
  {
    id:"L008", name:"Adv. Girija Krishnan", title:"Public Prosecutor & Women's Crime Cell Head",
    college:"Kerala Law Academy, Thiruvananthapuram",
    quals:["LLB","LLM","Certificate in Forensic Science","Special Prosecutor — Women & Child Crimes"],
    specs:["Domestic Violence","Sexual Assault","POCSO","Acid Attack Cases"],
    rating:5, total_reviews:289, experience_years:22, location:"Kochi, Kerala",
    reviews:[
      { reviewer:"Kavitha M.", stars:5, date:"Apr 2025", text:"She prosecuted the acid attack case and made sure not a single loophole was left. Three convictions. Maximum sentence." },
      { reviewer:"Anita S.", stars:5, date:"Mar 2025", text:"As Women's Crime Cell head she restructured how victim testimony is recorded. Compassionate and fierce simultaneously." },
      { reviewer:"Gayatri M.", stars:5, date:"Feb 2025", text:"The fastest conviction I have seen in a DV case — 8 months. Her preparation was immaculate." }
    ]
  },

  // ── 4-STAR LAWYERS ──────────────────────────────────────────

  {
    id:"L009", name:"Adv. Sushma Bakshi", title:"Public Prosecutor, Sessions Court",
    college:"Symbiosis Law School, Pune",
    quals:["LLB","LLM","Diploma in Criminology"],
    specs:["Domestic Violence","POCSO","Bail & Custody"],
    rating:4, total_reviews:211, experience_years:13, location:"Pune, Maharashtra",
    reviews:[
      { reviewer:"Ananya S.", stars:4, date:"Mar 2025", text:"Very thorough and empathetic. Helped navigate a complex DV case with clarity. Slightly slow to return calls but the legal work was strong." },
      { reviewer:"Tanvi S.", stars:4, date:"Dec 2024", text:"Excellent preparation before trial. Delayed on some document filing but ultimately delivered conviction." },
      { reviewer:"Lalitha R.", stars:4, date:"Nov 2024", text:"Strong in victim advocacy. Some procedural missteps early on but corrected quickly. Good overall." }
    ]
  },
  {
    id:"L010", name:"Adv. Shobha Nair", title:"Criminal Defense Lawyer",
    college:"Government Law College, Ernakulam",
    quals:["LLB","LLM","Diploma in Human Rights"],
    specs:["Homicide","Bail & Custody","Organised Crime"],
    rating:4, total_reviews:134, experience_years:11, location:"Kochi, Kerala",
    reviews:[
      { reviewer:"Priya M.", stars:4, date:"Feb 2025", text:"Got my cousin acquitted on a serious charge. Preparation was thorough. Communication could be more proactive." },
      { reviewer:"Riya K.", stars:4, date:"Jan 2025", text:"Strong courtroom presence. Some delays in drafting bail application but the final product was excellent." },
      { reviewer:"Sonal G.", stars:4, date:"Nov 2024", text:"Solid knowledge of criminal procedure. Would recommend for serious matters." }
    ]
  },
  {
    id:"L011", name:"Adv. Devika Krishnaswamy", title:"Criminal Advocate & Legal Consultant",
    college:"Tamil Nadu Dr. Ambedkar Law University, Chennai",
    quals:["LLB","LLM","Diploma in Cyber Law"],
    specs:["Cyber Crime","White Collar Crime","Financial Fraud"],
    rating:4, total_reviews:89, experience_years:9, location:"Chennai, Tamil Nadu",
    reviews:[
      { reviewer:"Bhavana R.", stars:4, date:"Mar 2025", text:"Very sharp on cyber crime provisions. The only lawyer I found who actually understood the technical side of my case." },
      { reviewer:"Meghna S.", stars:4, date:"Feb 2025", text:"Good analytical mind. Sometimes over-explains technical aspects to clients but the strategy is sound." },
      { reviewer:"Komal R.", stars:4, date:"Jan 2025", text:"Handled an online fraud case well. The plea bargaining negotiation was particularly impressive." }
    ]
  },
  {
    id:"L012", name:"Adv. Priyanka Chatterjee", title:"Defense Advocate, High Court",
    college:"Calcutta University Law Department",
    quals:["LLB","LLM","Certificate in Forensic Evidence"],
    specs:["Homicide","Sexual Assault","POCSO"],
    rating:4, total_reviews:167, experience_years:15, location:"Kolkata, West Bengal",
    reviews:[
      { reviewer:"Ishita B.", stars:4, date:"Apr 2025", text:"Tenacious advocate. Won an appeal that my family had given up on. Some billing communication issues early on." },
      { reviewer:"Aditi G.", stars:4, date:"Mar 2025", text:"Strong research background — cited precedents even the judge was not aware of. Impressive preparation." },
      { reviewer:"Sunanda G.", stars:4, date:"Jan 2025", text:"Handled a sensitive sexual assault case with great care for the survivor. Professionalism throughout." }
    ]
  },
  {
    id:"L013", name:"Adv. Kavitha Rajan", title:"Criminal Advocate & NGO Legal Advisor",
    college:"School of Excellence in Law, Chennai",
    quals:["LLB","LLM","Diploma in Child Rights"],
    specs:["Domestic Violence","Bail & Custody","Child Trafficking"],
    rating:4, total_reviews:78, experience_years:8, location:"Madurai, Tamil Nadu",
    reviews:[
      { reviewer:"Preethi S.", stars:4, date:"Feb 2025", text:"Excellent for DV cases. Very sensitive to the emotional needs of clients alongside the legal. Response times could be better." },
      { reviewer:"Sangeetha P.", stars:4, date:"Jan 2025", text:"Got a protective order extended that the lower court had refused. Creative legal argument." },
      { reviewer:"Jayalakshmi R.", stars:4, date:"Dec 2024", text:"Good heart, strong knowledge. Slightly inconsistent in updating clients on case progress." }
    ]
  },
  {
    id:"L014", name:"Adv. Saraswati Hegde", title:"Criminal Lawyer & Women's Legal Cell Coordinator",
    college:"Karnataka State Law University, Hubli",
    quals:["LLB","LLM","Certificate in Victimology"],
    specs:["Sexual Assault","Domestic Violence","Organised Crime"],
    rating:4, total_reviews:122, experience_years:12, location:"Dharwad, Karnataka",
    reviews:[
      { reviewer:"Shilpa H.", stars:4, date:"Mar 2025", text:"Handled my case with absolute discretion and dignity. Court appearances were authoritative." },
      { reviewer:"Divyashree P.", stars:4, date:"Feb 2025", text:"Organised crime case — she was fearless before a very hostile bench. Respect." },
      { reviewer:"Kaveri S.", stars:3, date:"Jan 2025", text:"Capable lawyer. The timeline she promised was not met but the outcome was acceptable." }
    ]
  },
  {
    id:"L015", name:"Adv. Zubeda Ansari", title:"Criminal Defense Advocate",
    college:"Dr. BR Ambedkar College of Law, Aurangabad",
    quals:["LLB","LLM","Diploma in International Human Rights"],
    specs:["Bail & Custody","POCSO","White Collar Crime"],
    rating:4, total_reviews:93, experience_years:10, location:"Aurangabad, Maharashtra",
    reviews:[
      { reviewer:"Shraddha K.", stars:4, date:"Apr 2025", text:"Won bail in less than 72 hours. Her knowledge of bail jurisprudence under the new BNS is excellent." },
      { reviewer:"Vandana P.", stars:4, date:"Mar 2025", text:"Very client-oriented. Takes time to explain every step. Sometimes takes on too many cases at once." },
      { reviewer:"Bhavana R.", stars:4, date:"Feb 2025", text:"Solid track record on POCSO. The conviction she secured in our case was airtight." }
    ]
  },

  // ── 3-STAR LAWYERS ──────────────────────────────────────────

  {
    id:"L016", name:"Adv. Geetanjali Sharma", title:"Criminal Advocate",
    college:"University of Rajasthan, Jaipur",
    quals:["LLB","Certificate in Cyber Law"],
    specs:["Cyber Crime","Domestic Violence"],
    rating:3, total_reviews:54, experience_years:7, location:"Jaipur, Rajasthan",
    reviews:[
      { reviewer:"Deepika J.", stars:3, date:"Jan 2025", text:"Average representation. Got the job done but lacked the aggressive advocacy the case needed." },
      { reviewer:"Riya K.", stars:3, date:"Oct 2024", text:"Decent procedural knowledge. Courtroom performance was not particularly compelling." },
      { reviewer:"Payal S.", stars:3, date:"Sep 2024", text:"Neither excellent nor poor. The case outcome was fair but I do not feel it was the best possible result." }
    ]
  },
  {
    id:"L017", name:"Adv. Leela Choudhary", title:"Criminal Advocate & Legal Aid Lawyer",
    college:"Mohanlal Sukhadia University, Udaipur",
    quals:["LLB","Diploma in Criminal Law"],
    specs:["Homicide","Bail & Custody"],
    rating:3, total_reviews:41, experience_years:6, location:"Udaipur, Rajasthan",
    reviews:[
      { reviewer:"Pallavi C.", stars:3, date:"Feb 2025", text:"Adequate representation. She knows the basics but lacks finesse in complex matters. Good for simpler cases." },
      { reviewer:"Bhumi S.", stars:3, date:"Dec 2024", text:"Showed up prepared but the arguments in court were not persuasive enough. Outcome was okay, not great." },
      { reviewer:"Vibha K.", stars:2, date:"Nov 2024", text:"Had to follow up repeatedly for updates. Professional but passive in advocacy." }
    ]
  },
  {
    id:"L018", name:"Adv. Meghali Biswas", title:"Defense Lawyer",
    college:"Burdwan University Law Faculty",
    quals:["LLB","LLM"],
    specs:["POCSO","Sexual Assault","Domestic Violence"],
    rating:3, total_reviews:67, experience_years:8, location:"Burdwan, West Bengal",
    reviews:[
      { reviewer:"Aditi G.", stars:3, date:"Mar 2025", text:"Handled a POCSO matter. The legal knowledge is there but the courtroom confidence needs development." },
      { reviewer:"Tanuja P.", stars:3, date:"Feb 2025", text:"Competent. The outcome of the DV case was satisfactory but I expected more from the trial cross examination." },
      { reviewer:"Ishita B.", stars:3, date:"Jan 2025", text:"Good listener and empathetic. Not the strongest advocate in the room but thorough in preparation." }
    ]
  },
  {
    id:"L019", name:"Adv. Ambika Pillai", title:"Criminal Advocate",
    college:"Mahatma Gandhi University, Kottayam",
    quals:["LLB","Diploma in Victim Assistance"],
    specs:["Domestic Violence","Bail & Custody"],
    rating:3, total_reviews:38, experience_years:5, location:"Kottayam, Kerala",
    reviews:[
      { reviewer:"Gayatri M.", stars:3, date:"Jan 2025", text:"Early in career but showing promise. Needed guidance mid-case which raised concerns for me as a client." },
      { reviewer:"Kavitha M.", stars:3, date:"Dec 2024", text:"The case was handled but with more delays than necessary. Communication was acceptable." },
      { reviewer:"Lekha P.", stars:3, date:"Nov 2024", text:"She worked hard. Results were mixed. I would recommend her only for less complex matters currently." }
    ]
  },
  {
    id:"L020", name:"Adv. Simi Thomas", title:"Criminal Lawyer & District Court Advocate",
    college:"Kerala Law Academy, Thrissur Campus",
    quals:["LLB","Certificate in Family and Criminal Law"],
    specs:["Domestic Violence","POCSO","Bail & Custody"],
    rating:3, total_reviews:29, experience_years:4, location:"Thrissur, Kerala",
    reviews:[
      { reviewer:"Kavitha M.", stars:3, date:"Mar 2025", text:"Handled a DV filing competently. Some confusion about bail provision amendments under the new code." },
      { reviewer:"Swetha N.", stars:3, date:"Feb 2025", text:"Adequate for district court matters. Would not recommend for High Court or above currently." },
      { reviewer:"Aparna P.", stars:3, date:"Jan 2025", text:"Responsive and punctual. Legal arguments were conservative — safe but not creative." }
    ]
  },

  // ── 2-STAR LAWYERS ──────────────────────────────────────────

  {
    id:"L021", name:"Adv. Laxmi Choudhary", title:"Advocate & Legal Consultant",
    college:"Gujarat National Law University, Gandhinagar",
    quals:["LLB","LLM","MBA Legal"],
    specs:["White Collar Crime","Cyber Crime","Bail & Custody"],
    rating:2, total_reviews:31, experience_years:6, location:"Surat, Gujarat",
    reviews:[
      { reviewer:"Shruti D.", stars:2, date:"Feb 2025", text:"Did not adequately prepare cross-examination questions. Prosecution tore apart our defense in 20 minutes." },
      { reviewer:"Pooja V.", stars:2, date:"Dec 2024", text:"Missed key forensic evidence that could have changed the outcome. Deeply disappointing." },
      { reviewer:"Usha P.", stars:2, date:"Nov 2024", text:"Good presentation skills but the legal strategy had critical gaps. Not recommended for serious matters." }
    ]
  },
  {
    id:"L022", name:"Adv. Kalpana Rao", title:"Junior Criminal Advocate",
    college:"Osmania University, Hyderabad",
    quals:["LLB"],
    specs:["Domestic Violence","Bail & Custody"],
    rating:2, total_reviews:19, experience_years:3, location:"Hyderabad, Telangana",
    reviews:[
      { reviewer:"Bhavana R.", stars:2, date:"Jan 2025", text:"Very new to practice. Needed to look up basic sections during consultation which is concerning." },
      { reviewer:"Malvika R.", stars:2, date:"Nov 2024", text:"Case delayed significantly due to procedural knowledge gaps. Outcome was not what it should have been." },
      { reviewer:"Rashida B.", stars:2, date:"Oct 2024", text:"Lacked confidence in court. The judge had to correct her on procedure twice during hearing." }
    ]
  },
  {
    id:"L023", name:"Adv. Pushpa Reddy", title:"Criminal Defense Advocate",
    college:"Andhra University, Visakhapatnam",
    quals:["LLB","Diploma in Constitutional Law"],
    specs:["Homicide","Sexual Assault"],
    rating:2, total_reviews:22, experience_years:5, location:"Visakhapatnam, Andhra Pradesh",
    reviews:[
      { reviewer:"Padmavathi R.", stars:2, date:"Feb 2025", text:"Took on a homicide case and clearly was not experienced enough. The bail application was rejected on basic grounds." },
      { reviewer:"Bhumi S.", stars:2, date:"Jan 2025", text:"Professional in manner but weak in substance. Lost a bail application that should have been straightforward." },
      { reviewer:"Sunanda G.", stars:2, date:"Dec 2024", text:"The witness list she prepared was incomplete. We discovered it on the day of trial." }
    ]
  },
  {
    id:"L024", name:"Adv. Bindu Mehta", title:"Criminal Advocate",
    college:"Faculty of Law, Rajasthan University",
    quals:["LLB"],
    specs:["Bail & Custody","White Collar Crime"],
    rating:2, total_reviews:17, experience_years:4, location:"Jodhpur, Rajasthan",
    reviews:[
      { reviewer:"Bhumi S.", stars:2, date:"Feb 2025", text:"Filed documents incorrectly and had to refile. Cost us a hearing date. Very avoidable error." },
      { reviewer:"Vibha K.", stars:2, date:"Jan 2025", text:"Overpromised and under-delivered. The bail was eventually secured but through a different approach than she proposed." },
      { reviewer:"Pallavi C.", stars:2, date:"Nov 2024", text:"Not responsive enough and the legal strategy was not clearly explained to us at any point." }
    ]
  },
  {
    id:"L025", name:"Adv. Meera Tripathi", title:"Legal Aid Advocate",
    college:"University of Lucknow Law Faculty",
    quals:["LLB","Diploma in Legal Aid"],
    specs:["Domestic Violence","POCSO"],
    rating:2, total_reviews:14, experience_years:3, location:"Lucknow, Uttar Pradesh",
    reviews:[
      { reviewer:"Anjali M.", stars:2, date:"Mar 2025", text:"Communication broke down completely by the second month. Had to chase her for every update." },
      { reviewer:"Aarti P.", stars:2, date:"Feb 2025", text:"The FIR drafting had factual errors that could have seriously harmed the case. Too many basics missed." },
      { reviewer:"Nitu S.", stars:2, date:"Jan 2025", text:"I understand she is learning but clients with urgent cases cannot be practice ground. Not ready for serious matters." }
    ]
  },

  // ── 1-STAR LAWYERS ──────────────────────────────────────────

  {
    id:"L026", name:"Adv. Taramati Hegde", title:"Criminal Advocate",
    college:"Karnataka State Law University, Hubli",
    quals:["LLB","Diploma in Criminology"],
    specs:["Homicide","POCSO"],
    rating:1, total_reviews:8, experience_years:4, location:"Hubli, Karnataka",
    reviews:[
      { reviewer:"Tanvi S.", stars:1, date:"Mar 2025", text:"Showed up to hearing completely unprepared. Did not know the relevant BNS sections. Embarrassed in court by the judge." },
      { reviewer:"Ananya S.", stars:1, date:"Feb 2025", text:"Lost what should have been a winnable case through sheer negligence. The evidence she failed to file was decisive." },
      { reviewer:"Shilpa H.", stars:1, date:"Jan 2025", text:"Unreachable for days before an important hearing. We had to request an adjournment. Do not hire." }
    ]
  },
  {
    id:"L027", name:"Adv. Bindiya Tomar", title:"Legal Aid Advocate",
    college:"Chaudhary Charan Singh University, Meerut",
    quals:["LLB"],
    specs:["White Collar Crime","Cyber Crime"],
    rating:1, total_reviews:12, experience_years:2, location:"Meerut, Uttar Pradesh",
    reviews:[
      { reviewer:"Priya M.", stars:1, date:"Jan 2025", text:"Did not file documents on time resulting in a dismissed petition. A basic procedural failure with enormous consequences." },
      { reviewer:"Riya K.", stars:2, date:"Dec 2024", text:"Communication broke down entirely midway. We had no idea what was happening with our case for three weeks." },
      { reviewer:"Aarti P.", stars:1, date:"Nov 2024", text:"Gave legal advice that contradicted established case law. Had to change lawyers urgently to repair the damage." }
    ]
  },
  {
    id:"L028", name:"Adv. Savitri Pandey", title:"Criminal Advocate",
    college:"Mahatma Gandhi Kashi Vidyapith, Varanasi",
    quals:["LLB"],
    specs:["Domestic Violence","Bail & Custody"],
    rating:1, total_reviews:6, experience_years:3, location:"Varanasi, Uttar Pradesh",
    reviews:[
      { reviewer:"Archana T.", stars:1, date:"Feb 2025", text:"Appeared in court without having read the charge sheet. The session judge was visibly frustrated with her." },
      { reviewer:"Hema Y.", stars:1, date:"Jan 2025", text:"Gave wrong legal advice about the bail conditions. We relied on it and faced serious consequences." },
      { reviewer:"Nitu S.", stars:1, date:"Dec 2024", text:"Do not hire. Did not appear for one hearing without informing us. Case suffered as a result." }
    ]
  },
  {
    id:"L029", name:"Adv. Rajni Pal", title:"Junior Advocate",
    college:"Guru Nanak Dev University Law Department, Amritsar",
    quals:["LLB"],
    specs:["Bail & Custody","POCSO"],
    rating:1, total_reviews:9, experience_years:2, location:"Amritsar, Punjab",
    reviews:[
      { reviewer:"Harpreet K.", stars:1, date:"Mar 2025", text:"Too inexperienced for the matters she is taking on. We paid for senior experience and got an intern quality service." },
      { reviewer:"Jyoti R.", stars:1, date:"Feb 2025", text:"Bail application had the wrong name of the accused throughout. Filed and rejected. Basic proofreading failure." },
      { reviewer:"Monisha S.", stars:1, date:"Jan 2025", text:"No strategy, no preparation, no results. Changed lawyers after month one." }
    ]
  },
  {
    id:"L030", name:"Adv. Kumari Saxena", title:"Criminal Defense Advocate",
    college:"Agra College of Law, Dr. Bhimrao Ambedkar University",
    quals:["LLB","Diploma in Criminal Procedure"],
    specs:["Homicide","White Collar Crime"],
    rating:1, total_reviews:7, experience_years:3, location:"Agra, Uttar Pradesh",
    reviews:[
      { reviewer:"Amrita S.", stars:1, date:"Mar 2025", text:"Misrepresented her experience level. The case required High Court expertise; she had only district court experience." },
      { reviewer:"Pooja V.", stars:1, date:"Feb 2025", text:"Charged senior fees for junior work. The prosecution exploited every gap she left in our defense." },
      { reviewer:"Rekha I.", stars:1, date:"Jan 2025", text:"Factually incorrect arguments made our position worse. Had to bring in a second counsel to course-correct." }
    ]
  }
];

export default LAWYERS_DATABASE;
