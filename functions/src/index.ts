import * as admin from "firebase-admin";

admin.initializeApp();

export { getVideoInfo } from "./presentation/functions/videoInfoFunction";
export { downloadVideo } from "./presentation/functions/downloadFunction";
export { healthCheck } from "./presentation/functions/healthFunction";
