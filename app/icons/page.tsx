'use client';

import SvgIcon from '@/components/svg-icon';
import { iconNames } from '@/types/svg-icon.types';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Image, Tooltip } from '@mantine/core';
import { empty } from '../assets/asset';

const sortedIconNames = [...iconNames].sort();

const Icons = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = sortedIconNames.filter((icons) =>
    icons.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      notifications.show({
        title: `${value} copied!`,
        message: `icon name has been copied to clipboard.`,
        color: 'green',
        withCloseButton: true,
      });
    });
  };

  return (
    <div className=" min-h-screen text-black p-6 xl:full-bleed">
      <div className="text-center">
        <h3 className="text-center text-2xl font-bold">SohCahToa Icons</h3>
        <p className="text-center italic mt-4">
          Click on any icon to copy its name
        </p>
      </div>

      <div className="flex justify-center w-full pt-8">
        <div className="flex justify-center items-center gap-1 bg-white rounded-[100px] p-2 lg:min-h-8.25 border w-[40%]">
          <SvgIcon name="search" className="h-6 w-6 text-primary-400" />
          <input
            className="bg-transparent focus:outline-0 pl-2 w-full text-black"
            placeholder="Search Icon Names Here..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap py-10 content-normal">
        {filteredIcons.length === 0 && (
          <div className="flex items-center justify-center w-full min-h-[50vh]">
            <div className="flex flex-col gap-2">
              <Image
                src={empty.src}
                className="h-full w-full"
                alt="image of empty content"
              />
              <p className="text-lg">
                Icon absent, please download needed icon{' '}
              </p>
            </div>
          </div>
        )}
        {filteredIcons.map((icon, index) => (
          <Tooltip
            label={`Click to copy ${icon}`}
            key={`${icon}-${index}`}
            withArrow
            className="hover:cursor-pointer"
            transitionProps={{ transition: 'fade', duration: 300 }}
          >
            <button
              key={index}
              className="h-max w-40 flex flex-col items-center p-3 hover:scale-105 transition-all icon-transition hover:text-primary-400"
              onClick={() => copyToClipboard(icon)}
            >
              <SvgIcon
                name={icon}
                className="w-12 h-12 rounded-lg  p-1 hover:bg-icon-transition"
              />
              <p className="text-xs mt-2 font-bold ">{icon}</p>
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default Icons;
