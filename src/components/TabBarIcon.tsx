import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

interface TabBarIconProps extends Omit<SvgIconProps, 'component'> {
  focused: boolean;
  icon: React.ElementType | string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, icon, ...props }) => {
  if (typeof icon === 'string' && icon.endsWith('.png')) {
    return (
      <img
        src={icon}
        alt="Icon"
        style={{
          width: 28,
          height: 28,
          marginBottom: -3,
          filter: focused ? 'none' : 'grayscale(100%)',
        }}
      />
    );
  }

  return (
    <SvgIcon
      component={icon as React.ElementType}
      {...props}
      sx={{
        width: 28,
        height: 28,
        mb: -0.375,
        color: focused ? 'primary.main' : 'text.secondary',
      }}
    />
  );
};

export default TabBarIcon;
