/**
 * Curated Educational YouTube Channels Directory
 * Sourced from wpacademy/educational-youtube-channels (MIT License)
 * Total: 190 channels across 14 categories.
 */

export interface EducationalYouTubeChannel {
  id: string;
  name: string;
  category: string;
  subscribers: string;
  subscriberCount: number;
  language: string;
  url: string;
}

export const EDUCATIONAL_YOUTUBE_CHANNEL_CATEGORIES: string[] = [
  "Programming & Coding",
  "AI & Automation",
  "Machine Learning & Data Science",
  "Game Development",
  "Mobile App Development",
  "UI/UX Design",
  "Graphic & Design",
  "Cybersecurity",
  "DevOps & Cloud Computing",
  "Blockchain & Web3",
  "Digital Marketing & SEO",
  "Electronics & IoT",
  "Science & Mathematics",
  "Chemistry"
];

export const EDUCATIONAL_YOUTUBE_CHANNEL_LANGUAGES: string[] = [
  "English",
  "Hindi",
  "Urdu",
  "English/Hindi"
];

export const EDUCATIONAL_YOUTUBE_CHANNELS: EducationalYouTubeChannel[] = [
  {
    "id": "yt-ch-001-freecodecamp-org",
    "name": "freeCodeCamp.org",
    "category": "Programming & Coding",
    "subscribers": "11.4M",
    "subscriberCount": 11400000,
    "language": "English",
    "url": "https://www.youtube.com/c/Freecodecamp"
  },
  {
    "id": "yt-ch-002-3blue1brown",
    "name": "3Blue1Brown",
    "category": "Programming & Coding",
    "subscribers": "7.4M",
    "subscriberCount": 7400000,
    "language": "English",
    "url": "https://www.youtube.com/c/3blue1brown"
  },
  {
    "id": "yt-ch-003-programming-with-mosh",
    "name": "Programming with Mosh",
    "category": "Programming & Coding",
    "subscribers": "4.9M",
    "subscriberCount": 4900000,
    "language": "English",
    "url": "https://www.youtube.com/c/programmingwithmosh"
  },
  {
    "id": "yt-ch-004-fireship",
    "name": "Fireship",
    "category": "Programming & Coding",
    "subscribers": "4M",
    "subscriberCount": 4000000,
    "language": "English",
    "url": "https://www.youtube.com/c/Fireship"
  },
  {
    "id": "yt-ch-005-edureka",
    "name": "edureka!",
    "category": "Programming & Coding",
    "subscribers": "3.38M",
    "subscriberCount": 3380000,
    "language": "English",
    "url": "https://www.youtube.com/c/edurekaIN"
  },
  {
    "id": "yt-ch-006-bro-code",
    "name": "Bro Code",
    "category": "Programming & Coding",
    "subscribers": "3M",
    "subscriberCount": 3000000,
    "language": "English",
    "url": "https://www.youtube.com/c/BroCodez"
  },
  {
    "id": "yt-ch-007-codewithharry",
    "name": "CodeWithHarry",
    "category": "Programming & Coding",
    "subscribers": "2.9M",
    "subscriberCount": 2900000,
    "language": "Hindi",
    "url": "https://www.youtube.com/c/CodeWithHarry"
  },
  {
    "id": "yt-ch-008-thenewboston",
    "name": "thenewboston",
    "category": "Programming & Coding",
    "subscribers": "2.68M",
    "subscriberCount": 2680000,
    "language": "English",
    "url": "https://www.youtube.com/user/thenewboston"
  },
  {
    "id": "yt-ch-009-computerphile",
    "name": "Computerphile",
    "category": "Programming & Coding",
    "subscribers": "2.4M",
    "subscriberCount": 2400000,
    "language": "English",
    "url": "https://www.youtube.com/user/Computerphile"
  },
  {
    "id": "yt-ch-010-traversy-media",
    "name": "Traversy Media",
    "category": "Programming & Coding",
    "subscribers": "2.3M",
    "subscriberCount": 2300000,
    "language": "English",
    "url": "https://www.youtube.com/c/TraversyMedia"
  },
  {
    "id": "yt-ch-011-cs-dojo",
    "name": "CS Dojo",
    "category": "Programming & Coding",
    "subscribers": "1.8M",
    "subscriberCount": 1800000,
    "language": "English",
    "url": "https://www.youtube.com/c/CSDojo"
  },
  {
    "id": "yt-ch-012-the-net-ninja",
    "name": "The Net Ninja",
    "category": "Programming & Coding",
    "subscribers": "1.78M",
    "subscriberCount": 1780000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheNetNinja"
  },
  {
    "id": "yt-ch-013-the-coding-train",
    "name": "The Coding Train",
    "category": "Programming & Coding",
    "subscribers": "1.75M",
    "subscriberCount": 1750000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheCodingTrain"
  },
  {
    "id": "yt-ch-014-web-dev-simplified",
    "name": "Web Dev Simplified",
    "category": "Programming & Coding",
    "subscribers": "1.74M",
    "subscriberCount": 1740000,
    "language": "English",
    "url": "https://www.youtube.com/c/WebDevSimplified"
  },
  {
    "id": "yt-ch-015-brackeys",
    "name": "Brackeys",
    "category": "Programming & Coding",
    "subscribers": "1.6M",
    "subscriberCount": 1600000,
    "language": "English",
    "url": "https://www.youtube.com/c/Brackeys"
  },
  {
    "id": "yt-ch-016-derek-banas",
    "name": "Derek Banas",
    "category": "Programming & Coding",
    "subscribers": "1.3M",
    "subscriberCount": 1300000,
    "language": "English",
    "url": "https://www.youtube.com/c/derekbanas"
  },
  {
    "id": "yt-ch-017-programmingknowledge",
    "name": "ProgrammingKnowledge",
    "category": "Programming & Coding",
    "subscribers": "1.3M",
    "subscriberCount": 1300000,
    "language": "English",
    "url": "https://www.youtube.com/c/ProgrammingKnowledge"
  },
  {
    "id": "yt-ch-018-javascript-mastery",
    "name": "JavaScript Mastery",
    "category": "Programming & Coding",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/JavaScriptMastery"
  },
  {
    "id": "yt-ch-019-kevin-powell",
    "name": "Kevin Powell",
    "category": "Programming & Coding",
    "subscribers": "996K",
    "subscriberCount": 996000,
    "language": "English",
    "url": "https://www.youtube.com/kevinpowell"
  },
  {
    "id": "yt-ch-020-academind",
    "name": "Academind",
    "category": "Programming & Coding",
    "subscribers": "800K",
    "subscriberCount": 800000,
    "language": "English",
    "url": "https://www.youtube.com/c/Academind"
  },
  {
    "id": "yt-ch-021-learncode-academy",
    "name": "LearnCode.academy",
    "category": "Programming & Coding",
    "subscribers": "750K",
    "subscriberCount": 750000,
    "language": "English",
    "url": "https://www.youtube.com/c/learncodeacademy"
  },
  {
    "id": "yt-ch-022-hitesh-choudhary",
    "name": "Hitesh Choudhary",
    "category": "Programming & Coding",
    "subscribers": "700K",
    "subscriberCount": 700000,
    "language": "Hindi",
    "url": "https://www.youtube.com/c/HiteshChoudharydotcom"
  },
  {
    "id": "yt-ch-023-java-brains",
    "name": "Java Brains",
    "category": "Programming & Coding",
    "subscribers": "565K",
    "subscriberCount": 565000,
    "language": "English",
    "url": "https://www.youtube.com/c/JavaBrainsChannel"
  },
  {
    "id": "yt-ch-024-the-pragmatic-engineer",
    "name": "The Pragmatic Engineer",
    "category": "Programming & Coding",
    "subscribers": "500K",
    "subscriberCount": 500000,
    "language": "English",
    "url": "https://www.youtube.com/@ThePragmaticEngineer"
  },
  {
    "id": "yt-ch-025-coding-with-john",
    "name": "Coding with John",
    "category": "Programming & Coding",
    "subscribers": "485K",
    "subscriberCount": 485000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodingwithJohn"
  },
  {
    "id": "yt-ch-026-the-cherno",
    "name": "The Cherno",
    "category": "Programming & Coding",
    "subscribers": "485K",
    "subscriberCount": 485000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheChernoProject"
  },
  {
    "id": "yt-ch-027-leveluptuts",
    "name": "LevelUpTuts",
    "category": "Programming & Coding",
    "subscribers": "340K",
    "subscriberCount": 340000,
    "language": "English",
    "url": "https://www.youtube.com/c/LevelUpTuts"
  },
  {
    "id": "yt-ch-028-learnwebcode",
    "name": "LearnWebCode",
    "category": "Programming & Coding",
    "subscribers": "300K",
    "subscriberCount": 300000,
    "language": "English",
    "url": "https://www.youtube.com/user/LearnWebCode"
  },
  {
    "id": "yt-ch-029-codedamn",
    "name": "codedamn",
    "category": "Programming & Coding",
    "subscribers": "280K",
    "subscriberCount": 280000,
    "language": "English",
    "url": "https://www.youtube.com/c/codedamn"
  },
  {
    "id": "yt-ch-030-let-s-get-rusty",
    "name": "Let's Get Rusty",
    "category": "Programming & Coding",
    "subscribers": "180K",
    "subscriberCount": 180000,
    "language": "English",
    "url": "https://www.youtube.com/c/LetsGetRusty"
  },
  {
    "id": "yt-ch-031-learn-code-with-durgesh",
    "name": "Learn Code With Durgesh",
    "category": "Programming & Coding",
    "subscribers": "120K",
    "subscriberCount": 120000,
    "language": "Hindi",
    "url": "https://www.youtube.com/c/LearnCodeWithDurgesh"
  },
  {
    "id": "yt-ch-032-automate-the-boring-stuf",
    "name": "Automate the Boring Stuff",
    "category": "Programming & Coding",
    "subscribers": "122K",
    "subscriberCount": 122000,
    "language": "English",
    "url": "https://www.youtube.com/c/AutomatetheBoringStuff"
  },
  {
    "id": "yt-ch-033-chris-sean",
    "name": "Chris Sean",
    "category": "Programming & Coding",
    "subscribers": "110K",
    "subscriberCount": 110000,
    "language": "English",
    "url": "https://www.youtube.com/c/ChrisSean"
  },
  {
    "id": "yt-ch-034-ryan-peterman",
    "name": "Ryan Peterman",
    "category": "Programming & Coding",
    "subscribers": "25K",
    "subscriberCount": 25000,
    "language": "English",
    "url": "https://www.youtube.com/@RyanLPeterman"
  },
  {
    "id": "yt-ch-035-code-with-ahsan",
    "name": "Code with Ahsan",
    "category": "Programming & Coding",
    "subscribers": "8K",
    "subscriberCount": 8000,
    "language": "Urdu",
    "url": "https://www.youtube.com/c/CodewithAhsan"
  },
  {
    "id": "yt-ch-036-lex-fridman",
    "name": "Lex Fridman",
    "category": "AI & Automation",
    "subscribers": "4.6M",
    "subscriberCount": 4600000,
    "language": "English",
    "url": "https://www.youtube.com/c/lexfridman"
  },
  {
    "id": "yt-ch-037-two-minute-papers",
    "name": "Two Minute Papers",
    "category": "AI & Automation",
    "subscribers": "1.74M",
    "subscriberCount": 1740000,
    "language": "English",
    "url": "https://www.youtube.com/c/K%C3%A1rolyZsolnai"
  },
  {
    "id": "yt-ch-038-andrej-karpathy",
    "name": "Andrej Karpathy",
    "category": "AI & Automation",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/AndrejKarpathy"
  },
  {
    "id": "yt-ch-039-matt-wolfe",
    "name": "Matt Wolfe",
    "category": "AI & Automation",
    "subscribers": "900K",
    "subscriberCount": 900000,
    "language": "English",
    "url": "https://www.youtube.com/c/MattWolfe"
  },
  {
    "id": "yt-ch-040-yannic-kilcher",
    "name": "Yannic Kilcher",
    "category": "AI & Automation",
    "subscribers": "500K",
    "subscriberCount": 500000,
    "language": "English",
    "url": "https://www.youtube.com/c/YannicKilcher"
  },
  {
    "id": "yt-ch-041-ai-explained",
    "name": "AI Explained",
    "category": "AI & Automation",
    "subscribers": "500K",
    "subscriberCount": 500000,
    "language": "English",
    "url": "https://www.youtube.com/@aiexplained-official"
  },
  {
    "id": "yt-ch-042-dwarkesh-patel",
    "name": "Dwarkesh Patel",
    "category": "AI & Automation",
    "subscribers": "500K",
    "subscriberCount": 500000,
    "language": "English",
    "url": "https://www.youtube.com/@DwarkeshPatel"
  },
  {
    "id": "yt-ch-043-tina-huang",
    "name": "Tina Huang",
    "category": "AI & Automation",
    "subscribers": "400K",
    "subscriberCount": 400000,
    "language": "English",
    "url": "https://www.youtube.com/c/TinaHuang1"
  },
  {
    "id": "yt-ch-044-the-ai-grid",
    "name": "The AI Grid",
    "category": "AI & Automation",
    "subscribers": "374K",
    "subscriberCount": 374000,
    "language": "English",
    "url": "https://www.youtube.com/@TheAiGrid"
  },
  {
    "id": "yt-ch-045-liam-ottley",
    "name": "Liam Ottley",
    "category": "AI & Automation",
    "subscribers": "350K",
    "subscriberCount": 350000,
    "language": "English",
    "url": "https://www.youtube.com/@LiamOttley"
  },
  {
    "id": "yt-ch-046-deeplearning-ai",
    "name": "DeepLearning.AI",
    "category": "AI & Automation",
    "subscribers": "350K",
    "subscriberCount": 350000,
    "language": "English",
    "url": "https://www.youtube.com/c/Deeplearningai"
  },
  {
    "id": "yt-ch-047-black-mixture",
    "name": "Black Mixture",
    "category": "AI & Automation",
    "subscribers": "283K",
    "subscriberCount": 283000,
    "language": "English",
    "url": "https://www.youtube.com/@blackmixture"
  },
  {
    "id": "yt-ch-048-codeemporium",
    "name": "CodeEmporium",
    "category": "AI & Automation",
    "subscribers": "200K",
    "subscriberCount": 200000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodeEmporium"
  },
  {
    "id": "yt-ch-049-sam-witteveen-ai",
    "name": "Sam Witteveen AI",
    "category": "AI & Automation",
    "subscribers": "100K",
    "subscriberCount": 100000,
    "language": "English",
    "url": "https://www.youtube.com/@samwitteveenai"
  },
  {
    "id": "yt-ch-050-ai-foundations",
    "name": "AI Foundations",
    "category": "AI & Automation",
    "subscribers": "100K",
    "subscriberCount": 100000,
    "language": "English",
    "url": "https://www.youtube.com/@ai-foundations"
  },
  {
    "id": "yt-ch-051-corbin-brown",
    "name": "Corbin Brown",
    "category": "AI & Automation",
    "subscribers": "100K",
    "subscriberCount": 100000,
    "language": "English",
    "url": "https://www.youtube.com/@corbinbrown"
  },
  {
    "id": "yt-ch-052-creator-magic",
    "name": "Creator Magic",
    "category": "AI & Automation",
    "subscribers": "50K",
    "subscriberCount": 50000,
    "language": "English",
    "url": "https://www.youtube.com/@creatormagic"
  },
  {
    "id": "yt-ch-053-sentdex",
    "name": "Sentdex",
    "category": "Machine Learning & Data Science",
    "subscribers": "1.4M",
    "subscriberCount": 1400000,
    "language": "English",
    "url": "https://www.youtube.com/c/sentdex"
  },
  {
    "id": "yt-ch-054-krish-naik",
    "name": "Krish Naik",
    "category": "Machine Learning & Data Science",
    "subscribers": "1.2M",
    "subscriberCount": 1200000,
    "language": "English/Hindi",
    "url": "https://www.youtube.com/user/krishnaaborade"
  },
  {
    "id": "yt-ch-055-statquest-with-josh-star",
    "name": "StatQuest with Josh Starmer",
    "category": "Machine Learning & Data Science",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/joshstarmer"
  },
  {
    "id": "yt-ch-056-corey-schafer",
    "name": "Corey Schafer",
    "category": "Machine Learning & Data Science",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/Coreyms"
  },
  {
    "id": "yt-ch-057-alex-the-analyst",
    "name": "Alex The Analyst",
    "category": "Machine Learning & Data Science",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/AlexTheAnalyst"
  },
  {
    "id": "yt-ch-058-365-data-science",
    "name": "365 Data Science",
    "category": "Machine Learning & Data Science",
    "subscribers": "353K",
    "subscriberCount": 353000,
    "language": "English",
    "url": "https://www.youtube.com/c/365DataScience"
  },
  {
    "id": "yt-ch-059-ken-jee",
    "name": "Ken Jee",
    "category": "Machine Learning & Data Science",
    "subscribers": "260K",
    "subscriberCount": 260000,
    "language": "English",
    "url": "https://www.youtube.com/c/KenJee1"
  },
  {
    "id": "yt-ch-060-data-school",
    "name": "Data School",
    "category": "Machine Learning & Data Science",
    "subscribers": "257K",
    "subscriberCount": 257000,
    "language": "English",
    "url": "https://www.youtube.com/c/dataschool"
  },
  {
    "id": "yt-ch-061-data-professor",
    "name": "Data Professor",
    "category": "Machine Learning & Data Science",
    "subscribers": "250K",
    "subscriberCount": 250000,
    "language": "English",
    "url": "https://www.youtube.com/c/DataProfessor"
  },
  {
    "id": "yt-ch-062-datacamp",
    "name": "DataCamp",
    "category": "Machine Learning & Data Science",
    "subscribers": "195K",
    "subscriberCount": 195000,
    "language": "English",
    "url": "https://www.youtube.com/c/Datacamp"
  },
  {
    "id": "yt-ch-063-codebasics",
    "name": "codebasics",
    "category": "Machine Learning & Data Science",
    "subscribers": "200K",
    "subscriberCount": 200000,
    "language": "English",
    "url": "https://www.youtube.com/c/codebasics"
  },
  {
    "id": "yt-ch-064-agha-ali-raza",
    "name": "Agha Ali Raza",
    "category": "Machine Learning & Data Science",
    "subscribers": "603",
    "subscriberCount": 603,
    "language": "Urdu",
    "url": "https://www.youtube.com/user/agha999"
  },
  {
    "id": "yt-ch-065-extra-credits",
    "name": "Extra Credits",
    "category": "Game Development",
    "subscribers": "2M",
    "subscriberCount": 2000000,
    "language": "English",
    "url": "https://www.youtube.com/c/ExtraCredits"
  },
  {
    "id": "yt-ch-066-brackeys",
    "name": "Brackeys",
    "category": "Game Development",
    "subscribers": "1.9M",
    "subscriberCount": 1900000,
    "language": "English",
    "url": "https://www.youtube.com/c/Brackeys"
  },
  {
    "id": "yt-ch-067-game-maker-s-toolkit",
    "name": "Game Maker's Toolkit",
    "category": "Game Development",
    "subscribers": "1.5M",
    "subscriberCount": 1500000,
    "language": "English",
    "url": "https://www.youtube.com/c/MarkBrownGMT"
  },
  {
    "id": "yt-ch-068-sebastian-lague",
    "name": "Sebastian Lague",
    "category": "Game Development",
    "subscribers": "1.3M",
    "subscriberCount": 1300000,
    "language": "English",
    "url": "https://www.youtube.com/c/SebastianLague"
  },
  {
    "id": "yt-ch-069-gdc",
    "name": "GDC",
    "category": "Game Development",
    "subscribers": "548K",
    "subscriberCount": 548000,
    "language": "English",
    "url": "https://www.youtube.com/c/Gdconf"
  },
  {
    "id": "yt-ch-070-code-monkey",
    "name": "Code Monkey",
    "category": "Game Development",
    "subscribers": "450K",
    "subscriberCount": 450000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodeMonkeyUnity"
  },
  {
    "id": "yt-ch-071-gdquest",
    "name": "GDQuest",
    "category": "Game Development",
    "subscribers": "320K",
    "subscriberCount": 320000,
    "language": "English",
    "url": "https://www.youtube.com/c/Gdquest"
  },
  {
    "id": "yt-ch-072-heartbeast",
    "name": "Heartbeast",
    "category": "Game Development",
    "subscribers": "280K",
    "subscriberCount": 280000,
    "language": "English",
    "url": "https://www.youtube.com/c/uikiofficial"
  },
  {
    "id": "yt-ch-073-gamedev-tv",
    "name": "GameDev.tv",
    "category": "Game Development",
    "subscribers": "190K",
    "subscriberCount": 190000,
    "language": "English",
    "url": "https://www.youtube.com/c/GameDevTVChannel"
  },
  {
    "id": "yt-ch-074-awesome-tuts",
    "name": "Awesome Tuts",
    "category": "Game Development",
    "subscribers": "129K",
    "subscriberCount": 129000,
    "language": "English",
    "url": "https://www.youtube.com/c/AwesomeTuts"
  },
  {
    "id": "yt-ch-075-kidscancode",
    "name": "KidsCanCode",
    "category": "Game Development",
    "subscribers": "125K",
    "subscriberCount": 125000,
    "language": "English",
    "url": "https://www.youtube.com/c/KidsCanCodeOrg"
  },
  {
    "id": "yt-ch-076-devduck",
    "name": "DevDuck",
    "category": "Game Development",
    "subscribers": "100K",
    "subscriberCount": 100000,
    "language": "English",
    "url": "https://www.youtube.com/@devduck"
  },
  {
    "id": "yt-ch-077-android-developers",
    "name": "Android Developers",
    "category": "Mobile App Development",
    "subscribers": "1.4M",
    "subscriberCount": 1400000,
    "language": "English",
    "url": "https://www.youtube.com/c/AndroidDevelopers"
  },
  {
    "id": "yt-ch-078-flutter",
    "name": "Flutter",
    "category": "Mobile App Development",
    "subscribers": "980K",
    "subscriberCount": 980000,
    "language": "English",
    "url": "https://www.youtube.com/c/flutterdev"
  },
  {
    "id": "yt-ch-079-codewithchris",
    "name": "CodeWithChris",
    "category": "Mobile App Development",
    "subscribers": "600K",
    "subscriberCount": 600000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodeWithChris"
  },
  {
    "id": "yt-ch-080-coding-in-flow",
    "name": "Coding in Flow",
    "category": "Mobile App Development",
    "subscribers": "280K",
    "subscriberCount": 280000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodinginFlow"
  },
  {
    "id": "yt-ch-081-codingwithmitch",
    "name": "CodingWithMitch",
    "category": "Mobile App Development",
    "subscribers": "190K",
    "subscriberCount": 190000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodingWithMitch"
  },
  {
    "id": "yt-ch-082-london-app-brewery",
    "name": "London App Brewery",
    "category": "Mobile App Development",
    "subscribers": "165K",
    "subscriberCount": 165000,
    "language": "English",
    "url": "https://www.youtube.com/c/Londonappbrewery"
  },
  {
    "id": "yt-ch-083-code-with-andrea",
    "name": "Code with Andrea",
    "category": "Mobile App Development",
    "subscribers": "140K",
    "subscriberCount": 140000,
    "language": "English",
    "url": "https://www.youtube.com/c/CodeWithAndrea"
  },
  {
    "id": "yt-ch-084-kilo-loco",
    "name": "Kilo Loco",
    "category": "Mobile App Development",
    "subscribers": "95K",
    "subscriberCount": 95000,
    "language": "English",
    "url": "https://www.youtube.com/c/KiloLoco"
  },
  {
    "id": "yt-ch-085-santos-enoque",
    "name": "Santos Enoque",
    "category": "Mobile App Development",
    "subscribers": "85K",
    "subscriberCount": 85000,
    "language": "English",
    "url": "https://www.youtube.com/c/SantosEnoque"
  },
  {
    "id": "yt-ch-086-flux-academy",
    "name": "Flux Academy",
    "category": "UI/UX Design",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/FluxWithRanSegall"
  },
  {
    "id": "yt-ch-087-wes-mcdowell",
    "name": "Wes McDowell",
    "category": "UI/UX Design",
    "subscribers": "426K",
    "subscriberCount": 426000,
    "language": "English",
    "url": "https://www.youtube.com/c/WesMcDowell"
  },
  {
    "id": "yt-ch-088-figma",
    "name": "Figma",
    "category": "UI/UX Design",
    "subscribers": "400K",
    "subscriberCount": 400000,
    "language": "English",
    "url": "https://www.youtube.com/c/Figmadesign"
  },
  {
    "id": "yt-ch-089-mizko",
    "name": "Mizko",
    "category": "UI/UX Design",
    "subscribers": "53K",
    "subscriberCount": 53000,
    "language": "English",
    "url": "https://www.youtube.com/c/Mizko"
  },
  {
    "id": "yt-ch-090-sarah-doody",
    "name": "Sarah Doody",
    "category": "UI/UX Design",
    "subscribers": "34K",
    "subscriberCount": 34000,
    "language": "English",
    "url": "https://www.youtube.com/c/SarahDoody"
  },
  {
    "id": "yt-ch-091-caler-edwards",
    "name": "Caler Edwards",
    "category": "UI/UX Design",
    "subscribers": "50K",
    "subscriberCount": 50000,
    "language": "English",
    "url": "https://www.youtube.com/@CalerEdwards"
  },
  {
    "id": "yt-ch-092-piximperfect",
    "name": "PiXimperfect",
    "category": "Graphic & Design",
    "subscribers": "3.7M",
    "subscriberCount": 3700000,
    "language": "English",
    "url": "https://www.youtube.com/c/PiXimperfect"
  },
  {
    "id": "yt-ch-093-the-futur",
    "name": "The Futur",
    "category": "Graphic & Design",
    "subscribers": "1.96M",
    "subscriberCount": 1960000,
    "language": "English",
    "url": "https://www.youtube.com/user/TheSkoolRocks"
  },
  {
    "id": "yt-ch-094-gfxmentor",
    "name": "GFXMentor",
    "category": "Graphic & Design",
    "subscribers": "1.8M",
    "subscriberCount": 1800000,
    "language": "Urdu",
    "url": "https://www.youtube.com/c/GFXMentor"
  },
  {
    "id": "yt-ch-095-billi-4-you",
    "name": "Billi 4 You",
    "category": "Graphic & Design",
    "subscribers": "1.5M",
    "subscriberCount": 1500000,
    "language": "Hindi",
    "url": "https://www.youtube.com/c/Billi4You"
  },
  {
    "id": "yt-ch-096-tutvid",
    "name": "tutvid",
    "category": "Graphic & Design",
    "subscribers": "1.2M",
    "subscriberCount": 1200000,
    "language": "English",
    "url": "https://www.youtube.com/c/tutvid"
  },
  {
    "id": "yt-ch-097-satori-graphics",
    "name": "Satori Graphics",
    "category": "Graphic & Design",
    "subscribers": "940K",
    "subscriberCount": 940000,
    "language": "English",
    "url": "https://www.youtube.com/c/SatoriGraphics"
  },
  {
    "id": "yt-ch-098-designcourse",
    "name": "DesignCourse",
    "category": "Graphic & Design",
    "subscribers": "930K",
    "subscriberCount": 930000,
    "language": "English",
    "url": "https://www.youtube.com/c/DesignCourse"
  },
  {
    "id": "yt-ch-099-dansky",
    "name": "Dansky",
    "category": "Graphic & Design",
    "subscribers": "760K",
    "subscriberCount": 760000,
    "language": "English",
    "url": "https://www.youtube.com/c/ForeverDansky"
  },
  {
    "id": "yt-ch-100-will-paterson",
    "name": "Will Paterson",
    "category": "Graphic & Design",
    "subscribers": "630K",
    "subscriberCount": 630000,
    "language": "English",
    "url": "https://www.youtube.com/c/breakdesignsco"
  },
  {
    "id": "yt-ch-101-yes-i-m-a-designer",
    "name": "Yes I'm a Designer",
    "category": "Graphic & Design",
    "subscribers": "540K",
    "subscriberCount": 540000,
    "language": "English",
    "url": "https://www.youtube.com/c/YesImaDesigner"
  },
  {
    "id": "yt-ch-102-rajeev-mehta",
    "name": "Rajeev Mehta",
    "category": "Graphic & Design",
    "subscribers": "430K",
    "subscriberCount": 430000,
    "language": "Hindi",
    "url": "https://www.youtube.com/c/RajeevMehtaIN"
  },
  {
    "id": "yt-ch-103-bring-your-own-laptop",
    "name": "Bring Your Own Laptop",
    "category": "Graphic & Design",
    "subscribers": "370K",
    "subscriberCount": 370000,
    "language": "English",
    "url": "https://www.youtube.com/c/ByolAuAdobe"
  },
  {
    "id": "yt-ch-104-every-tuesday",
    "name": "Every Tuesday",
    "category": "Graphic & Design",
    "subscribers": "340K",
    "subscriberCount": 340000,
    "language": "English",
    "url": "https://www.youtube.com/c/EveryTuesday"
  },
  {
    "id": "yt-ch-105-vector-slate",
    "name": "Vector Slate",
    "category": "Graphic & Design",
    "subscribers": "290K",
    "subscriberCount": 290000,
    "language": "English",
    "url": "https://www.youtube.com/c/VectorSlateGraphicDesignTutorials"
  },
  {
    "id": "yt-ch-106-aj-smart",
    "name": "AJ&Smart",
    "category": "Graphic & Design",
    "subscribers": "260K",
    "subscriberCount": 260000,
    "language": "English",
    "url": "https://www.youtube.com/c/AJSmart"
  },
  {
    "id": "yt-ch-107-jesse-showalter",
    "name": "Jesse Showalter",
    "category": "Graphic & Design",
    "subscribers": "250K",
    "subscriberCount": 250000,
    "language": "English",
    "url": "https://www.youtube.com/c/JesseShowalter"
  },
  {
    "id": "yt-ch-108-pixel-bracket",
    "name": "Pixel & Bracket",
    "category": "Graphic & Design",
    "subscribers": "210K",
    "subscriberCount": 210000,
    "language": "English",
    "url": "https://www.youtube.com/c/Pixelandbracket"
  },
  {
    "id": "yt-ch-109-design-with-canva",
    "name": "Design with Canva",
    "category": "Graphic & Design",
    "subscribers": "180K",
    "subscriberCount": 180000,
    "language": "English",
    "url": "https://www.youtube.com/c/DesignwithCanva"
  },
  {
    "id": "yt-ch-110-graphic-design-with-elen",
    "name": "Graphic Design with Elena",
    "category": "Graphic & Design",
    "subscribers": "116K",
    "subscriberCount": 116000,
    "language": "English",
    "url": "https://www.youtube.com/c/GraphicDesignwithElena"
  },
  {
    "id": "yt-ch-111-nikhil-pawar",
    "name": "Nikhil Pawar",
    "category": "Graphic & Design",
    "subscribers": "115K",
    "subscriberCount": 115000,
    "language": "Hindi",
    "url": "https://www.youtube.com/c/NikhilPawarr"
  },
  {
    "id": "yt-ch-112-mike-locke",
    "name": "Mike Locke",
    "category": "Graphic & Design",
    "subscribers": "114K",
    "subscriberCount": 114000,
    "language": "English",
    "url": "https://www.youtube.com/user/mlwebco/"
  },
  {
    "id": "yt-ch-113-sketch-together",
    "name": "Sketch Together",
    "category": "Graphic & Design",
    "subscribers": "106K",
    "subscriberCount": 106000,
    "language": "English",
    "url": "https://www.youtube.com/c/SketchTogetherTV"
  },
  {
    "id": "yt-ch-114-punit-chawla",
    "name": "Punit Chawla",
    "category": "Graphic & Design",
    "subscribers": "103K",
    "subscriberCount": 103000,
    "language": "English",
    "url": "https://www.youtube.com/c/PunitChawla"
  },
  {
    "id": "yt-ch-115-design-academy",
    "name": "Design Academy",
    "category": "Graphic & Design",
    "subscribers": "90K",
    "subscriberCount": 90000,
    "language": "Urdu",
    "url": "https://www.youtube.com/c/DesignAcademyPK"
  },
  {
    "id": "yt-ch-116-hello-i-m-alexa",
    "name": "Hello, I'm Alexa",
    "category": "Graphic & Design",
    "subscribers": "23K",
    "subscriberCount": 23000,
    "language": "English",
    "url": "https://www.youtube.com/c/HelloImAlexa"
  },
  {
    "id": "yt-ch-117-networkchuck",
    "name": "NetworkChuck",
    "category": "Cybersecurity",
    "subscribers": "4M",
    "subscriberCount": 4000000,
    "language": "English",
    "url": "https://www.youtube.com/c/NetworkChuck"
  },
  {
    "id": "yt-ch-118-david-bombal",
    "name": "David Bombal",
    "category": "Cybersecurity",
    "subscribers": "2.5M",
    "subscriberCount": 2500000,
    "language": "English",
    "url": "https://www.youtube.com/c/DavidBombal"
  },
  {
    "id": "yt-ch-119-john-hammond",
    "name": "John Hammond",
    "category": "Cybersecurity",
    "subscribers": "2.1M",
    "subscriberCount": 2100000,
    "language": "English",
    "url": "https://www.youtube.com/c/JohnHammond010"
  },
  {
    "id": "yt-ch-120-professor-messer",
    "name": "Professor Messer",
    "category": "Cybersecurity",
    "subscribers": "1.8M",
    "subscriberCount": 1800000,
    "language": "English",
    "url": "https://www.youtube.com/c/professormesser"
  },
  {
    "id": "yt-ch-121-the-cyber-mentor",
    "name": "The Cyber Mentor",
    "category": "Cybersecurity",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheCyberMentor"
  },
  {
    "id": "yt-ch-122-hackersploit",
    "name": "HackerSploit",
    "category": "Cybersecurity",
    "subscribers": "800K",
    "subscriberCount": 800000,
    "language": "English",
    "url": "https://www.youtube.com/c/HackerSploit"
  },
  {
    "id": "yt-ch-123-hak5",
    "name": "Hak5",
    "category": "Cybersecurity",
    "subscribers": "800K",
    "subscriberCount": 800000,
    "language": "English",
    "url": "https://www.youtube.com/c/Hak5"
  },
  {
    "id": "yt-ch-124-null-byte",
    "name": "Null Byte",
    "category": "Cybersecurity",
    "subscribers": "600K",
    "subscriberCount": 600000,
    "language": "English",
    "url": "https://www.youtube.com/c/NullByteWHT"
  },
  {
    "id": "yt-ch-125-ippsec",
    "name": "IppSec",
    "category": "Cybersecurity",
    "subscribers": "400K",
    "subscriberCount": 400000,
    "language": "English",
    "url": "https://www.youtube.com/c/ippsec"
  },
  {
    "id": "yt-ch-126-lauriewired",
    "name": "LaurieWired",
    "category": "Cybersecurity",
    "subscribers": "429K",
    "subscriberCount": 429000,
    "language": "English",
    "url": "https://www.youtube.com/@lauriewired"
  },
  {
    "id": "yt-ch-127-zsecurity",
    "name": "zSecurity",
    "category": "Cybersecurity",
    "subscribers": "350K",
    "subscriberCount": 350000,
    "language": "English",
    "url": "https://www.youtube.com/c/zaborSecurity"
  },
  {
    "id": "yt-ch-128-grant-collins",
    "name": "Grant Collins",
    "category": "Cybersecurity",
    "subscribers": "230K",
    "subscriberCount": 230000,
    "language": "English",
    "url": "https://www.youtube.com/@GrantCollins"
  },
  {
    "id": "yt-ch-129-cyberspatial",
    "name": "Cyberspatial",
    "category": "Cybersecurity",
    "subscribers": "181K",
    "subscriberCount": 181000,
    "language": "English",
    "url": "https://www.youtube.com/@Cyberspatial"
  },
  {
    "id": "yt-ch-130-techworld-with-nana",
    "name": "TechWorld with Nana",
    "category": "DevOps & Cloud Computing",
    "subscribers": "1.4M",
    "subscriberCount": 1400000,
    "language": "English",
    "url": "https://www.youtube.com/c/TechWorldwithNana"
  },
  {
    "id": "yt-ch-131-amazon-web-services",
    "name": "Amazon Web Services",
    "category": "DevOps & Cloud Computing",
    "subscribers": "700K",
    "subscriberCount": 700000,
    "language": "English",
    "url": "https://www.youtube.com/c/amazonwebservices"
  },
  {
    "id": "yt-ch-132-microsoft-azure",
    "name": "Microsoft Azure",
    "category": "DevOps & Cloud Computing",
    "subscribers": "500K",
    "subscriberCount": 500000,
    "language": "English",
    "url": "https://www.youtube.com/c/MicrosoftAzure"
  },
  {
    "id": "yt-ch-133-kunal-kushwaha",
    "name": "Kunal Kushwaha",
    "category": "DevOps & Cloud Computing",
    "subscribers": "400K",
    "subscriberCount": 400000,
    "language": "English/Hindi",
    "url": "https://www.youtube.com/c/KunalKushwaha"
  },
  {
    "id": "yt-ch-134-aditya-devops-made-easy",
    "name": "Aditya (DevOps Made Easy)",
    "category": "DevOps & Cloud Computing",
    "subscribers": "233K",
    "subscriberCount": 233000,
    "language": "English",
    "url": "https://www.youtube.com/@intheclouds"
  },
  {
    "id": "yt-ch-135-stephane-maarek",
    "name": "Stephane Maarek",
    "category": "DevOps & Cloud Computing",
    "subscribers": "150K",
    "subscriberCount": 150000,
    "language": "English",
    "url": "https://www.youtube.com/c/StephaneMaarek"
  },
  {
    "id": "yt-ch-136-be-a-better-dev",
    "name": "Be A Better Dev",
    "category": "DevOps & Cloud Computing",
    "subscribers": "150K",
    "subscriberCount": 150000,
    "language": "English",
    "url": "https://www.youtube.com/c/BeABetterDev"
  },
  {
    "id": "yt-ch-137-docker",
    "name": "Docker",
    "category": "DevOps & Cloud Computing",
    "subscribers": "113K",
    "subscriberCount": 113000,
    "language": "English",
    "url": "https://www.youtube.com/c/DockerIo"
  },
  {
    "id": "yt-ch-138-that-devops-guy",
    "name": "That DevOps Guy",
    "category": "DevOps & Cloud Computing",
    "subscribers": "100K",
    "subscriberCount": 100000,
    "language": "English",
    "url": "https://www.youtube.com/@MarcelDempers"
  },
  {
    "id": "yt-ch-139-devops-directive",
    "name": "DevOps Directive",
    "category": "DevOps & Cloud Computing",
    "subscribers": "96K",
    "subscriberCount": 96000,
    "language": "English",
    "url": "https://www.youtube.com/c/DevOpsDirective"
  },
  {
    "id": "yt-ch-140-continuous-delivery",
    "name": "Continuous Delivery",
    "category": "DevOps & Cloud Computing",
    "subscribers": "200K",
    "subscriberCount": 200000,
    "language": "English",
    "url": "https://www.youtube.com/@ContinuousDelivery"
  },
  {
    "id": "yt-ch-141-coin-bureau",
    "name": "Coin Bureau",
    "category": "Blockchain & Web3",
    "subscribers": "2.5M",
    "subscriberCount": 2500000,
    "language": "English",
    "url": "https://www.youtube.com/c/CoinBureau"
  },
  {
    "id": "yt-ch-142-brian-jung",
    "name": "Brian Jung",
    "category": "Blockchain & Web3",
    "subscribers": "1.88M",
    "subscriberCount": 1880000,
    "language": "English",
    "url": "https://www.youtube.com/c/BrianJung"
  },
  {
    "id": "yt-ch-143-altcoin-daily",
    "name": "Altcoin Daily",
    "category": "Blockchain & Web3",
    "subscribers": "1.49M",
    "subscriberCount": 1490000,
    "language": "English",
    "url": "https://www.youtube.com/c/AltcoinDaily"
  },
  {
    "id": "yt-ch-144-alex-becker",
    "name": "Alex Becker",
    "category": "Blockchain & Web3",
    "subscribers": "1.44M",
    "subscriberCount": 1440000,
    "language": "English",
    "url": "https://www.youtube.com/c/AlexBeckerChannel"
  },
  {
    "id": "yt-ch-145-cryptosrus",
    "name": "CryptosRUs",
    "category": "Blockchain & Web3",
    "subscribers": "812K",
    "subscriberCount": 812000,
    "language": "English",
    "url": "https://www.youtube.com/c/CryptosRUs"
  },
  {
    "id": "yt-ch-146-the-moon",
    "name": "The Moon",
    "category": "Blockchain & Web3",
    "subscribers": "650K",
    "subscriberCount": 650000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheMoonCarl"
  },
  {
    "id": "yt-ch-147-lark-davis",
    "name": "Lark Davis",
    "category": "Blockchain & Web3",
    "subscribers": "640K",
    "subscriberCount": 640000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheCryptoLark"
  },
  {
    "id": "yt-ch-148-aantonop",
    "name": "Aantonop",
    "category": "Blockchain & Web3",
    "subscribers": "336K",
    "subscriberCount": 336000,
    "language": "English",
    "url": "https://www.youtube.com/c/aantonop"
  },
  {
    "id": "yt-ch-149-coinsider",
    "name": "Coinsider",
    "category": "Blockchain & Web3",
    "subscribers": "332K",
    "subscriberCount": 332000,
    "language": "English",
    "url": "https://www.youtube.com/@Coinsider"
  },
  {
    "id": "yt-ch-150-bankless",
    "name": "Bankless",
    "category": "Blockchain & Web3",
    "subscribers": "276K",
    "subscriberCount": 276000,
    "language": "English",
    "url": "https://www.youtube.com/c/Bankless"
  },
  {
    "id": "yt-ch-151-garyvee",
    "name": "GaryVee",
    "category": "Digital Marketing & SEO",
    "subscribers": "4.7M",
    "subscriberCount": 4700000,
    "language": "English",
    "url": "https://www.youtube.com/c/garyvee"
  },
  {
    "id": "yt-ch-152-neil-patel",
    "name": "Neil Patel",
    "category": "Digital Marketing & SEO",
    "subscribers": "620K",
    "subscriberCount": 620000,
    "language": "English",
    "url": "https://www.youtube.com/c/NeilPatel"
  },
  {
    "id": "yt-ch-153-ahrefs",
    "name": "Ahrefs",
    "category": "Digital Marketing & SEO",
    "subscribers": "450K",
    "subscriberCount": 450000,
    "language": "English",
    "url": "https://www.youtube.com/c/AhrefsCom"
  },
  {
    "id": "yt-ch-154-google-search-central",
    "name": "Google Search Central",
    "category": "Digital Marketing & SEO",
    "subscribers": "250K",
    "subscriberCount": 250000,
    "language": "English",
    "url": "https://www.youtube.com/c/GoogleSearchCentral"
  },
  {
    "id": "yt-ch-155-semrush",
    "name": "Semrush",
    "category": "Digital Marketing & SEO",
    "subscribers": "200K",
    "subscriberCount": 200000,
    "language": "English",
    "url": "https://www.youtube.com/c/Semrush"
  },
  {
    "id": "yt-ch-156-brian-dean",
    "name": "Brian Dean",
    "category": "Digital Marketing & SEO",
    "subscribers": "200K",
    "subscriberCount": 200000,
    "language": "English",
    "url": "https://www.youtube.com/c/BrianDean"
  },
  {
    "id": "yt-ch-157-nathan-gotch",
    "name": "Nathan Gotch",
    "category": "Digital Marketing & SEO",
    "subscribers": "150K",
    "subscriberCount": 150000,
    "language": "English",
    "url": "https://www.youtube.com/c/GotchSEO"
  },
  {
    "id": "yt-ch-158-matt-diggity",
    "name": "Matt Diggity",
    "category": "Digital Marketing & SEO",
    "subscribers": "100K",
    "subscriberCount": 100000,
    "language": "English",
    "url": "https://www.youtube.com/c/MattDiggity"
  },
  {
    "id": "yt-ch-159-moz",
    "name": "Moz",
    "category": "Digital Marketing & SEO",
    "subscribers": "98K",
    "subscriberCount": 98000,
    "language": "English",
    "url": "https://www.youtube.com/c/Moz"
  },
  {
    "id": "yt-ch-160-rank-math-seo",
    "name": "Rank Math SEO",
    "category": "Digital Marketing & SEO",
    "subscribers": "80K",
    "subscriberCount": 80000,
    "language": "English",
    "url": "https://www.youtube.com/c/RankMathSEO"
  },
  {
    "id": "yt-ch-161-electroboom",
    "name": "ElectroBOOM",
    "category": "Electronics & IoT",
    "subscribers": "8.6M",
    "subscriberCount": 8600000,
    "language": "English",
    "url": "https://www.youtube.com/c/Electroboom"
  },
  {
    "id": "yt-ch-162-techmoan",
    "name": "Techmoan",
    "category": "Electronics & IoT",
    "subscribers": "1.45M",
    "subscriberCount": 1450000,
    "language": "English",
    "url": "https://www.youtube.com/@Techmoan"
  },
  {
    "id": "yt-ch-163-technology-connections",
    "name": "Technology Connections",
    "category": "Electronics & IoT",
    "subscribers": "3.1M",
    "subscriberCount": 3100000,
    "language": "English",
    "url": "https://www.youtube.com/@TechnologyConnections"
  },
  {
    "id": "yt-ch-164-greatscott",
    "name": "GreatScott!",
    "category": "Electronics & IoT",
    "subscribers": "1.4M",
    "subscriberCount": 1400000,
    "language": "English",
    "url": "https://www.youtube.com/c/greatscottlab"
  },
  {
    "id": "yt-ch-165-explainingcomputers",
    "name": "ExplainingComputers",
    "category": "Electronics & IoT",
    "subscribers": "985K",
    "subscriberCount": 985000,
    "language": "English",
    "url": "https://www.youtube.com/c/ExplainingComputers"
  },
  {
    "id": "yt-ch-166-element14-presents",
    "name": "element14 presents",
    "category": "Electronics & IoT",
    "subscribers": "765K",
    "subscriberCount": 765000,
    "language": "English",
    "url": "https://www.youtube.com/c/element14presents"
  },
  {
    "id": "yt-ch-167-dronebot-workshop",
    "name": "DroneBot Workshop",
    "category": "Electronics & IoT",
    "subscribers": "657K",
    "subscriberCount": 657000,
    "language": "English",
    "url": "https://www.youtube.com/c/Dronebotworkshop1"
  },
  {
    "id": "yt-ch-168-paul-mcwhorter",
    "name": "Paul McWhorter",
    "category": "Electronics & IoT",
    "subscribers": "423K",
    "subscriberCount": 423000,
    "language": "English",
    "url": "https://www.youtube.com/c/PaulMcWhorter"
  },
  {
    "id": "yt-ch-169-jeff-geerling",
    "name": "Jeff Geerling",
    "category": "Electronics & IoT",
    "subscribers": "400K",
    "subscriberCount": 400000,
    "language": "English",
    "url": "https://www.youtube.com/c/JeffGeerling"
  },
  {
    "id": "yt-ch-170-sparkfun-electronics",
    "name": "SparkFun Electronics",
    "category": "Electronics & IoT",
    "subscribers": "244K",
    "subscriberCount": 244000,
    "language": "English",
    "url": "https://www.youtube.com/c/sparkfun"
  },
  {
    "id": "yt-ch-171-raspberry-pi",
    "name": "Raspberry Pi",
    "category": "Electronics & IoT",
    "subscribers": "172K",
    "subscriberCount": 172000,
    "language": "English",
    "url": "https://www.youtube.com/c/RaspberryPiFoundation"
  },
  {
    "id": "yt-ch-172-mert-arduino-and-tech",
    "name": "Mert Arduino and Tech",
    "category": "Electronics & IoT",
    "subscribers": "171K",
    "subscriberCount": 171000,
    "language": "English",
    "url": "https://www.youtube.com/@MertArduino"
  },
  {
    "id": "yt-ch-173-sunfounder",
    "name": "SunFounder",
    "category": "Electronics & IoT",
    "subscribers": "109K",
    "subscriberCount": 109000,
    "language": "English",
    "url": "https://www.youtube.com/c/SunFounder"
  },
  {
    "id": "yt-ch-174-kurzgesagt",
    "name": "Kurzgesagt",
    "category": "Science & Mathematics",
    "subscribers": "25M",
    "subscriberCount": 25000000,
    "language": "English",
    "url": "https://www.youtube.com/c/inanutshell"
  },
  {
    "id": "yt-ch-175-ted-ed",
    "name": "TED-Ed",
    "category": "Science & Mathematics",
    "subscribers": "20.4M",
    "subscriberCount": 20400000,
    "language": "English",
    "url": "https://www.youtube.com/c/TEDEd"
  },
  {
    "id": "yt-ch-176-crash-course",
    "name": "Crash Course",
    "category": "Science & Mathematics",
    "subscribers": "15.9M",
    "subscriberCount": 15900000,
    "language": "English",
    "url": "https://www.youtube.com/c/crashcourse"
  },
  {
    "id": "yt-ch-177-veritasium",
    "name": "Veritasium",
    "category": "Science & Mathematics",
    "subscribers": "14M",
    "subscriberCount": 14000000,
    "language": "English",
    "url": "https://www.youtube.com/c/veritasium"
  },
  {
    "id": "yt-ch-178-smartereveryday",
    "name": "SmarterEveryDay",
    "category": "Science & Mathematics",
    "subscribers": "11.8M",
    "subscriberCount": 11800000,
    "language": "English",
    "url": "https://www.youtube.com/c/smartereveryday"
  },
  {
    "id": "yt-ch-179-asapscience",
    "name": "AsapSCIENCE",
    "category": "Science & Mathematics",
    "subscribers": "10.7M",
    "subscriberCount": 10700000,
    "language": "English",
    "url": "https://www.youtube.com/c/AsapSCIENCE"
  },
  {
    "id": "yt-ch-180-the-organic-chemistry-tu",
    "name": "The Organic Chemistry Tutor",
    "category": "Science & Mathematics",
    "subscribers": "10.3M",
    "subscriberCount": 10300000,
    "language": "English",
    "url": "https://www.youtube.com/c/TheOrganicChemistryTutor"
  },
  {
    "id": "yt-ch-181-3blue1brown",
    "name": "3Blue1Brown",
    "category": "Science & Mathematics",
    "subscribers": "7.4M",
    "subscriberCount": 7400000,
    "language": "English",
    "url": "https://www.youtube.com/c/3blue1brown"
  },
  {
    "id": "yt-ch-182-minutephysics",
    "name": "MinutePhysics",
    "category": "Science & Mathematics",
    "subscribers": "5.7M",
    "subscriberCount": 5700000,
    "language": "English",
    "url": "https://www.youtube.com/c/minutephysics"
  },
  {
    "id": "yt-ch-183-numberphile",
    "name": "Numberphile",
    "category": "Science & Mathematics",
    "subscribers": "4.56M",
    "subscriberCount": 4560000,
    "language": "English",
    "url": "https://www.youtube.com/c/numberphile"
  },
  {
    "id": "yt-ch-184-physics-girl",
    "name": "Physics Girl",
    "category": "Science & Mathematics",
    "subscribers": "3.5M",
    "subscriberCount": 3500000,
    "language": "English",
    "url": "https://www.youtube.com/@physicsgirl"
  },
  {
    "id": "yt-ch-185-brian-mclogan",
    "name": "Brian McLogan",
    "category": "Science & Mathematics",
    "subscribers": "1.6M",
    "subscriberCount": 1600000,
    "language": "English",
    "url": "https://www.youtube.com/c/brianmclogan"
  },
  {
    "id": "yt-ch-186-bozeman-science",
    "name": "Bozeman Science",
    "category": "Science & Mathematics",
    "subscribers": "1.4M",
    "subscriberCount": 1400000,
    "language": "English",
    "url": "https://www.youtube.com/c/baborscience"
  },
  {
    "id": "yt-ch-187-hannah-fry",
    "name": "Hannah Fry",
    "category": "Science & Mathematics",
    "subscribers": "1.24M",
    "subscriberCount": 1240000,
    "language": "English",
    "url": "https://www.youtube.com/@fryrsquared"
  },
  {
    "id": "yt-ch-188-physics-videos-by-eugene",
    "name": "Physics Videos by Eugene Khutoryansky",
    "category": "Science & Mathematics",
    "subscribers": "1M",
    "subscriberCount": 1000000,
    "language": "English",
    "url": "https://www.youtube.com/c/EugeneKhutoryansky"
  },
  {
    "id": "yt-ch-189-mathologer",
    "name": "Mathologer",
    "category": "Science & Mathematics",
    "subscribers": "962K",
    "subscriberCount": 962000,
    "language": "English",
    "url": "https://www.youtube.com/c/Mathologer"
  },
  {
    "id": "yt-ch-190-nilered",
    "name": "NileRed",
    "category": "Chemistry",
    "subscribers": "10.7M",
    "subscriberCount": 10700000,
    "language": "English",
    "url": "https://www.youtube.com/@NileRed"
  }
];

