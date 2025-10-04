import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiFileText,
  FiSettings,
} from 'react-icons/fi';
import { cn } from '@/utils';

interface NavigationProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: FiHome,
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: FiShoppingCart,
  },
  {
    name: 'Products',
    href: '/products',
    icon: FiPackage,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: FiFileText,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: FiSettings,
  },
];

export const Navigation: React.FC<NavigationProps> = ({
  isMobile = false,
  onLinkClick,
}) => {
  const baseClasses = isMobile
    ? 'flex flex-col space-y-1 p-4'
    : 'flex flex-col space-y-1 p-4 h-full';

  const linkClasses = (isActive: boolean) =>
    cn(
      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700'
    );

  return (
    <nav className={baseClasses}>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) => linkClasses(isActive)}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};