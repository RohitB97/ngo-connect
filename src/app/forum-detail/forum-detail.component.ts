import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forum-detail',
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css']
})
export class ForumDetailComponent implements OnInit {
  text:string;
  new_comment:any;
  post:any;
  user:any;
  factor:any;
  guest:any;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
  	if(localStorage.getItem('auth_token') && localStorage.getItem('user')){
        this.guest = false;
    }

    else{
        this.guest = true;
    }

  	this.fetchPost(this.route.snapshot.paramMap.get('id'));
  }

  fetchPost(id: String): void{
  	this.http.get("/api/post/" + id).subscribe((post:any) => {
  		this.post = post;
  		
  		if(!this.guest){
  			this.user = JSON.parse(localStorage.getItem('user'));
  			
  			if(this.user.following.indexOf(this.post._id) != -1){
  				this.factor = true;
  			}

  			else{
  				this.factor = false;
  			}
  		}
  	});
  }

  addComment(form: NgForm): void{
  	this.new_comment = {};
  	this.new_comment.comment = this.text;
  	this.new_comment.post = this.post._id;
  	this.new_comment.user = this.user._id;
  	
  	this.http.post("/api/comment", this.new_comment).subscribe((obj) => {
  		this.post = obj;
  		form.reset();
  	});
  }

  support(): void{
  	this.http.put("/api/post/support", {user_id: this.user._id, post_id: this.post._id}).subscribe((obj:any) => {
  		localStorage.setItem('user', JSON.stringify(obj.user));
  		this.user = obj.user;
  		this.post = obj.post;
  		this.factor = true;
  	});
  }

  withdraw(): void{
  	this.http.put("/api/post/withdraw", {user_id: this.user._id, post_id: this.post._id}).subscribe((obj:any) => {
  		localStorage.setItem('user', JSON.stringify(obj.user));
  		this.user = obj.user;
  		this.post = obj.post;
  		this.factor = false;
  	});
  }
}
