import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function ResearchGoal({ data }: { data: SearchQueries | null }) {
  if (!data) return null;

  return (
    <section className="p-4 border rounded-md mt-6">
      <Accordion type="single" collapsible>
        {data.queries.map((item, idx) => {
          return (
            <AccordionItem key={idx} value={item.query}>
              <AccordionTrigger>{item.query}</AccordionTrigger>
              <AccordionContent>{item.researchGoal}</AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

export default ResearchGoal;
