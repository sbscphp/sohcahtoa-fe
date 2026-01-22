import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GoBackBtn from '@/components/btn/go-back-btn';
import SvgIcon from '@/components/svg-icon';

import { routes } from '@/lib/routes';
import { empty } from './assets/asset';
import { Button } from '@mantine/core';

export const metadata: Metadata = {
  title: 'Page not found | OneStop RX',
};

export default function NotFound() {
  return (
    <>
      <div className="section-padding relative py-0 overflow-hidden min-h-screen flex justify-center items-center">
        <div className="py-15 flex justify-center text-center flex-col md:*:max-w-[80%] items-center w-full max-w-225 mx-auto h-max relative">
          <h2 className="text-[28px] xs:text-[32px] md:text-[56px] py-5 ">
            Uh oh! We can’t find this page
          </h2>
          <p className="text-base md:text-[20px] ">
            We couldn't find the page you were looking for, but don't worry!
            Here are some options to help you get back on track.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-2 my-20 font-medium text-base">
            <GoBackBtn>
              <div className="flex items-center gap-1 text-primary-main w-full">
                <SvgIcon
                  name="arrow-left"
                  className="w-5 h-5 text-white"
                  color="white"
                />
                <p>Go Back</p>
              </div>
            </GoBackBtn>

            <Link
              href={routes.home()}
              className="flex items-center gap-2 bg-primary-main text-white rounded-full w-full"
            >
              <Button variant="outline" radius="xl" className="w-full">
                Take Me Home
              </Button>
            </Link>
          </div>

          <div className="absolute w-full h-100 top-[50%] translate-y-[-50%] -z-1">
            <div className="relative w-full aspect-video [&>img]:object-contain ">
              <Image
                src={empty}
                alt="error 404"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
