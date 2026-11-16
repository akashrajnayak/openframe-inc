import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return (window.location.pathname || '/') + (window.location.search || '');
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath((window.location.pathname || '/') + (window.location.search || ''));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  className?: string;
  activeClassName?: string;
  children: ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  to,
  className = '',
  activeClassName = '',
  children,
  onClick,
  ...rest
}) => {
  const { currentPath, navigate } = useRouter();
  const cleanCurrent = currentPath.split('?')[0] || '/';
  const cleanTo = to.split('?')[0] || '/';
  const isActive = cleanCurrent === cleanTo || (cleanTo !== '/' && cleanCurrent.startsWith(cleanTo));

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && rest.target !== '_blank') {
      e.preventDefault();
      navigate(to);
    }
  };

  const combinedClass = `${className} ${isActive ? activeClassName : ''}`.trim();

  return (
    <a href={to} onClick={handleClick} className={combinedClass} {...rest}>
      {children}
    </a>
  );
};
