import Magicdown from "@/components/Magicdown";
import { useTaskStore } from "@/store/task";
import { cn } from "@/utils/style";

function FinalReport() {
  const taskStore = useTaskStore();

  return (
    <section
      className={cn("p-4 border rounded-md mt-6", {
        hidden: taskStore.finalReport === "",
      })}
    >
      <h3 className="font-semibold text-lg">Final Report</h3>
      <div className="prose">
        <Magicdown>{taskStore.finalReport}</Magicdown>
      </div>
    </section>
  );
}

export default FinalReport;
