import { useSyncExternalStore } from "react";
import {
  loadCreatorSavedCourses,
  subscribeCreatorSavedCourses,
} from "../services/creatorCourses.service";

export const useCreatorSavedCourses = () =>
  useSyncExternalStore(subscribeCreatorSavedCourses, loadCreatorSavedCourses, () => []);
