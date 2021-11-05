import { Usage } from './src/constants';

export declare type VostokBuild = {
  pkg: string;
  dest: string;
  port: number;
  env?: {
    [key: string]: any;
  };
  use?: Usage;
};

export declare type VostokConfig = {
  [key: string]: any;
} & {
  version?: number;
  comment?: string;
  builds: [];
};
