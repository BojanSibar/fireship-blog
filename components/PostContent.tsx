import Link from "next/link";
import ReactMarkdown from "react-markdown";
import convertFirebaseDateTime from "../libs/convertFirebaseDatetime";
import Post from "../types/PostFirebaseModel";

type Props = {
  post: Post;
};
// UI component for main post content
export default function PostContent({ post }: Props) {
  const createdAt = convertFirebaseDateTime(post.createdAt);

  return (
    <div className="card">
      <h1>{post?.title}</h1>
      <span className="text-sm">
        Written by{" "}
        <Link href={`/${post.username}/`}>
          <a className="text-info">@{post.username}</a>
        </Link>{" "}
        on {createdAt.toString()}
      </span>
      <ReactMarkdown>{post?.content}</ReactMarkdown>
    </div>
  );
}
