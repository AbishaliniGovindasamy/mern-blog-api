import { useContext, useEffect, useState } from "react";
import { formatISO9075 } from "date-fns";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "../usercontext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const { userInfo } = useContext(UserContext);
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:4000/post/${id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch post: ${response.statusText}`);
                }
                const data = await response.json();
                setPostInfo(data);
            } catch (error) {
                console.error("Error fetching post:", error.message);
            }
        };
        fetchData();
    }, [id]);

    if (!postInfo) {
        return <div className="fade-in">Loading...</div>;
    }

    return (
        <div className="post-page card fade-in">
            <h1>{postInfo.title}</h1>
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <div className="author">by @{postInfo.author.username}</div>
            {userInfo?.id === postInfo.author._id && (
                <div className="edit-row">
                    <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                        <FontAwesomeIcon icon={faPenToSquare} /> Edit This Post
                    </Link>
                </div>
            )}
            <div className="image">
                <img
                    src={`http://localhost:4000/${postInfo.cover || "default-cover.jpg"}`}
                    alt="Post Cover"
                />
            </div>
            <div
                className="content"
                dangerouslySetInnerHTML={{ __html: postInfo.content }}
            />
        </div>
    );
}
