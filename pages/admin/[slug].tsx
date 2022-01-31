import styles from "../../styles/Admin.module.css";
import AuthCheck from "../../components/AuthCheck";
import { firestore, auth, serverTimestamp } from "../../libs/firebase";

import { useState } from "react";
import { useRouter } from "next/router";

import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import toast from "react-hot-toast";
import ImageUploader from "../../components/ImageUploader";
import { postConverter } from "../../libs/firebaseModels";
import Post from "../../types/PostFirebaseModel";

export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = firestore
    .collection("users")
    .doc(auth.currentUser?.uid)
    .collection("posts")
    .doc(slug as string)
    .withConverter(postConverter);
  const [post] = useDocumentData<Post>(postRef);

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

type PostFormProps = {
  defaultValues: Post;
  postRef: firebase.default.firestore.DocumentReference<Post>;
  preview: boolean;
};

function PostForm({ defaultValues, postRef, preview }: PostFormProps) {
  const { register, handleSubmit, reset, watch, formState } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { errors } = formState;

  const { isValid, isDirty } = formState;

  const updatePost = async ({
    content,
    published,
  }: {
    content: string;
    published: boolean;
  }) => {
    await postRef.update({
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <ImageUploader />
        <textarea
          {...register("content", {
            required: "content is required",
            maxLength: {
              value: 20000,
              message: "content is too long",
            },
            minLength: {
              value: 10,
              message: "content is too short",
            },
          })}
        ></textarea>
        {errors && errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <fieldset>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register("published", { required: false })}
          />
          <label>Published</label>
        </fieldset>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
