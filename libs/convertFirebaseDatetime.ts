import { Timestamp } from "firebase/firestore";
import { fromMillis } from "./firebase";

export default function convertFirebaseDateTime(date: number | Timestamp) {
  return typeof date === "number" ? fromMillis(date) : date;
}
