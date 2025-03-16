import { Navigate } from 'react-router-dom';
import { useState } from "react";
import 'react-quill/dist/quill.snow.css';
import Editor from '../Editor';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        if (files && files[0]) {
            data.set('file', files[0]);
        }

        try {
            const response = await fetch('http://localhost:4000/post', {
                method: 'POST',
                body: data,
                credentials: 'include',
            });
            if (response.ok) {
                setRedirect(true);
            } else {
                console.error('Failed to create post:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />;
    }

    return (
        <form className="create-post-form fade-in" onSubmit={createNewPost}>
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
            <Editor value={content} onChange={setContent} />
            <button className="submit-btn">Create Post</button>
        </form>
    );
}
