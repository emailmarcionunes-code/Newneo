'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';

const SidebarContext = createContext<{
  collapsed: boolean;
  toggleCollapsed: () => void;
} | null>(null);

/** Lives in the root layout so route changes never reset the sidebar width. */
export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useLayoutEffect(() => {
    try {
      setCollapsed(
        sessionStorage.getItem('newneo-sidebar-collapsed') === 'true',
      );
    } catch {
      /* The in-memory preference still works without storage. */
    }
  }, []);
  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      sessionStorage.setItem('newneo-sidebar-collapsed', String(next));
    } catch {
      /* Preserve the preference in this mounted provider. */
    }
  }
  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const state = useContext(SidebarContext);
  if (!state) throw new Error('SidebarStateProvider is required');
  return state;
}
