import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import API from "../api";
import PostCard from "../components/PostCard";
import PostForm from "../components/PostForm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const location = useLocation();
  const userIdFilter = useMemo(() => new URLSearchParams(location.search).get("userId"), [location.search]);

  const fetchPosts = async () => {
    const res = await API.get("/posts");
    setPosts(res.data);
  };

  const fetchMe = async () => {
    try {
      const res = await API.get("/auth/me");
      setCurrentUserId(res.data._id || res.data.id);
    } catch (_) {}
  };

  useEffect(() => {
    fetchMe();
    fetchPosts();
  }, []);

  const visiblePosts = useMemo(
    () =>
      posts.filter((p) => {
        if (!userIdFilter) return true;
        const pid = String(p.createdBy?._id || p.createdBy?.id || "");
        return pid === String(userIdFilter);
      }),
    [posts, userIdFilter]
  );

  return (
    <>
      <Navbar />
      <div className="feed-container">
        {!userIdFilter && (
          <div id="create-post">
            <PostForm onPostCreated={fetchPosts} />
          </div>
        )}
        {visiblePosts.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={currentUserId} onUpdate={fetchPosts} />
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Feed;
