import React, { useState, useRef, useEffect } from "react";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import CommentIcon from '@mui/icons-material/Comment';

import { Avatar, Grid, Paper } from "@material-ui/core";
import { Drawer, InputBase } from "@mui/material";
import { Close } from "@mui/icons-material";
import { AddCircle } from "@mui/icons-material";
import { v4 as uuid } from "uuid";
import DonateBox from "./DonateBox";
import ShareBtn from "./ShareBtn";
import { isFavorite, NEAR_ICON_IMG, toggleFavorite } from "../utils";
import LoginBtn from "./LoginBtn";
// import ReactWebMediaPlayer from 'react-web-media-player';




function getDateFromTimeStamp(unixTimeStamp) {
    let date = new Date(unixTimeStamp);
    return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
}

export default function PostCard(props) {
    const [post, setPost] = useState({});
    const [expandComment, setExpandComment] = React.useState(false);
    const [donate, setDonate] = React.useState(false);

    //comment feature
    const openCommentSection = () => {
        setExpandComment(!expandComment);
        
    }
    const openDonateSection = () => {
        setDonate(true);
        
    }

    const inputRef = useRef(null);
    const [cmts, setCmts] = useState([]);

    useEffect(() => {
        setCmts(props.cmts);
        setPost(props.post);
        console.log("posts ", props.post, props.cmts);
    }, []);


    function addComment() {
        var inputCmt = inputRef.current.value;
        if (inputCmt.trim(0).length == 0) return;
        

        var cmt2 = Array.from(cmts);

        const cmtObject = {
            "id": uuid(),
            "uid": window.accountId,
            "cmt": inputRef.current.value,
            "t": Date.now()
        };

        setCmts([cmtObject, ...cmts]);
        inputRef.current.value = "";
        window.contract.setComment({ postId: post.id, commentId: cmtObject.id, commentObject: JSON.stringify(cmtObject) })
            .then(ob => {
                console.log("add cmt success", ob);
            })
            .catch(err => {
                console.log("add cmt err", err);
            })
        console.log(cmts);
    }
    function postThumbnail() {
        if (post.type == "basic") {
            return (
                <CardMedia
                    component="img"
                    height="auto"
                    sx={{ maxHeight: "500px" }}
                    image={post.media}
                    alt={post.title}
                />
            )
        }

        if (post.type == "media") {
            return (
                <video controls loop
                    height="auto"
                    src={post.media} >{post.title}</video>
            )
        }
    }

    function commentInput() {
        if (window.accountId)
            return (
                <Paper style={{ padding: "15px", position: "fixed", bottom: "50px", zIndex: 9999, width: "100%" }} className="comment-post">
                    <Grid container wrap="nowrap" spacing={2}>
                        <InputBase inputRef={inputRef}
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Leave a comment"
                        />
                        <IconButton type="button" onClick={() => { addComment() }} sx={{ p: '10px' }}>
                            <AddCircle />
                        </IconButton>
                    </Grid>
                </Paper>
            )
        return (
            <Paper style={{ padding: "15px", position: "fixed", bottom: "50px", zIndex: 9999, width: "100%" }} className="comment-post">
                <Grid container wrap="nowrap" spacing={2}>
                    <LoginBtn />
                </Grid>
            </Paper>
        )
    }

    return (

        <Card variant="outlined" sx={{ maxWidth: "auto" }}>
            <CardHeader
                avatar={
                    <a href={`/@${post.author}`} title={post.author}>
                        <Avatar sx={{ bgcolor: red[500] }}>
                        {post.author}
                        </Avatar>
                    </a>
                }

                title={post.title}
                subheader={getDateFromTimeStamp(post.date)}
            />

            {postThumbnail()}
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    <a href={`/@${post.author}/p${post.id}`} >
                        {post.desc}
                    </a>
                </Typography>
            </CardContent>

            <CardActions disableSpacing className="btn-wrap">

                <IconButton aria-label="add to favorites" onClick={() => { toggleFavorite(post.id, post) }} style={{ color: isFavorite(post.id) ? "red" : "auto" }} >
                    <FavoriteIcon />
                </IconButton>

                <div className="home-share-btn">
                    <ShareBtn link={`/@${post.author}/p${post.id}`} />
                </div>

                <IconButton aria-label='comment' onClick={openCommentSection}>
                    <CommentIcon />
                </IconButton>

                <IconButton className="donate-btn" aria-label="donate" onClick={openDonateSection}>
                    <img src={NEAR_ICON_IMG} />
                </IconButton>
            </CardActions>
            {/* donate section   */}
            <DonateBox setOpen={setDonate} open={donate} receiver={post.author} />
            {/* end donate section  */}

            {/* comment section  */}
            <div className="comments-section" sx={{ padding: 14, height: "50%", padding: 14, height: "50%", maxWidth: "750px", paddingBottom: "50px", margin: "auto" }}>
                <Drawer anchor="bottom" open={expandComment} className="comment-wrapper"
                    sx={{ padding: 14, height: "50%", maxWidth: "750px", paddingBottom: "50px", margin: "auto" }}
                    ModalProps={{
                        keepMounted: true,
                    }} >

                    <div className="comment-header" style={{ position: "fixed" }}>
                        <IconButton onClick={() => setExpandComment(false)}>
                            <Close />
                        </IconButton>
                    </div>

                    {commentInput()}

                    <div style={{ paddingBottom: "25px", paddingTop: "25px" }}></div>

                    {
                        Array.from(cmts).map((e) => (
                            <Paper style={{ padding: "20px 20px" }} key={Math.random()} >
                                <Grid container wrap="nowrap" spacing={2}>

                                    <Grid item>
                                        <Avatar alt={e.id}> {e.uid.substring(0, 3)} </Avatar>
                                    </Grid>

                                    <Grid item xs zeroMinWidth>
                                        <h4 className="cmtUid" style={{ margin: 0, textAlign: "left" }}>{e.uid}</h4>
                                        <p className="cmtContent" style={{ textAlign: "left" }}>{e.cmt}</p>
                                        <p className="cmtPostedAt" style={{ textAlign: "left", color: "gray", fontSize: "70%" }}>
                                            posted at: {getDateFromTimeStamp(e.t)}
                                        </p>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))
                    }


                </Drawer>




            </div>
            {/* end comment section  */}
        </Card>

    );
}
