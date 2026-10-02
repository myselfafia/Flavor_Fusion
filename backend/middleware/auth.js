import checkToken, { optionalAuth } from "./checkToken.js";

export const requireAuth = checkToken;
export { optionalAuth };
export default checkToken;
