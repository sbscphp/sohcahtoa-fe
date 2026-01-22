import { FC, SVGProps } from 'react';

import { ISvgIconName } from '@/types/svg-icon.types';

interface ISvgProps extends SVGProps<SVGSVGElement> {
  name: ISvgIconName;
}

const SvgIcon: FC<ISvgProps> = ({ name, ...props }) => {
  return (
    <svg fill="currentColor" {...props}>
      <use xlinkHref={`/sprite.svg#${name}`} />
    </svg>
  );
};

export default SvgIcon;
