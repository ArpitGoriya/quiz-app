export type Question = {
  category: string;
  question: string;
  options: string[];
  answer: string;
};

export const questionBank: Question[] = [
  // Science
  {
    category: 'Science',
    question: 'What planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    answer: 'Mars',
  },
  {
    category: 'Science',
    question: 'What is the chemical symbol for water?',
    options: ['O2', 'H2O', 'CO2', 'NaCl'],
    answer: 'H2O',
  },
  // History
  {
    category: 'History',
    question: 'Who was the first President of the United States?',
    options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'],
    answer: 'George Washington',
  },
  {
    category: 'History',
    question: 'In which year did World War II end?',
    options: ['1945', '1939', '1918', '1965'],
    answer: '1945',
  },
  // Sports
  {
    category: 'Sports',
    question: 'How many players are there in a football (soccer) team?',
    options: ['9', '10', '11', '12'],
    answer: '11',
  },
  {
    category: 'Sports',
    question: 'Which country won the FIFA World Cup in 2018?',
    options: ['Brazil', 'Germany', 'France', 'Argentina'],
    answer: 'France',
  },
]; 