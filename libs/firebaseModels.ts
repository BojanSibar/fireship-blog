import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import Post from "../types/PostFirebaseModel";

export const postConverter = {
  toFirestore(product: Post): DocumentData {
    return { ...product };
  },

  fromFirestore(
    snapshot: firebase.default.firestore.QueryDocumentSnapshot,
    options: firebase.default.firestore.SnapshotOptions
  ): Post {
    const data = snapshot.data(options)!;
    return {
      title: data.title,
      slug: data.slug,
      uid: data.uid,
      username: data.username,
      published: data.published,
      content: data.content,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      heartCount: data.heartCount,
    };
  },
};
