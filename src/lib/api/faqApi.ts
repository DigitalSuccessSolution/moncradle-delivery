import api from "@/lib/axios";

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

export const getFaqs = async (): Promise<Faq[]> => {
  try {
    const response = await api.get("/faqs?targetApp=delivery");
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.filter((f: Faq) => f.isActive);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return [];
  }
};
