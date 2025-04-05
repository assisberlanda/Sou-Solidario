import { ReactNode } from "react";
import BackButton from "./BackButton";

interface PageLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  className?: string;
}

const PageLayout = ({ children, showBackButton = true, className = "" }: PageLayoutProps) => {
  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      {showBackButton && (
        <div className="flex justify-end mb-4">
          <BackButton />
        </div>
      )}
      {children}
    </div>
  );
};

export default PageLayout;