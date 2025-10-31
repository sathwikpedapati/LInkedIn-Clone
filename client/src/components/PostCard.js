import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  TextField,
  Stack,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PostCard = ({ post, onUpdate, currentUserId }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: post.title, description: post.description });
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef(null);

  useEffect(() => {
    setLikeCount(post.likes?.length || 0);
    setLiked(false);
    loadComments();
  }, [post._id]);

  const loadComments = async () => {
    try {
      const res = await API.get(`/posts/${post._id}/comments`);
      setComments(res.data);
    } catch (_) {}
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${post._id}`);
      onUpdate();
    } catch (_) {}
  };

  const toggleLike = async () => {
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setLikeCount(res.data.likes?.length || 0);
      setLiked((v) => !v);
    } catch (_) {}
  };

  const submitEdit = async () => {
    try {
      await API.put(`/posts/${post._id}`, editForm);
      setEditing(false);
      onUpdate();
    } catch (_) {}
  };

  const addComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    try {
      await API.post(`/posts/${post._id}/comments`, { text });
      setCommentText("");
      await loadComments();
    } catch (_) {}
  };

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: 3,
        backgroundColor: "background.paper",
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            component={RouterLink}
            to={String(post.createdBy?._id) === String(currentUserId) ? "/profile" : `/feed?userId=${post.createdBy?._id || ""}`}
            src={post.createdBy?.profilePic}
          >
            {post.createdBy?.username?.[0]?.toUpperCase() || "U"}
          </Avatar>
        }
        title={editing ? (
          <TextField
            size="small"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            fullWidth
          />
        ) : (
          post.title
        )}
        subheader={`@${post.createdBy?.username || "Unknown"}`}
      />

      {post.coverImage && (
        <CardMedia
          component="img"
          height="220"
          image={post.coverImage}
          alt="cover"
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent>
        {editing ? (
          <TextField
            multiline
            minRows={3}
            fullWidth
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
        ) : (
          <Typography variant="body1" color="text.primary">
            {post.description}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant={liked ? "contained" : "outlined"}
            size="small"
            startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={toggleLike}
          >
            {likeCount}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={() => commentInputRef.current?.focus()}
          >
            {comments.length}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          {String(post.createdBy?._id) === String(currentUserId) && (
            editing ? (
              <>
                <Button variant="contained" size="small" onClick={submitEdit}>Save</Button>
                <Button variant="text" size="small" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : (
              <>
                <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete</Button>
              </>
            )
          )}
        </Stack>
      </CardActions>

      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
        <Stack spacing={1} sx={{ mb: 1 }}>
          {comments.map((c) => (
            <Typography key={c._id} variant="body2">
              <strong>{c.user?.username || "User"}:</strong> {c.text}
            </Typography>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            fullWidth
            inputRef={commentInputRef}
          />
          <Button variant="contained" size="small" onClick={addComment}>Post</Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PostCard;
