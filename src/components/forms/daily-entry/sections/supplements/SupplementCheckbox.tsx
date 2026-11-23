"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface SupplementCheckboxProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function SupplementCheckbox({
  name,
  label,
  checked,
  onChange,
}: SupplementCheckboxProps) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer" htmlFor={`supp-${name}`}>
      <Checkbox id={`supp-${name}`} checked={checked} onChange={onChange} />
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}
