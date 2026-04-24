import axios from "axios";
import type { Role } from "../types/models";

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    SUPERVISOR: "مشرف",
    MOSQUE_MANAGER: "مدير جامع",
    GENERAL_MANAGER: "مدير عام",
    PARENT: "ولي أمر",
    STUDENT: "طالب",
  };
  return labels[role] ?? "";
}

export function getRatingLabel(rating: string): string {
  if (rating === "REPEAT") return "إعادة";
  if (rating === "GOOD") return "جيد";
  if (rating === "VERY_GOOD") return "جيد جدا";
  if (rating === "EXCELLENT") return "ممتاز";
  return rating;
}

export function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString("ar") : "-";
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    const text = Array.isArray(message) ? message.join("، ") : message;
    if (typeof text === "string") {
      if (text.includes("exam request today")) {
        return "لا يمكن إرسال أكثر من طلب اختبار واحد للطالب في اليوم.";
      }
      if (text.includes("Cannot delete circle with students")) {
        return "لا يمكن حذف حلقة تحتوي على طلاب. انقل أو احذف الطلاب أولاً.";
      }
      if (text.includes("Email already in use")) {
        return "هذا البريد مستخدم بالفعل.";
      }
      return text;
    }
  }
  return "حدث خطأ، حاول مرة أخرى";
}
