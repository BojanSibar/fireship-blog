import styles from "../../styles/Post.module.css";
import PostContent from "../../components/PostContent";
import {
  firestore,
  getUserWithUsername,
  postToJSON,
} from "../../libs/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import PostModel from "../../types/PostFirebaseModel";
import AuthCheck from "../../components/AuthCheck";
import Link from "next/link";
import HeartButton from "../../components/HeartButton";
import { postConverter } from "../../libs/firebaseModels";

type StaticProps = {
  params: {
    username: string;
    slug: string;
  };
};

export async function getStaticProps({ params }: StaticProps) {
  const { username, slug } = params;

  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = userDoc.ref.collection("posts").doc(slug);
    post = postToJSON(await postRef.get());

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  // Improve my using Admin SDK to select empty docs
  const snapshot = await firestore.collectionGroup("posts").get();

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data() as PostModel;
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    fallback: "blocking",
  };
}

type PostProps = {
  path: string;
  post: PostModel;
};

export default function Post(props: PostProps) {
  const postRef = firestore.doc(props.path).withConverter(postConverter);
  const [realtimePost] = useDocumentData<PostModel>(postRef as any);

  const post = realtimePost || props.post;

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>

      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} 🤍</strong>
        </p>
        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
