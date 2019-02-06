import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from '../post';

@Component({
  selector: 'app-forum-list',
  templateUrl: './forum-list.component.html',
  styleUrls: ['./forum-list.component.css']
})

export class ForumListComponent implements OnInit {
  posts:any;
  
  new_post: Post = {
    organization: "",
    long_description: "",
    short_description: "",
    image_url: "",
    location: "",
    address: "",
    website: "",
    field: ""
  };
  
  post:any;
  user:any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  	this.fetchPosts();
  }

  compare(a:any,b:any): any{
    return (((10*(b.views_count)) + (20*(b.comments.length)) + (30*(b.supporters.length))) - ((10*(a.views_count)) + (20*(a.comments.length)) + (30*(a.supporters.length))));
  }

  fetchPosts(): void{
  	this.http.get("/api/posts").subscribe((posts:any) => {
        posts.sort(this.compare);
        this.posts = posts;
    });
  }

  addPost(form: NgForm): void{
    this.user = JSON.parse(localStorage.getItem('user'));
    this.post = this.new_post;
    this.post.author = this.user._id;
    
    this.http.post("/api/post", this.post).subscribe((obj:any) => {
  		localStorage.setItem('user', JSON.stringify(obj.user));
      this.user = obj.user;
      this.fetchPosts();
      form.reset();
    });
  }

}
