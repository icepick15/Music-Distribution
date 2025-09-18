// Mock ticket data with comprehensive information
export const mockTickets = [
  {
    id: "TKT-001",
    title: "Unable to upload music tracks",
    description: "I'm experiencing issues when trying to upload my latest album. The upload process stops at 45% and shows an error message.",
    status: "open",
    priority: "high",
    category: "technical",
    createdAt: "2025-08-25T10:30:00Z",
    updatedAt: "2025-08-26T14:22:00Z",
    author: {
      name: "Alex Johnson",
      email: "alex.johnson@email.com",
      avatar: null
    },
    assignee: {
      name: "Sarah Chen",
      email: "sarah.chen@musicdist.com",
      avatar: null
    },
    responses: [
      {
        id: "resp-1",
        author: "Alex Johnson",
        message: "I've tried uploading multiple times but it keeps failing. The files are in MP3 format and under 10MB each.",
        timestamp: "2025-08-25T10:30:00Z",
        isStaff: false
      },
      {
        id: "resp-2", 
        author: "Sarah Chen",
        message: "Hi Alex, I'm looking into this issue. Can you please try uploading from a different browser and let me know if the issue persists?",
        timestamp: "2025-08-26T14:22:00Z",
        isStaff: true
      }
    ]
  },
  {
    id: "TKT-002",
    title: "Billing discrepancy in subscription",
    description: "I was charged twice for my premium subscription this month. The duplicate charge appeared on August 15th.",
    status: "closed",
    priority: "medium",
    category: "billing",
    createdAt: "2025-08-20T09:15:00Z",
    updatedAt: "2025-08-22T16:45:00Z",
    author: {
      name: "Marcus Williams",
      email: "marcus.w@email.com",
      avatar: null
    },
    assignee: {
      name: "David Kim",
      email: "david.kim@musicdist.com",
      avatar: null
    },
    responses: [
      {
        id: "resp-3",
        author: "Marcus Williams", 
        message: "I've been charged $29.99 twice on the same day. My bank statement shows both charges from Music Distribution.",
        timestamp: "2025-08-20T09:15:00Z",
        isStaff: false
      },
      {
        id: "resp-4",
        author: "David Kim",
        message: "I've located the duplicate charge and processed a full refund. You should see it in your account within 3-5 business days.",
        timestamp: "2025-08-22T16:45:00Z",
        isStaff: true
      }
    ]
  },
  {
    id: "TKT-003",
    title: "Request for additional analytics features",
    description: "Would love to see more detailed analytics about streaming performance across different platforms.",
    status: "open",
    priority: "low",
    category: "feature-request",
    createdAt: "2025-08-23T14:20:00Z",
    updatedAt: "2025-08-23T14:20:00Z",
    author: {
      name: "Emma Rodriguez",
      email: "emma.rodriguez@email.com",
      avatar: null
    },
    assignee: null,
    responses: [
      {
        id: "resp-5",
        author: "Emma Rodriguez",
        message: "It would be great to have geographic breakdown of listeners and hourly streaming data. This would help me optimize my release schedule.",
        timestamp: "2025-08-23T14:20:00Z",
        isStaff: false
      }
    ]
  },
  {
    id: "TKT-004",
    title: "API integration documentation",
    description: "Need help integrating with the Music Distribution API for automated uploads.",
    status: "open", 
    priority: "medium",
    category: "api",
    createdAt: "2025-08-24T11:45:00Z",
    updatedAt: "2025-08-27T09:30:00Z",
    author: {
      name: "Dev Studio Team",
      email: "dev@recordstudio.com",
      avatar: null
    },
    assignee: {
      name: "Tech Support",
      email: "tech@musicdist.com", 
      avatar: null
    },
    responses: [
      {
        id: "resp-6",
        author: "Dev Studio Team",
        message: "We're building a batch upload system and need API documentation for authentication and file upload endpoints.",
        timestamp: "2025-08-24T11:45:00Z",
        isStaff: false
      },
      {
        id: "resp-7",
        author: "Tech Support",
        message: "I'll send you our API documentation and sample code. Please check your email in the next hour.",
        timestamp: "2025-08-27T09:30:00Z",
        isStaff: true
      }
    ]
  }
];

export const ticketCategories = [
  { value: "technical", label: "Technical Issue", color: "red" },
  { value: "billing", label: "Billing & Payments", color: "green" },
  { value: "feature-request", label: "Feature Request", color: "blue" },
  { value: "api", label: "API & Integration", color: "purple" },
  { value: "account", label: "Account & Profile", color: "orange" },
  { value: "other", label: "Other", color: "gray" }
];

export const ticketPriorities = [
  { value: "low", label: "Low", color: "gray" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "orange" },
  { value: "urgent", label: "Urgent", color: "red" }
];