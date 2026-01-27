import React, { useState, createContext, useContext } from 'react';

interface TabsContextType {
  value: string;
  setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue = '',
  value: controlledValue,
  onValueChange,
  children,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 bg-slate-700/50 p-1 rounded-lg ${className}`}>{children}</div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value: triggerValue,
  children,
  className = '',
}) => {
  const context = useContext(TabsContext);
  const isActive = context?.value === triggerValue;

  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
        isActive
          ? 'bg-amber-600 text-white shadow-lg'
          : 'text-gray-300 hover:text-white hover:bg-slate-600/50'
      } ${className}`}
      onClick={() => context?.setValue(triggerValue)}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value: contentValue,
  children,
  className = '',
}) => {
  const context = useContext(TabsContext);
  const isActive = context?.value === contentValue;

  if (!isActive) return null;

  return <div className={className}>{children}</div>;
};
