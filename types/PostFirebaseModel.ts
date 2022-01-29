import { Timestamp } from "firebase/firestore";

export default interface Post {
  title: string;
  slug: string;
  uid: string;
  username: string;
  published: boolean;
  content: string;
  createdAt: number | Timestamp;
  updatedAt: number | Timestamp;
  heartCount: number;
}
