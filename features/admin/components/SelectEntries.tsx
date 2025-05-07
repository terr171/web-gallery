import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const entriesOptions = [10, 15, 20, 25, 50];

const SelectEntries = ({
  entries,
  onEntriesChange,
}: {
  entries: number;
  onEntriesChange: (entries: number) => void;
}) => {
  return (
    <Select
      value={String(entries)}
      onValueChange={(valueAsString) => {
        const valueAsNumber = parseInt(valueAsString, 10);
        if (!isNaN(valueAsNumber)) {
          onEntriesChange(valueAsNumber);
        }
      }}
    >
      <SelectTrigger className="w-[80px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {entriesOptions.map((option) => (
          <SelectItem key={option} value={String(option)}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default SelectEntries;
