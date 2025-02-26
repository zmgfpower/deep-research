import { create } from "zustand";

type TaskStore = {
  question: string;
  finalReport: string;
  tasks: SearchTask[];
  update: (tasks: SearchTask[]) => void;
  updateTask: (query: string, task: Partial<SearchTask>) => void;
  updateQuestion: (question: string) => void;
  updateFinalReport: (report: string) => void;
  clear: () => void;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  question: "",
  finalReport: "",
  tasks: [],
  update: (tasks) => set(() => ({ tasks: [...tasks] })),
  updateTask: (query, task) => {
    const newTasks = get().tasks.map((item) => {
      return item.query === query ? { ...item, ...task } : item;
    });
    set(() => ({ tasks: [...newTasks] }));
  },
  updateQuestion: (question) => set(() => ({ question })),
  updateFinalReport: (report) => set(() => ({ finalReport: report })),
  clear: () => set(() => ({ tasks: [] })),
}));
