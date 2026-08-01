const timelineData = [
  {
    id: "post_001",
    Title: "AI Chatbot Development",
    Description:
      "Developed an advanced AI-powered chatbot using Python and NLP techniques to provide intelligent conversational experiences. The chatbot utilizes transformer-based models for natural language understanding and generation, with custom training on domain-specific data. Features include multi-turn conversation handling, sentiment analysis, entity recognition, and context awareness. The system was optimized for response time and accuracy, achieving 94% user satisfaction in initial testing. Integrated with various APIs to provide real-time information and seamless third-party service connections.",
    posted_at: "2025-10-20T12:00:00Z",
    edited_at: "2025-10-21T08:30:00Z",
    skills: ["Python", "NLP", "Machine Learning"],
    attachments: [
      "https://images.unsplash.com/photo-1677442d019cecf8eda13033ceea27ab7ff4af4467f2f9ec758caf87d616de2b?w=800",
      "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800",
    ],
    author_id: "user_101",
    likeCount: 56,
    comments: [
      {
        string: "Impressive work on the NLP integration!",
        author: "user_202",
        time: "2025-10-20T14:20:00Z",
      },
      {
        string: "Could you share the source code?",
        author: "user_303",
        time: "2025-10-20T15:10:00Z",
      },
    ],
  },
  {
    id: "post_002",
    Title: "E-commerce Website",
    Description:
      "Built a comprehensive full-stack e-commerce platform using React for the frontend, Node.js for the backend, and MongoDB for data persistence. The platform features a responsive design that works seamlessly across all devices, with an intuitive product catalog, advanced search and filtering capabilities, and a secure checkout process. Implemented user authentication, payment gateway integration with Stripe, order tracking, and inventory management. The backend includes RESTful APIs, role-based access control, and comprehensive error handling. Performance optimizations include lazy loading, code splitting, and database indexing. Achieved 99.9% uptime with horizontal scaling capabilities.",
    posted_at: "2025-10-18T09:45:00Z",
    edited_at: "2025-10-19T10:00:00Z",
    skills: ["React", "Node.js", "MongoDB"],
    attachments: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    ],
    author_id: "user_102",
    likeCount: 72,
    comments: [
      {
        string: "The UI looks clean and responsive!",
        author: "user_204",
        time: "2025-10-18T10:30:00Z",
      },
    ],
  },
  {
    id: "post_003",
    Title: "Mobile Fitness App",
    Description:
      "Created a feature-rich cross-platform mobile application for tracking workouts and nutrition using React Native. The app includes comprehensive workout logging with exercise customization, progress tracking with charts and statistics, and detailed nutrition analysis with calorie counting. Integrated with popular health APIs like Google Fit and Apple HealthKit for seamless data synchronization. Features personalized workout recommendations based on user goals and fitness level, social sharing capabilities, and community challenges. Includes offline functionality for areas with poor connectivity and push notifications for motivation. The app was tested with over 500 beta users achieving a 4.8-star rating.",
    posted_at: "2025-10-15T16:20:00Z",
    edited_at: "2025-10-16T08:45:00Z",
    skills: ["React Native", "JavaScript", "Mobile Development"],
    attachments: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
      "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=800",
    ],
    author_id: "user_103",
    likeCount: 39,
    comments: [
      {
        string: "Nice integration with health APIs!",
        author: "user_205",
        time: "2025-10-15T18:00:00Z",
      },
    ],
  },
  {
    id: "post_004",
    Title: "Blockchain Voting System",
    Description:
      "Implemented a secure and transparent voting system using Ethereum smart contracts and blockchain technology. The system leverages distributed ledger technology to ensure tamper-proof vote recording and complete transparency of the voting process. Each vote is cryptographically secured and immutable, eliminating fraud and ensuring election integrity. The smart contracts were audited by third-party security experts and achieved the highest security standards. Implemented voting access control through multi-signature verification and zero-knowledge proofs for voter anonymity. The system can handle thousands of concurrent voters with sub-second transaction confirmation times. Comprehensive documentation and whitepaper included for auditing and regulatory compliance.",
    posted_at: "2025-10-12T11:15:00Z",
    edited_at: "2025-10-12T12:00:00Z",
    skills: ["Solidity", "Blockchain", "Smart Contracts"],
    attachments: [
      "https://images.unsplash.com/photo-1639762681033-6461854659be?w=800",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    ],
    author_id: "user_104",
    likeCount: 61,
    comments: [
      {
        string: "Very secure approach, well done!",
        author: "user_206",
        time: "2025-10-12T12:45:00Z",
      },
      {
        string: "Can this scale for national elections?",
        author: "user_207",
        time: "2025-10-12T13:10:00Z",
      },
    ],
  },
  {
    id: "post_005",
    Title: "Real-time Collaboration Tool",
    Description:
      "Developed a sophisticated web application enabling real-time document collaboration using WebSockets and operational transformation algorithms. The tool allows multiple users to simultaneously edit documents with live updates propagated instantly across all clients. Features include version history with restore capabilities, conflict resolution for concurrent edits, rich text formatting options, and commenting functionality. Implemented efficient data synchronization using delta compression to minimize bandwidth usage and maintain low latency. The application supports offline editing with automatic sync when connectivity is restored. Built with attention to accessibility standards and optimized for performance with fewer than 100ms latency for typical operations. Includes comprehensive audit logs for compliance and tracking of all document changes.",
    posted_at: "2025-10-10T14:00:00Z",
    edited_at: "2025-10-11T09:30:00Z",
    skills: ["JavaScript", "WebSockets", "Real-time Apps"],
    attachments: [
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    ],
    author_id: "user_105",
    likeCount: 84,
    comments: [
      {
        string: "Great work, the live updates are smooth!",
        author: "user_208",
        time: "2025-10-10T15:00:00Z",
      },
    ],
  },
];

export default timelineData;