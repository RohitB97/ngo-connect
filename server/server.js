var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var cors = require("cors");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(__dirname));
var date, pwd, index;

mongoose.connect("mongodb://127.0.0.1:27017/forum");

var CommentSchema = new mongoose.Schema({
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'post'},
	comment: {type: String, required: true},
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
});

var UserSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	contact: {type: String, required: true},
	password: {type: String, required: true},
	designation: {type: String, required: true},
	team: {type: String, required: true},
	following: [{type: mongoose.Schema.Types.ObjectId, ref: 'post'}],
	posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'post'}]
});

var PostSchema = new mongoose.Schema({
	organization: {type: String, required: true},
	short_description: {type: String, required: true},
	long_description: {type: String, required: true},
	website: {type: String, required: true},
	address: {type: String, required: true},
	image_url: {type: String, required: true},
	supporters: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
	field: {type: String, required: true},
	location: {type: String, required: true},
	posted_on: {type: String, required: true},
	views_count: {type: Number, default: 0, required: true},
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comment'}]
});

var PostModel = new mongoose.model('post', PostSchema);
var CommentModel = new mongoose.model('comment', CommentSchema);
var UserModel = new mongoose.model('user', UserSchema);

app.get("/api/user/:token", function(req,res){
	jwt.verify(req.params.token,"ngoForum",function(err,decoded){
		if(err){
			console.log("Invalid Token");
			res.json({status: 'Failed', message: 'Unauthenticated request - Service denied'});
		}

		else{
			UserModel.findById(decoded._id, function(e,user){
				res.json(user);
			});
		}
	});
});

app.get("/api/user/profile/:_id", function(req,res){
	UserModel.findById(req.params._id).populate('following').populate('posts').exec(function(e,user){
		res.json(user);
	});
});

app.post("/api/user/signup", function(req,res){
	pwd = req.body.password;
	bcrypt.hash(pwd,10,function(err,hash){
		if(err){
			console.log("Hash issues");
			return;
		}
		
		req.body.password = hash;

		UserModel.create(req.body, function(e,user){
			res.json({status:true});
		});
	});
});

app.post("/api/user/login", function(req,res){
	UserModel.findOne({email: req.body.email}, function(err,user){
		if(err){
			console.log("Login query error");
			return;
		}

		if(user){
			bcrypt.compare(req.body.password,user.password,function(e,result){
				if(result){
					var token = jwt.sign({_id: user._id},"ngoForum",{});
					res.json({status:true, message: 'Authentication Success', auth_token: token});
				}

				else{
					res.json({status:false, message: 'Incorrect Password'});
				}
			});
		}

		else{
			res.json({status:false, message: 'User not found. Please sign up'});
		}
	});
});

app.get("/api/posts", function(req,res){
	PostModel.find(function(err,posts){
		res.json(posts);
	});
});

app.get("/api/post/:_id", function(req,res){
	PostModel.findById(req.params._id, function(err,post){
		post.views_count = post.views_count + 1;
		post.save(function(e,p1){
			PostModel.populate(p1,[{path:'author'},{path:'comments',populate:{path:'user'}}],function(e3,p2){
				res.json(p2);
			});
		});
	});
});

app.put("/api/post/support", function(req,res){
	UserModel.findById(req.body.user_id, function(error,user){
		user.following.push(req.body.post_id);
		user.save(function(err,u){
			PostModel.findById(req.body.post_id, function(er, post){
				post.supporters.push(u._id);
				post.save(function(e,p1){
					PostModel.populate(p1,[{path:'author'},{path:'comments',populate:{path:'user'}}],function(e3,p2){
						res.json({user:u, post:p2});
					});
				});
			});
		});
	});
});

app.put("/api/post/withdraw", function(req,res){
	UserModel.findById(req.body.user_id, function(error,user){
		index = user.following.indexOf(req.body.post_id);
		user.following.splice(index,1);
		user.save(function(err,u){
			PostModel.findById(req.body.post_id, function(er, post){
				index = post.supporters.indexOf(req.body.user_id);
				post.supporters.splice(index,1);
				post.save(function(e,p1){
					PostModel.populate(p1,[{path:'author'},{path:'comments',populate:{path:'user'}}],function(e3,p2){
						res.json({user:u, post:p2});
					});
				});
			});
		});
	});
});

app.post("/api/post", function(req,res){
	date = new Date();
	req.body.posted_on = date.getDate() + "-" + date.getMonth() + 1 + "-" + date.getFullYear();
	PostModel.create(req.body, function(error,post){
		if(error) console.log(error);
		UserModel.findById(post.author, function(err,user){
			user.posts.push(post._id);
			user.save(function(e,u){
				res.json({user:u, post:post});
			});
		});
	});
});

app.post("/api/comment", function(req,res){
	CommentModel.create(req.body, function(err,comment){
		PostModel.findById(comment.post, function(e1, post){
			post.comments.push(comment._id);
			post.save(function(e2,p1){
				PostModel.populate(p1,[{path:'author'},{path:'comments',populate:{path:'user'}}],function(e3,p2){
					res.json(p2);
				});
			});
		});
	});
});

app.delete("/api/post/:_id", function(req,res){
	PostModel.findByIdAndDelete(req.params._id, function(err,post){
		UserModel.findById(post.author, function(e1,user){
			index = user.posts.indexOf(req.params._id);
			user.posts.splice(index,1);
			user.save(function(e2,u){
				CommentModel.deleteMany({post: req.params._id}, function(e3){
					UserModel.populate(u,[{path:'posts'},{path:'following'}],function(e4,u1){
						res.json({user:u, util:u1});
					});
				});
			});
		});
	});
});

app.delete("/api/comment/:_id", function(req,res){
	CommentModel.findByIdAndDelete(req.params._id, function(e1,comment){
		PostModel.findById(comment.post, function(e2, post){
			index = post.comments.indexOf(req.params._id);
			post.comments.splice(index,1);
			post.save(function(e3,p1){
				PostModel.populate(p1,[{path:'author'},{path:'comments',populate:{path:'user'}}],function(e4,p2){
					res.json(p2);
				});
			});
		});
	});
});

app.get("*", function(req,res){
	res.sendFile(__dirname + "/index.html");
});

app.listen(3000);
console.log("Server running on port 3000");


