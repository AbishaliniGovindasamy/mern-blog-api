import { useEffect, useState } from "react";
import Post from "../post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:4000/post')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setPosts(data);
                } else {
                    throw new Error("Invalid JSON format received");
                }
            })
            .catch(err => {
                console.error("Error fetching posts:", err);
                setError(err.message);
            });
    }, []);

    return (
        <div className="post-list fade-in">
            {error ? (
                <p className="error-message">Error: {error}</p>
            ) : posts.length > 0 ? (
                posts.map(post => (
                    <div key={post.id || post._id} className="card">
                        <Post {...post} />
                    </div>
                ))
            ) : (
                <p>Welcome to BLOG APP!</p>
            )}
        </div>
    );
}
