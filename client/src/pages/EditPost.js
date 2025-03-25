import { useEffect, useState } from "react";
import Editor from "../Editor";
import { Navigate, useParams } from "react-router-dom";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    // Fetch post data using the post ID
    useEffect(() => {
        fetch('http://localhost:4000/post/' + id)
            .then(response => {
                response.json().then(postInfo => {
                    setTitle(postInfo.title);
                    setContent(postInfo.content);
                    setSummary(postInfo.summary);
                });
            });
    }, [id]);

    // Update post function
    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if (files?.[0]) {
            data.set('file', files?.[0]);
        }

        const response = await fetch('http://localhost:4000/post', {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });

        if (response.ok) {
            setRedirect(true);
        }
    }

    // Redirect after successful update
    if (redirect) {
        return <Navigate to={`/post/${id}`} />;
    }

    // Component return with styling classes applied
    return (
        <form className="create-post-form fade-in" onSubmit={updatePost}>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
                className="input-field"
            />
            <input
                type="text"
                placeholder="Summary"
                value={summary}
                onChange={ev => setSummary(ev.target.value)}
                className="input-field"
            />
            <input
                type="file"
                onChange={ev => setFiles(ev.target.files)}
                className="file-upload"
            />
            <Editor onChange={setContent} value={content} />
            <button className="submit-btn" style={{ marginTop: '5px' }}>Update Post</button>
        </form>
    );
}