import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

type TaskStore = {
  question: string;
  questions: string;
  finalReport: string;
  query: string;
  title: string;
  suggestion: string;
  tasks: SearchTask[];
  history: TaskHistory[];
  feedback: string;
};

type TaskFunction = {
  update: (tasks: SearchTask[]) => void;
  setTitle: (title: string) => void;
  setSuggestion: (suggestion: string) => void;
  setQuery: (query: string) => void;
  updateTask: (query: string, task: Partial<SearchTask>) => void;
  setQuestion: (question: string) => void;
  updateQuestions: (questions: string) => void;
  updateFinalReport: (report: string) => void;
  setFeedback: (feedback: string) => void;
  saveToHistory: () => void;
  loadFromHistory: (historyId: string) => void;
  deleteHistory: (historyId: string) => void;
  clear: () => void;
  clearAll: () => void;
};

export const useTaskStore = create(
  persist<TaskStore & TaskFunction>(
    (set, get) => ({
      question: "",
      questions: "",
      finalReport: "",
      query: "",
      title: "",
      suggestion: "",
      tasks: [],
      history: [],
      feedback: "",
      update: (tasks) => set(() => ({ tasks: [...tasks] })),
      setTitle: (title) => set(() => ({ title })),
      setSuggestion: (suggestion) => set(() => ({ suggestion })),
      setQuery: (query) => set(() => ({ query })),
      updateTask: (query, task) => {
        const newTasks = get().tasks.map((item) => {
          return item.query === query ? { ...item, ...task } : item;
        });
        set(() => ({ tasks: [...newTasks] }));
      },
      setQuestion: (question) => set(() => ({ question })),
      updateQuestions: (questions) => set(() => ({ questions })),
      updateFinalReport: (report) => set(() => ({ finalReport: report })),
      setFeedback: (feedback) => set(() => ({ feedback })),
      saveToHistory: () => {
        const current = get();
        // 只有有标题和最终报告的任务才保存到历史记录
        if (current.title && current.finalReport) {
          const historyItem: TaskHistory = {
            id: nanoid(),
            createdAt: Date.now(),
            title: current.title,
            question: current.question,
            questions: current.questions,
            finalReport: current.finalReport,
            query: current.query,
            suggestion: current.suggestion,
            tasks: [...current.tasks],
            feedback: current.feedback
          };
          set((state) => ({
            history: [historyItem, ...state.history]
          }));
        }
      },
      loadFromHistory: (historyId) => {
        const { history } = get();
        const historyItem = history.find(item => item.id === historyId);
        if (historyItem) {
          set(() => ({
            question: historyItem.question,
            questions: historyItem.questions,
            finalReport: historyItem.finalReport,
            query: historyItem.query,
            title: historyItem.title,
            suggestion: historyItem.suggestion,
            tasks: [...historyItem.tasks],
            feedback: historyItem.feedback || ""
          }));
        }
      },
      deleteHistory: (historyId) => {
        set((state) => ({
          history: state.history.filter(item => item.id !== historyId)
        }));
      },
      clear: () => set(() => ({ tasks: [] })),
      clearAll: () => set(() => ({
        question: "",
        questions: "",
        finalReport: "",
        query: "",
        title: "",
        suggestion: "",
        tasks: [],
        feedback: ""
      })),
    }),
    { name: "tasks-store" }
  )
);
