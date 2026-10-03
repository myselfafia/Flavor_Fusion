import checkToken, { optionalAuth } from "./checkToken.js";

export const requireAuth = checkToken;
export { optionalAuth, checkToken };
export default checkToken;
