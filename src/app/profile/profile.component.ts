import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
user:any;
guest:boolean;

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit() {
  	this.fetchUser(this.route.snapshot.paramMap.get('id'));
  }

  compare(a:any,b:any): any{
    return (((10*(b.views_count)) + (20*(b.comments.length)) + (30*(b.supporters.length))) - ((10*(a.views_count)) + (20*(a.comments.length)) + (30*(a.supporters.length))));
  }

  fetchUser(id: string): void{
  	this.http.get("/api/user/profile/" + id).subscribe((obj:any) => {
      obj.posts.sort(this.compare);
      this.user = obj;

      if(localStorage.getItem('auth_token') && localStorage.getItem('user')){
        this.guest = false;
      }

      else{
        this.guest = true;
      }

  	});
  }

  deletePost(id: string): void{
    this.http.delete("/api/post/" + id).subscribe((obj:any) => {
      obj.util.posts.sort(this.compare);
      this.user = obj.util;
      localStorage.setItem('user',obj.user);
    });
  }

}
