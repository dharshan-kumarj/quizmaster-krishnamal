import { Question } from '../types';

// Reading Comprehension Passage for Quiz 2
export const QUIZ2_PASSAGE = `As the economic role of multinational, global corporations expands, the international economic environment will be shaped increasingly not by governments or international institutions, but by the interaction between governments and global corporations, especially in the United States, Europe, and Japan. A significant factor in this shifting world economy is the trend toward regional trading blocs of nations, which has a potentially large effect on the evolution of the world trading system. Two examples of this trend are the United States-Canada Free Trade Agreement and Europe 1992, the move by the European Community to dismantle impediments to the free flow of goods, services, capital, and labor among member states by the end of 1992. However, although numerous political and economic factors were operative in launching the move to integrate the EC's markets, concern about protectionism within the EC does not appear to have been a major consideration. This is in sharp contrast to the FTA; the overwhelming reason for that bilateral initiative was fear of increasing United States protectionism. Nonetheless, although markedly different in origin and nature, both regional developments are highly significant in that they will foster integration in the two largest and richest markets of the world, as well as provoke questions about the future direction of the world trading system.`;

export const QUIZ2_TIME_LIMIT_SECONDS = 600; // 10 minutes for 7 questions

export const quiz2Questions: Question[] = [
  {
    id: 1,
    question: "The primary purpose of the passage as a whole is to",
    options: [
      "describe an initiative and propose its continuance",
      "chronicle a development and illustrate its inconsistencies",
      "identify a trend and suggest its importance",
      "summarize a process and question its significance",
      "report a phenomenon and outline its probable future"
    ],
    correctAnswer: "identify a trend and suggest its importance"
  },
  {
    id: 2,
    question: "According to the passage, all of the following are elements of the shifting world economy EXCEPT",
    options: [
      "an alteration in the role played by governments",
      "an increase in interaction between national governments and international regulatory institutions",
      "an increase in the formation of multinational trading alliances",
      "an increase in integration in the two richest markets of the world",
      "a fear of increasing United States protectionism"
    ],
    correctAnswer: "an increase in interaction between national governments and international regulatory institutions"
  },
  {
    id: 3,
    question: "The passage suggests which of the following about global corporations?",
    options: [
      "Their continued growth depends on the existence of a fully integrated international market.",
      "Their potential effect on the world market is a matter of ongoing concern to international institutions.",
      "They will have to assume quasi-governmental functions if current economic trends continue.",
      "They have provided a model of economic success for regional trading blocs.",
      "Their influence on world economics will continue to increase."
    ],
    correctAnswer: "Their influence on world economics will continue to increase."
  },
  {
    id: 4,
    question: "According to the passage, one similarity between the FTA and Europe 1992 is that they both",
    options: [
      "overcame concerns about the role of politics in the shifting world economy",
      "originated out of concern over unfair trade practices by other nations",
      "exemplify a trend toward regionalization of commercial markets",
      "place the economic needs of the trading bloc ahead of those of the member nations",
      "help to ensure the continued economic viability of the world community"
    ],
    correctAnswer: "exemplify a trend toward regionalization of commercial markets"
  },
  {
    id: 5,
    question: "Which of the following can be inferred from the passage about the European Community prior to the adoption of the Europe 1992 program?",
    options: [
      "There were restrictions on commerce between the member nations.",
      "The economic policies of the member nations focused on global trading issues.",
      "There were few impediments to trade between the member nations and the United States.",
      "The flow of goods between the member nations and Canada was insignificant.",
      "Relations between multinational corporations and the governments of the member nations were strained."
    ],
    correctAnswer: "There were restrictions on commerce between the member nations."
  },
  {
    id: 6,
    question: "The author discusses the FTA and Europe 1992 most likely in order to",
    options: [
      "point out the similarities between two seemingly disparate trading alliances",
      "illustrate how different economic motivations produce different types of trading blocs",
      "provide contrasting examples of a trend that is influencing the world economy",
      "identify the most important characteristics of successful economic integration",
      "trace the history of regional trading blocs"
    ],
    correctAnswer: "provide contrasting examples of a trend that is influencing the world economy"
  },
  {
    id: 7,
    question: "Which of the following best describes the organization of the passage?",
    options: [
      "An argument is put forth and evidence for and against it given.",
      "An assertion is made and opposing evidence presented.",
      "Two hypotheses are described and shown to be inconsistent with one another.",
      "A phenomenon is identified and illustrations of this phenomenon offered.",
      "A specific case of a phenomenon is discussed and a generalization drawn."
    ],
    correctAnswer: "A phenomenon is identified and illustrations of this phenomenon offered."
  }
];
