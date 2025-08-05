import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  
  const variants = {
    primary: "border-transparent text-white bg-primary hover:bg-primary-700 focus:ring-primary",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 mr-2" />}
      {children}
    </button>
  );
};

export default Button;