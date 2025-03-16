import './App.css';
import { Route, Routes } from "react-router-dom";
import Layout from './layout';
import IndexPage from './pages/indexpage';
import LoginPage from './pages/loginpage';
import RegisterPage from './pages/register';
import CreatePost from './pages/CreatePost';
import { UserContextProvider } from './usercontext';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';

function App() {
    return (
        <UserContextProvider>
            <div className="page-container fade-in">
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<IndexPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="create" element={<CreatePost />} />
                        <Route path="post/:id" element={<PostPage />} />
                        <Route path="edit/:id" element={<EditPost />} />
                    </Route>
                </Routes>
            </div>
        </UserContextProvider>
    );
}

export default App;
