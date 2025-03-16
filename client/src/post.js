import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, cover, content, createdAt, author }) {
    return (
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img
                        src={`http://localhost:4000/${cover}`}
                        alt="Post Cover"
                    />
                </Link>
            </div>
            <div className="text">
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    <span className="author">{author?.username || "Unknown Author"}</span>
                    <time>{createdAt ? formatISO9075(new Date(createdAt)) : "Unknown Date"}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </div>
    );
}
