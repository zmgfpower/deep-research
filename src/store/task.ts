import { create } from "zustand";

type DeepResearchParams = {
  numQuestions: number;
  numLearnings: number;
  numThoughts: number;
};

type TaskStore = {
  question: string;
  finalReport: string;
  tasks: SearchTask[];
  numQuestions: number;
  numLearnings: number;
  numThoughts: number;
  update: (tasks: SearchTask[]) => void;
  updateTask: (query: string, task: Partial<SearchTask>) => void;
  updateQuestion: (question: string) => void;
  updateFinalReport: (report: string) => void;
  updateParams: (parmas: Partial<DeepResearchParams>) => void;
  clear: () => void;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  question: "",
  finalReport: "",
  tasks: [],
  numQuestions: 5,
  numLearnings: 5,
  numThoughts: 2,
  update: (tasks) => set(() => ({ tasks: [...tasks] })),
  updateTask: (query, task) => {
    const newTasks = get().tasks.map((item) => {
      return item.query === query ? { ...item, ...task } : item;
    });
    set(() => ({ tasks: [...newTasks] }));
  },
  updateQuestion: (question) => set(() => ({ question })),
  updateFinalReport: (report) => set(() => ({ finalReport: report })),
  updateParams: (parmas) => set(() => ({ ...parmas })),
  clear: () => set(() => ({ tasks: [] })),
}));
