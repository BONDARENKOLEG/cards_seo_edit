'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type EditorDirtyContextValue = {
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
};

const EditorDirtyContext = createContext<EditorDirtyContextValue | null>(null);

export const EditorDirtyProvider = ({ children }: { children: ReactNode }) => {
  const [isDirty, setIsDirty] = useState(false);

  return (
    <EditorDirtyContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </EditorDirtyContext.Provider>
  );
};

export const useEditorDirty = (): EditorDirtyContextValue => {
  const context = useContext(EditorDirtyContext);

  if (!context) {
    throw new Error(
      'useEditorDirty must be used within an EditorDirtyProvider'
    );
  }

  return context;
};
