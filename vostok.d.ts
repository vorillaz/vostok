import { Usage } from './src/constants';
import { Options } from 'http-proxy-middleware';

export declare type VostokBuild = {
  name?: string;
  pkg: string;
  dest: string;
  port?: number;
  src?: string;
  router?: Options['router'];
  pathRewrite?: Options['pathRewrite'];
  env?: {
    [key: string]: any;
  };
  use?: Usage;
};

export declare type VostokConfig = {
  [key: string]: any;
} & {
  version?: number | string;
  comment?: string;
  builds: VostokBuild[];
};

export default VostokConfig;
