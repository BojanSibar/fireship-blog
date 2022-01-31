import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { UserContext } from "../../libs/context";
import { auth, firestore, serverTimestamp } from "../../libs/firebase";

import kebabCase from "lodash.kebabcase";
import toast from "react-hot-toast";
import AuthCheck from "../../components/AuthCheck";
import styles from "../../styles/Admin.module.css";
import PostFeed from "../../components/PostFeed";
import { postConverter } from "../../libs/firebaseModels";
import Post from "../../types/PostFirebaseModel";

export default function AdminSlugPage() {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList() {
  const ref = firestore
    .collection("users")
    .doc(auth.currentUser?.uid)
    .collection("posts")
    .withConverter(postConverter);
  const query = ref.orderBy("createdAt");
  const [querySnapshot] = useCollection<Post>(query);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts || []} admin />
    </>
  );
}

function CreateNewPost() {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState("");

  // Ensure slug is URL safe
  const slug = encodeURI(kebabCase(title));

  // Validate length
  const isValid = title.length > 3 && title.length < 100;

  // Create a new post in firestore
  const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    const ref = firestore
      .collection("users")
      .doc(uid)
      .collection("posts")
      .doc(slug);

    // Tip: give all fields a default value here
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# hello world!",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await ref.set(data);

    toast.success("Post created!");

    // Imperative navigation after doc is set
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Awesome Article!"
        className={styles.input}
      />
      <p>
        <strong>Slug:</strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}
