import { getUserWithUsername, postToJSON } from "../../libs/firebase";
import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";

type Props = {
  query: any;
};

type UserProfilePageProps = {
  user: any;
  posts: any[];
};

export async function getServerSideProps({ query }: Props) {
  const { username } = query;

  const userDoc = await getUserWithUsername(username);

  // JSON serializable data
  let user = null;
  let posts = null;

  // If no user, short circuit to 404 page
  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  if (userDoc) {
    user = userDoc.data();
    const postsQuery = userDoc.ref
      .collection("posts")
      .where("published", "==", true)
      .orderBy("createdAt", "desc")
      .limit(5);
    posts = (await postsQuery.get()).docs.map(postToJSON);
  }

  return {
    props: { user, posts }, // will be passed to the page component as props
  };
}

export default function UserProfilePage({ user, posts }: UserProfilePageProps) {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}
