"use client";
import { Loader2, X } from "lucide-react";
import ResourceIcon from "./ResourceIcon";
import { formatSize } from "@/utils/file";
import { cn } from "@/utils/style";
import { isFunction } from "radash";

type Props = {
  className?: string;
  resources: Resource[];
  onRemove?: (id: string) => void;
};

function ResourceList({ className, resources, onRemove }: Props) {
  return (
    <div
      className={cn(
        className,
        "grid w-full grid-cols-3 flex-wrap gap-2 max-md:grid-cols-2 max-sm:max-h-60 overflow-y-auto max-md:gap-1"
      )}
    >
      {resources.map((resource) => {
        return (
          <div
            className={cn(
              "flex rounded-md border p-1.5 text-left",
              resource.status === "failed" ? "border-red-500 text-red-500" : ""
            )}
            key={resource.id}
          >
            <div className="relative flex items-center mr-1.5 h-14 w-12 max-md:w-10 max-sm:w-8">
              <ResourceIcon
                className="p-1 h-12 w-12 max-md:m-0 max-md:w-10 max-md:h-10 max-sm:w-8 max-sm:h-8 max-sm:p-0"
                type={resource.type}
              />
              {resource.status === "processing" ? (
                <Loader2 className="absolute left-4 top-4 h-6 w-6 animate-spin" />
              ) : null}
            </div>
            <div className="flex h-14 w-3/4 flex-auto text-sm">
              <div className="flex-1 py-1">
                <h4
                  className="text-line-clamp-3 break-all font-medium leading-4"
                  title={resource.name}
                >
                  {resource.name}
                </h4>
                <p className="text-xs">{formatSize(resource.size)}</p>
              </div>
              {isFunction(onRemove) ? (
                <X
                  className="relative -top-0.5 opacity-50 -right-0.5 h-5 w-5 p-0.5 cursor-pointer rounded-full hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  onClick={() => onRemove(resource.id)}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ResourceList;
