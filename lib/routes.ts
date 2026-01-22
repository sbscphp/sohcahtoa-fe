import { customerRoutes } from './customerRoutes';
import { agentRoutes } from './agentRoutes';
import { adminRoutes } from './adminRoutes';

const home = () => '/';

export const routes = {
  home,
  ...customerRoutes,
  ...agentRoutes,
  ...adminRoutes,
};
