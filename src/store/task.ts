import { create } from "zustand";

type TaskStore = {
  question: string;
  questions: string;
  finalReport: string;
  query: string;
  tasks: SearchTask[];
};

type TaskFunction = {
  update: (tasks: SearchTask[]) => void;
  updateQuery: (query: string) => void;
  updateTask: (query: string, task: Partial<SearchTask>) => void;
  updateQuestion: (question: string) => void;
  updateQuestions: (questions: string) => void;
  updateFinalReport: (report: string) => void;
  clear: () => void;
};

export const useTaskStore = create<TaskStore & TaskFunction>((set, get) => ({
  question: "",
  questions: "",
  finalReport: "",
  query: "",
  tasks: [],
  update: (tasks) => set(() => ({ tasks: [...tasks] })),
  updateQuery: (query) => set(() => ({ query })),
  updateTask: (query, task) => {
    const newTasks = get().tasks.map((item) => {
      return item.query === query ? { ...item, ...task } : item;
    });
    set(() => ({ tasks: [...newTasks] }));
  },
  updateQuestion: (question) => set(() => ({ question })),
  updateQuestions: (questions) => set(() => ({ questions })),
  updateFinalReport: (report) => set(() => ({ finalReport: report })),
  clear: () => set(() => ({ tasks: [] })),
}));