/**
 * Matches curated channels relevant to an academic subject, topic, or search query.
 */
export function matchEducationalChannels(query: string, limit = 8): EducationalYouTubeChannel[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return [...EDUCATIONAL_YOUTUBE_CHANNELS]
      .sort((a, b) => b.subscriberCount - a.subscriberCount)
      .slice(0, limit);
  }

  const keywordMap: Array<{ triggers: string[]; categories: string[] }> = [
    { triggers: ['math', 'algebra', 'calculus', 'geometry', 'trigonometry', 'physics', 'science', 'biology', 'ncert', 'cbse', 'icse', 'puc', 'sslc', 'evs', 'environmental'], categories: ['Science & Mathematics', 'Chemistry'] },
    { triggers: ['chem', 'organic', 'inorganic', 'molecule', 'reaction', 'atom'], categories: ['Chemistry', 'Science & Mathematics'] },
    { triggers: ['code', 'coding', 'program', 'python', 'javascript', 'typescript', 'java', 'c++', 'web', 'react', 'node', 'sql', 'computer', 'software', 'dsa', 'algorithm', 'bca', 'mca', 'b.tech', 'btech', 'cs'], categories: ['Programming & Coding', 'DevOps & Cloud Computing'] },
    { triggers: ['ai', 'artificial intelligence', 'llm', 'agent', 'automation', 'prompt', 'gpt', 'n8n'], categories: ['AI & Automation', 'Machine Learning & Data Science'] },
    { triggers: ['machine learning', 'data science', 'deep learning', 'neural', 'analytics', 'statistics', 'ml', 'nlp'], categories: ['Machine Learning & Data Science', 'AI & Automation'] },
    { triggers: ['game', 'unity', 'unreal', 'godot', '3d', 'blender'], categories: ['Game Development', 'Graphic & Design'] },
    { triggers: ['mobile', 'android', 'ios', 'flutter', 'swift', 'kotlin', 'app'], categories: ['Mobile App Development', 'Programming & Coding'] },
    { triggers: ['ui', 'ux', 'figma', 'design', 'graphic', 'photoshop', 'illustrator', 'video edit', 'motion'], categories: ['UI/UX Design', 'Graphic & Design'] },
    { triggers: ['cyber', 'security', 'hacking', 'network', 'linux', 'pentest', 'ethical'], categories: ['Cybersecurity', 'DevOps & Cloud Computing'] },
    { triggers: ['cloud', 'aws', 'azure', 'docker', 'kubernetes', 'devops', 'ci/cd'], categories: ['DevOps & Cloud Computing', 'Programming & Coding'] },
    { triggers: ['blockchain', 'crypto', 'web3', 'solidity', 'defi'], categories: ['Blockchain & Web3'] },
    { triggers: ['marketing', 'seo', 'business', 'commerce', 'finance', 'startup', 'digital', 'bba', 'mba'], categories: ['Digital Marketing & SEO'] },
    { triggers: ['electronics', 'iot', 'arduino', 'raspberry', 'circuit', 'hardware', 'robotics', 'embedded', 'ece', 'eee'], categories: ['Electronics & IoT', 'Science & Mathematics'] },
  ];

  const boostedCategories = new Set<string>();
  for (const rule of keywordMap) {
    if (rule.triggers.some((t) => q.includes(t))) {
      rule.categories.forEach((c) => boostedCategories.add(c));
    }
  }

  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  const scored = EDUCATIONAL_YOUTUBE_CHANNELS.map((ch) => {
    let score = 0;
    const hay = (ch.name + ' ' + ch.category + ' ' + ch.language).toLowerCase();
    if (ch.name.toLowerCase().includes(q)) score += 100;
    if (ch.category.toLowerCase().includes(q)) score += 60;
    for (const tok of tokens) {
      if (ch.name.toLowerCase().includes(tok)) score += 35;
      else if (hay.includes(tok)) score += 15;
    }
    if (boostedCategories.has(ch.category)) score += 45;
    return { ch, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.ch.subscriberCount - a.ch.subscriberCount);

  return scored.slice(0, limit).map((s) => s.ch);
}
