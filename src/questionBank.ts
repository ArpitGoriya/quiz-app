export type Question = {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
};

export const questionBank: Question[] = [
  // ─── General Knowledge ──────────────────────
  {
    id: 1,
    category: "General Knowledge",
    question: "Which metal is liquid at room temperature?",
    options: ["Mercury", "Gold", "Copper", "Silver"],
    correctIndex: 0
  },
  {
    id: 2,
    category: "General Knowledge",
    question: "What is the largest land animal?",
    options: ["Elephant", "Giraffe", "Hippopotamus", "Rhino"],
    correctIndex: 0
  },
  {
    id: 3,
    category: "General Knowledge",
    question: "Which planet is called the Red Planet?",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
    correctIndex: 0
  },
  {
    id: 4,
    category: "General Knowledge",
    question: "What color do you get when you mix red and white?",
    options: ["Pink", "Purple", "Orange", "Brown"],
    correctIndex: 0
  },
  {
    id: 5,
    category: "General Knowledge",
    question: "In a web address, \"www\" stands for?",
    options: ["World Wide Web", "Web Word Wide", "Wide World Web", "World Web Wide"],
    correctIndex: 0
  },

  // ── Technology & Business ───────────────────
  {
    id: 6,
    category: "Technology & Business",
    question: "What does \"CPU\" stand for?",
    options: [
      "Central Processing Unit",
      "Computer Power Unit",
      "Central Power Unit",
      "Compute Processing Unit"
    ],
    correctIndex: 0
  },
  {
    id: 7,
    category: "Technology & Business",
    question: "Which company makes the PlayStation console?",
    options: ["Nintendo", "Microsoft", "Sony", "SEGA"],
    correctIndex: 2
  },
  {
    id: 8,
    category: "Technology & Business",
    question: "What year was Google founded?",
    options: ["1995", "1998", "2000", "2004"],
    correctIndex: 1
  },
  {
    id: 9,
    category: "Technology & Business",
    question: "The first iPhone was released in which year?",
    options: ["2005", "2007", "2009", "2010"],
    correctIndex: 1
  },
  {
    id: 10,
    category: "Technology & Business",
    question: "Software you can use free of charge is called?",
    options: ["Shareware", "Proprietary", "Freeware", "Adware"],
    correctIndex: 2
  },

  // ── History & Geopolitics ───────────────────
  {
    id: 11,
    category: "History & Geopolitics",
    question: "Who was the first person to walk on the Moon?",
    options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Michael Collins"],
    correctIndex: 1
  },
  {
    id: 12,
    category: "History & Geopolitics",
    question: "The Great Wall is located in which country?",
    options: ["China", "India", "Japan", "Korea"],
    correctIndex: 0
  },
  {
    id: 13,
    category: "History & Geopolitics",
    question: "Which wonder of the ancient world stands in Giza?",
    options: [
      "Temple of Artemis",
      "Colossus of Rhodes",
      "Great Pyramid",
      "Hanging Gardens"
    ],
    correctIndex: 2
  },
  {
    id: 14,
    category: "History & Geopolitics",
    question: "Who wrote the Declaration of Independence?",
    options: [
      "George Washington",
      "John Adams",
      "Benjamin Franklin",
      "Thomas Jefferson"
    ],
    correctIndex: 3
  },
  {
    id: 15,
    category: "History & Geopolitics",
    question: "In what year did the Berlin Wall fall?",
    options: ["1987", "1989", "1991", "1993"],
    correctIndex: 1
  },

  // ─── Math & Logic ───────────────────────────
  {
    id: 16,
    category: "Math & Logic",
    question:
      "A ₹1,200 product is discounted by 10%, then a 10% sales tax is applied on the discounted price. What’s the final cost? (use on-screen calculator)",
    options: ["₹1,122.00", "₹1,081.80", "₹1,038.00", "₹1,158.00"],
    correctIndex: 0
  },
  {
    id: 17,
    category: "Math & Logic",
    question: "If you split 12 items equally among 3 people, how many each?",
    options: ["3", "4", "5", "6"],
    correctIndex: 1
  },
  {
    id: 18,
    category: "Math & Logic",
    question:
      "What’s the area of a circle with radius 7 cm? (Use π = 3.14 and on-screen calculator)",
    options: ["153.86 cm²", "144.00 cm²", "158.40 cm²", "149.86 cm²"],
    correctIndex: 0
  },
  {
    id: 19,
    category: "Math & Logic",
    question:
      "A car travels at 72 km/h. How far does it go in 2.5 hours? (use on-screen calculator)",
    options: ["180 km", "165 km", "190 km", "175 km"],
    correctIndex: 0
  },
  {
    id: 20,
    category: "Math & Logic",
    question: "What is 25% of 200?",
    options: ["25", "50", "75", "100"],
    correctIndex: 1
  }
]; 