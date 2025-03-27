import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface CommandListProps {
  children: React.ReactNode;
}

interface CommandItemProps {
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
}

const Command = ({ open, onOpenChange, children }: CommandProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 shadow-lg">
        <div className="flex flex-col bg-white dark:bg-slate-950 rounded-lg">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = ({ value, onChange, placeholder }: CommandInputProps) => {
  return (
    <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-3">
      <Search className="mr-2 h-4 w-4 text-slate-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
      />
    </div>
  );
};

const CommandList = ({ children }: CommandListProps) => {
  return (
    <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
};

const CommandItem = ({ onSelect, children, className }: CommandItemProps) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50",
        className
      )}
    >
      {children}
    </button>
  );
};

const CommandEmpty = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="py-6 text-center text-sm text-slate-500">{children}</div>
  );
};

export { Command, CommandInput, CommandList, CommandItem, CommandEmpty };
